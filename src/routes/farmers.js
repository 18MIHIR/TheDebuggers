const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM farmers');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/register', async (req, res) => {
  const { phone, name, village, district } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO farmers(phone,name,village,district) VALUES($1,$2,$3,$4) RETURNING *',
      [phone, name, village, district]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;