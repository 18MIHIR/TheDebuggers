const express = require('express');
const router = express.Router();
const db = require('../db');
const { notifyOperator, sendBookingConfirmation, sendBookingRejection } = require('../services/notificationService');

// Get all bookings
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT b.*, 
             f.name as farmer_name, f.phone as farmer_phone,
             cs.name as store_name, cs.address as store_address,
             cs.operator_phone,
             hs.crop_name, hs.spoilage_risk, hs.predicted_shelf_hours as shelf_hours
      FROM bookings b
      JOIN farmers f ON f.id = b.farmer_id
      JOIN cold_stores cs ON cs.id = b.cold_store_id
      LEFT JOIN harvest_submissions hs ON hs.id = b.harvest_id
      ORDER BY b.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get pending bookings (for operator dashboard)
router.get('/pending', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT b.*, 
             f.name as farmer_name, f.phone as farmer_phone,
             cs.name as store_name, cs.operator_phone,
             hs.crop_name, hs.spoilage_risk, hs.predicted_shelf_hours as shelf_hours
      FROM bookings b
      JOIN farmers f ON f.id = b.farmer_id
      JOIN cold_stores cs ON cs.id = b.cold_store_id
      LEFT JOIN harvest_submissions hs ON hs.id = b.harvest_id
      WHERE b.status = 'PENDING'
      ORDER BY b.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new booking
router.post('/', async (req, res) => {
  const { harvest_id, cold_store_id, farmer_id, booking_date, duration_days, quantity_kg, total_cost } = req.body;
  try {
    const receipt = 'KCC-' + Date.now();

    // Get farmer and store details for notification
    const farmerResult = await db.query('SELECT * FROM farmers WHERE id=$1', [farmer_id]);
    const storeResult = await db.query('SELECT * FROM cold_stores WHERE id=$1', [cold_store_id]);
    const harvestResult = harvest_id 
      ? await db.query('SELECT * FROM harvest_submissions WHERE id=$1', [harvest_id])
      : { rows: [{}] };

    const farmer = farmerResult.rows[0];
    const store = storeResult.rows[0];
    const harvest = harvestResult.rows[0];

    // Create booking
    const result = await db.query(
      'INSERT INTO bookings(harvest_id,cold_store_id,farmer_id,booking_date,duration_days,quantity_kg,total_cost,receipt_number) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [harvest_id, cold_store_id, farmer_id, booking_date, duration_days, quantity_kg, total_cost, receipt]
    );

    const booking = {
      ...result.rows[0],
      farmer_name: farmer.name,
      farmer_phone: farmer.phone,
      store_name: store.name,
      store_address: store.address,
      operator_phone: store.operator_phone,
      crop_name: harvest.crop_name,
      spoilage_risk: harvest.spoilage_risk,
      shelf_hours: harvest.predicted_shelf_hours
    };

    // Notify operator via WhatsApp
    await notifyOperator(store.operator_phone, booking);

    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Confirm booking (operator approves)
router.post('/:id/confirm', async (req, res) => {
  try {
   const result = await db.query(`
  UPDATE bookings SET status='CONFIRMED' WHERE receipt_number=$1 RETURNING *
`, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = result.rows[0];

    // Get farmer and store details
    const farmer = await db.query('SELECT * FROM farmers WHERE id=$1', [booking.farmer_id]);
    const store = await db.query('SELECT * FROM cold_stores WHERE id=$1', [booking.cold_store_id]);

    // Update cold store capacity
    await db.query(
      'UPDATE cold_stores SET used_capacity = used_capacity + $1 WHERE id=$2',
      [Math.ceil(booking.quantity_kg / 1000), booking.cold_store_id]
    );

    // Send confirmation to farmer
    await sendBookingConfirmation(farmer.rows[0].phone, {
      ...booking,
      store_name: store.rows[0].name,
      store_address: store.rows[0].address
    });

    res.json({ success: true, booking: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reject booking
router.post('/:id/reject', async (req, res) => {
  try {
    const { reason } = req.body;
    const result = await db.query(
      'UPDATE bookings SET status=$1 WHERE id=$2 OR receipt_number=$2 RETURNING *',
      ['REJECTED', req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = result.rows[0];
    const farmer = await db.query('SELECT * FROM farmers WHERE id=$1', [booking.farmer_id]);
    const store = await db.query('SELECT * FROM cold_stores WHERE id=$1', [booking.cold_store_id]);

    // Send rejection to farmer
    await sendBookingRejection(farmer.rows[0].phone, {
      ...booking,
      store_name: store.rows[0].name
    }, reason);

    res.json({ success: true, booking: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;