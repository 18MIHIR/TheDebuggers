const db = require('../db');

const EARTH_RADIUS_KM = 6371;

function haversineDistance(lat1, lon1, lat2, lon2) {
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

async function findNearestStores(location, quantityKg) {
  try {
    const stores = await db.query(
      'SELECT * FROM cold_stores WHERE is_active=true'
    );
    return stores.rows.slice(0, 3).map(s => ({
      ...s,
      distanceKm: 10,
      availableCapacity: s.total_capacity - s.used_capacity
    }));
  } catch (err) {
    console.error('Error finding stores:', err);
    return [];
  }
}

async function findTransportPool(farmerId, coldStoreId) {
  try {
    const result = await db.query(
      'SELECT COUNT(*) as count FROM transport_slots ts JOIN transport_jobs tj ON tj.id=ts.job_id WHERE tj.cold_store_id=$1 AND tj.status=$2',
      [coldStoreId, 'OPEN']
    );
    return { count: parseInt(result.rows[0].count) };
  } catch (err) {
    return { count: 0 };
  }
}

module.exports = { findNearestStores, findTransportPool, haversineDistance };