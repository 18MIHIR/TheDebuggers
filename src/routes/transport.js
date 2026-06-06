const express = require('express');
const router = express.Router();
const db = require('../db');
const { matchTransportPool, getPoolDetails } = require('../services/transportPooling');
const { notifyFarmer } = require('../services/notificationService');

// Get all transport jobs
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT tj.*, 
             cs.name as store_name,
             COUNT(ts.id) as farmer_count,
             COALESCE(SUM(ts.quantity_kg), 0) as filled_kg
      FROM transport_jobs tj
      LEFT JOIN cold_stores cs ON cs.id = tj.cold_store_id
      LEFT JOIN transport_slots ts ON ts.job_id = tj.id
      GROUP BY tj.id, cs.name
      ORDER BY tj.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Match farmer to transport pool
router.post('/match', async (req, res) => {
  const { farmer_id, cold_store_id, pickup_date, quantity_kg } = req.body;
  try {
    // Get farmer location
    const farmer = await db.query('SELECT * FROM farmers WHERE id=$1', [farmer_id]);
    if (farmer.rows.length === 0) {
      return res.status(404).json({ error: 'Farmer not found' });
    }

    const { lat, lng } = farmer.rows[0];
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Farmer location not set' });
    }

    const result = await matchTransportPool(
      farmer_id, lat, lng,
      cold_store_id, pickup_date, quantity_kg
    );

    // Get pool details
    const poolDetails = await getPoolDetails(result.jobId);

    // Notify farmer about pool
    const store = await db.query('SELECT * FROM cold_stores WHERE id=$1', [cold_store_id]);
    
    let notification = '';
    if (result.isNew) {
      notification = 
`🚛 Transport Job Created!

Your produce will be picked up on ${pickup_date}
Destination: ${store.rows[0].name}

Waiting for more farmers to join your pool.
You will be notified when transport is confirmed.

Current pool: 1 farmer
Estimated cost: ₹3,000`;
    } else {
      notification = 
`🚛 Added to Transport Pool!

Pool size: ${result.poolSize} farmers
Your pickup position: ${poolDetails.farmers.findIndex(f => f.farmer_id === farmer_id) + 1} of ${result.poolSize}
Destination: ${store.rows[0].name}
Date: ${pickup_date}

💰 Cost savings:
Private truck: ₹3,000
Your share: ₹${result.sharedCost}
You save: ₹${result.savings}!

Pickup route optimised automatically.
You will receive pickup time 24hrs before.`;
    }

    await notifyFarmer(farmer.rows[0].phone, notification);

    res.json({
      success: true,
      ...result,
      poolDetails
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get pool details
router.get('/:jobId/details', async (req, res) => {
  try {
    const details = await getPoolDetails(req.params.jobId);
    res.json(details);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lock route and notify all farmers
router.post('/:jobId/lock', async (req, res) => {
  try {
    const { jobId } = req.params;
    const details = await getPoolDetails(jobId);

    // Update job status
    await db.query(
      'UPDATE transport_jobs SET status=$1 WHERE id=$2',
      ['LOCKED', jobId]
    );

    // Notify all farmers in pool
    for (let i = 0; i < details.farmers.length; i++) {
      const farmer = details.farmers[i];
      const message = 
`✅ Transport Confirmed!

📍 Your pickup: Stop ${farmer.pickup_sequence} of ${details.totalFarmers}
📅 Date: ${details.job.pickup_date}
🏪 Destination: Cold store confirmed
👥 Farmers in pool: ${details.totalFarmers}
⚖️ Total produce: ${details.totalQuantity}kg

Keep your produce ready at:
${farmer.village}

Driver will contact you 1 hour before pickup.`;

      await notifyFarmer(farmer.phone, message);
    }

    res.json({ success: true, farmersNotified: details.totalFarmers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;