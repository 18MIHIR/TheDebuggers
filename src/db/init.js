const db = require('../db');

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS farmers (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100),
  village VARCHAR(100),
  district VARCHAR(100),
  lat DECIMAL(10, 6),
  lng DECIMAL(10, 6),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cold_stores (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  district VARCHAR(100),
  address TEXT,
  lat DECIMAL(10, 6),
  lng DECIMAL(10, 6),
  price_per_day DECIMAL(10, 2) DEFAULT 8.50,
  total_capacity INTEGER DEFAULT 500,
  used_capacity INTEGER DEFAULT 0,
  reliability_score DECIMAL(3, 1) DEFAULT 4.5,
  min_temp INTEGER DEFAULT 2,
  max_temp INTEGER DEFAULT 8,
  is_active BOOLEAN DEFAULT true,
  operator_phone VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS harvest_submissions (
  id SERIAL PRIMARY KEY,
  farmer_id INTEGER REFERENCES farmers(id),
  crop_name VARCHAR(50),
  quantity_kg INTEGER,
  harvest_time TIMESTAMPTZ,
  current_temp DECIMAL(5, 2),
  humidity DECIMAL(5, 2),
  spoilage_risk VARCHAR(20),
  predicted_shelf_hours DECIMAL(6, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  harvest_id INTEGER REFERENCES harvest_submissions(id),
  cold_store_id INTEGER REFERENCES cold_stores(id),
  farmer_id INTEGER REFERENCES farmers(id),
  booking_date DATE,
  duration_days INTEGER DEFAULT 7,
  quantity_kg INTEGER,
  total_cost DECIMAL(12, 2),
  receipt_number VARCHAR(50) UNIQUE,
  status VARCHAR(20) DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transport_jobs (
  id SERIAL PRIMARY KEY,
  pickup_date DATE,
  cold_store_id INTEGER REFERENCES cold_stores(id),
  total_capacity_kg INTEGER DEFAULT 5000,
  status VARCHAR(20) DEFAULT 'OPEN',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transport_slots (
  id SERIAL PRIMARY KEY,
  job_id INTEGER REFERENCES transport_jobs(id),
  farmer_id INTEGER REFERENCES farmers(id),
  quantity_kg INTEGER,
  pickup_sequence INTEGER DEFAULT 1,
  confirmed BOOLEAN DEFAULT false
);
`;

async function seedData() {
  const { rows } = await db.query('SELECT COUNT(*)::int AS count FROM cold_stores');
  if (rows[0].count > 0) return;

  await db.query(`
    INSERT INTO cold_stores (name, district, address, lat, lng, price_per_day, total_capacity, used_capacity, reliability_score, min_temp, max_temp, operator_phone) VALUES
    ('Shri Ram Cold Storage', 'Sehore', 'Main Road, Ashta', 23.0195, 76.9192, 8.50, 500, 120, 4.8, 2, 8, '+919876543210'),
    ('Madhya Pradesh Cold Hub', 'Bhopal', 'Mandideep Industrial Area', 23.1038, 77.5422, 7.80, 800, 200, 4.6, 0, 5, '+919876543211'),
    ('Vidisha Agri Storage', 'Vidisha', 'NH-86, Vidisha', 23.5251, 77.8096, 9.00, 350, 80, 4.5, 2, 10, '+919876543212'),
    ('Hoshangabad Cold Chain', 'Hoshangabad', 'Itarsi Road', 22.7512, 77.7266, 8.00, 450, 150, 4.4, 2, 8, '+919876543213'),
    ('Raisen Farmers Store', 'Raisen', 'Raisen Town', 23.3316, 77.7879, 7.50, 300, 60, 4.3, 2, 8, '+919876543214')
  `);

  await db.query(`
    INSERT INTO farmers (phone, name, village, district, lat, lng) VALUES
    ('9876543210', 'Ramesh Verma', 'Ashta', 'Sehore', 23.0195, 76.9192),
    ('9876543211', 'Sunita Devi', 'Nasrullaganj', 'Sehore', 22.6870, 77.2567),
    ('9876543212', 'Mohan Patel', 'Sanchi', 'Raisen', 23.4793, 77.7350)
    ON CONFLICT (phone) DO NOTHING
  `);

  console.log('Database seeded with demo cold stores and farmers');
}

async function initDatabase() {
  await db.query(SCHEMA_SQL);
  await seedData();
  console.log('Database schema ready');
}

module.exports = { initDatabase };
