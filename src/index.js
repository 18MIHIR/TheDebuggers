const express = require('express'); 
const cors = require('cors'); 
const helmet = require('helmet'); 
const morgan = require('morgan'); 
require('dotenv').config(); 
 
const app = express(); 
app.use(cors()); 
app.use(helmet()); 
app.use(morgan('dev')); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: false })); 
 
// Import routes (we will create these files next) 
app.use('/api/farmers',    require('./routes/farmers')); 
app.use('/api/coldstores', require('./routes/coldstores')); 
app.use('/api/bookings',   require('./routes/bookings')); 
app.use('/api/transport',  require('./routes/transport')); 
app.use('/api/sms',        require('./routes/sms'));  // Twilio webhook 
 
app.get('/health', (req, res) => res.json({ status: 'ok' })); 

const { initDatabase } = require('./db/init');

initDatabase()
  .then(() => {
    app.listen(process.env.PORT || 3001, () => {
      console.log('Kisan Cold Chain API running on port 3001');
    });
  })
  .catch(err => {
    console.error('Failed to initialize database:', err.message);
    process.exit(1);
  }); 