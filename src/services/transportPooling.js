const db = require('../db');

const EARTH_RADIUS_KM = 6371;
const POOL_RADIUS_KM = 15;

function haversineDistance(lat1, lon1, lat2, lon2) {
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2)**2 + 
    Math.cos(lat1 * Math.PI/180) * 
    Math.cos(lat2 * Math.PI/180) * 
    Math.sin(dLon/2)**2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

async function optimiseRoute(jobId) {
  const slots = await db.query(`
    SELECT ts.*, f.lat, f.lng, f.name, f.phone
    FROM transport_slots ts 
    JOIN farmers f ON f.id = ts.farmer_id 
    WHERE ts.job_id = $1
  `, [jobId]);

  let farmers = slots.rows.filter(f => f.lat && f.lng);
  if (farmers.length <= 1) return farmers;

  let route = [];
  let unvisited = [...farmers];
  let current = unvisited.shift();
  route.push(current);

  while (unvisited.length > 0) {
    let nearest = unvisited.reduce((best, f) => {
      const d = haversineDistance(current.lat, current.lng, f.lat, f.lng);
      return d < best.dist ? { f, dist: d } : best;
    }, { f: null, dist: Infinity });

    route.push(nearest.f);
    current = nearest.f;
    unvisited = unvisited.filter(f => f.id !== nearest.f.id);
  }

  // Update sequence in DB
  for (let i = 0; i < route.length; i++) {
    await db.query(
      'UPDATE transport_slots SET pickup_sequence=$1 WHERE id=$2',
      [i + 1, route[i].id]
    );
  }

  return route;
}

async function matchTransportPool(farmerId, farmerLat, farmerLng, coldStoreId, pickupDate, quantityKg) {
  try {
    // Find open jobs going to same cold store on same date
    const jobs = await db.query(`
      SELECT 
        tj.*,
        COALESCE(SUM(ts.quantity_kg), 0) as filled_kg,
        json_agg(
          json_build_object(
            'lat', f.lat,
            'lng', f.lng,
            'name', f.name,
            'farmer_id', f.id
          )
        ) FILTER (WHERE f.id IS NOT NULL) as farmer_locations
      FROM transport_jobs tj
      LEFT JOIN transport_slots ts ON ts.job_id = tj.id
      LEFT JOIN farmers f ON f.id = ts.farmer_id
      WHERE tj.cold_store_id = $1 
        AND tj.pickup_date = $2 
        AND tj.status = 'OPEN'
      GROUP BY tj.id
      HAVING (tj.total_capacity_kg - COALESCE(SUM(ts.quantity_kg), 0)) >= $3
    `, [coldStoreId, pickupDate, quantityKg]);

    // Find compatible job where farmer is within 5km of existing farmers
    let compatibleJob = null;

    for (const job of jobs.rows) {
      if (!job.farmer_locations) continue;

      const isNearby = job.farmer_locations.some(fl => {
        if (!fl.lat || !fl.lng) return false;
        const dist = haversineDistance(farmerLat, farmerLng, fl.lat, fl.lng);
        return dist <= POOL_RADIUS_KM;
      });

      if (isNearby) {
        compatibleJob = job;
        break;
      }
    }

    if (compatibleJob) {
      // Add farmer to existing job
      const existingCount = compatibleJob.farmer_locations 
        ? compatibleJob.farmer_locations.length 
        : 0;

      await db.query(
        'INSERT INTO transport_slots(job_id, farmer_id, quantity_kg, pickup_sequence, confirmed) VALUES($1,$2,$3,$4,true)',
        [compatibleJob.id, farmerId, quantityKg, existingCount + 1]
      );

      // Recalculate optimal route
      const optimisedRoute = await optimiseRoute(compatibleJob.id);

      // Calculate cost savings
      const totalFarmers = existingCount + 1;
      const privateCost = 3000;
      const sharedCost = Math.round(privateCost / totalFarmers);
      const savings = privateCost - sharedCost;

      return {
        jobId: compatibleJob.id,
        isNew: false,
        poolSize: totalFarmers,
        sharedCost,
        savings,
        route: optimisedRoute
      };

    } else {
      // Create new transport job
      const job = await db.query(`
        INSERT INTO transport_jobs(pickup_date, cold_store_id, total_capacity_kg, status) 
        VALUES($1, $2, 5000, 'OPEN') 
        RETURNING *
      `, [pickupDate, coldStoreId]);

      await db.query(
        'INSERT INTO transport_slots(job_id, farmer_id, quantity_kg, pickup_sequence, confirmed) VALUES($1,$2,$3,1,true)',
        [job.rows[0].id, farmerId, quantityKg]
      );

      return {
        jobId: job.rows[0].id,
        isNew: true,
        poolSize: 1,
        sharedCost: 3000,
        savings: 0,
        route: []
      };
    }
  } catch (err) {
    console.error('Transport pooling error:', err);
    throw err;
  }
}

async function getPoolDetails(jobId) {
  const job = await db.query('SELECT * FROM transport_jobs WHERE id=$1', [jobId]);
  const slots = await db.query(`
    SELECT ts.*, f.name, f.phone, f.village, f.lat, f.lng
    FROM transport_slots ts
    JOIN farmers f ON f.id = ts.farmer_id
    WHERE ts.job_id = $1
    ORDER BY ts.pickup_sequence
  `, [jobId]);

  return {
    job: job.rows[0],
    farmers: slots.rows,
    totalFarmers: slots.rows.length,
    totalQuantity: slots.rows.reduce((sum, s) => sum + s.quantity_kg, 0)
  };
}

module.exports = { matchTransportPool, optimiseRoute, getPoolDetails, haversineDistance };