// const express = require('express'); 
// const axios = require('axios');
// const router = express.Router(); 
// const twilio = require('twilio'); 
// const db = require('../db');  // your PostgreSQL connection 
// const aiService = require('../services/aiService'); 
// const matchingService = require('../services/matchingService'); 
const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const db = require('../db');
const axios = require('axios');
const aiService = require('../services/aiService');
const matchingService = require('../services/matchingService');
const { getWeatherForLocation } = require('../services/weatherService');
const { getMandiRates } = require('../services/mandiService');
const { formatCareMessage } = require('../services/cropCareService');
 
// Twilio calls this URL whenever a farmer sends an SMS 
router.post('/incoming', async (req, res) => { 
  const twiml = new twilio.twiml.MessagingResponse(); 
  const farmerPhone = req.body.From.replace('whatsapp:', '').substring(0, 15);
  const message = req.body.Body.trim().toUpperCase(); 
 
  try { 
    if (message.startsWith('KISAN')) { 
      const reply = await handleHarvestSMS(farmerPhone, message); 
      twiml.message(reply); 
  } else if (message === 'YES') { 
      const reply = await handleBookingConfirmation(farmerPhone); 
      twiml.message(reply); 
    } else if (message === 'INFO') { 
      const reply = await sendMoreStores(farmerPhone); 
      twiml.message(reply); 
    } else if (message === 'HELP') { 
      twiml.message(getHelpMessage()); 
    }
    else if (message === 'CARE') {
  // Get last crop from database for this farmer
  const lastHarvest = await db.query(
    'SELECT crop_name FROM harvest_submissions WHERE farmer_id=(SELECT id FROM farmers WHERE phone=$1) ORDER BY created_at DESC LIMIT 1',
    [farmerPhone]
  );
  const crop = lastHarvest.rows.length > 0 ? lastHarvest.rows[0].crop_name : 'TOMATO';
  twiml.message(formatCareMessage(crop));}
    else if (message.startsWith('CONFIRM')) {
  const receiptNumber = message.split(' ')[1];
  const reply = await handleOperatorConfirm(receiptNumber);
  twiml.message(reply);

} else if (message.startsWith('REJECT')) {
  const receiptNumber = message.split(' ')[1];
  const reply = await handleOperatorReject(receiptNumber);
  twiml.message(reply);
} else { 
      twiml.message('KISAN BOT: Send KISAN [crop] [kg] [town] to register harvest. Example: KISAN TOMATO 150 HOSHANGABAD. Send HELP for all commands.'); 
    } 
  } catch (err) { 
    twiml.message('Error processing request. Please try again. Code: ' + err.message); 
  } 
 
  res.type('text/xml'); 
  res.send(twiml.toString()); 
}); 
 
// async function getWeatherForLocation(location) {
//   try {
//     const apiKey = process.env.OPENWEATHER_API_KEY;
//     const response = await axios.get(
//       `https://api.openweathermap.org/data/2.5/weather?q=${location},IN&appid=${apiKey}&units=metric`
//     );
//     return {
//       temp: response.data.main.temp,
//       humidity: response.data.main.humidity
//     };
//   } catch (err) {
//     // If weather API fails return default values for India
//     console.log('Weather API unavailable, using defaults');
//     return {
//       temp: 30,
//       humidity: 75
//     };
//   }
// }
async function handleHarvestSMS(phone, message) { 
  // Parse: 'KISAN TOMATO 200 SEHORE' 
  const parts = message.split(' '); 
  if (parts.length < 4) return 'Format galat hai. Sahi format: KISAN [fasal] [kg] [shahar]. Ex: KISAN PYAZ 300 VIDISHA'; 
 
  const [_, crop, quantityStr, location] = parts; 
  const quantity = parseInt(quantityStr); 
  if (isNaN(quantity)) return 'Matra (quantity) number mein likhein. Ex: KISAN TOMATO 200 SEHORE'; 
 
  // Register or find farmer 
  let farmer = await db.query('SELECT * FROM farmers WHERE phone=$1', [phone]); 
  if (farmer.rows.length === 0) { 
    await db.query('INSERT INTO farmers(phone,village) VALUES($1,$2)', [phone, location]); 
    farmer = await db.query('SELECT * FROM farmers WHERE phone=$1', [phone]); 
  } 
  const farmerId = farmer.rows[0].id; 
 
  // Call AI service for spoilage prediction 
  const weather = await getWeatherForLocation(location); 
  const prediction = await aiService.predictSpoilage({ crop, quantity, temp: weather.temp, humidity: 
weather.humidity }); 
 
  // Save harvest submission 
  // await db.query( 
  //   'INSERT INTO harvest_submissions(farmer_id,crop_name,quantity_kg,harvest_time,current_temp,humidity,spoilage_risk,predicted_shelf_hours) VALUES($1,$2,$3,NOW(),$4,$5,$6,$7)', 
  //   [farmerId, crop, quantity, weather.temp, weather.humidity, prediction.risk, prediction.shelfHours] 
  // ); 
  // Save harvest submission
const harvestResult = await db.query(
  'INSERT INTO harvest_submissions(farmer_id,crop_name,quantity_kg,harvest_time,current_temp,humidity,spoilage_risk,predicted_shelf_hours) VALUES($1,$2,$3,NOW(),$4,$5,$6,$7) RETURNING *',
  [farmerId, crop, quantity, weather.temp, weather.humidity, prediction.risk, prediction.shelf_hours]
);

// Auto-create pending booking with best store
if (best) {
  const receipt = 'KCC-' + Date.now();
  const durationDays = prediction.risk === 'CRITICAL' ? 3 : 
                       prediction.risk === 'HIGH' ? 5 : 7;
  const totalCost = (quantity * best.price_per_day * durationDays / 1000).toFixed(2);
  
  await db.query(
    'INSERT INTO bookings(harvest_id,cold_store_id,farmer_id,booking_date,duration_days,quantity_kg,total_cost,status,receipt_number) VALUES($1,$2,$3,CURRENT_DATE+1,$4,$5,$6,$7,$8)',
    [harvestResult.rows[0].id, best.id, farmerId, durationDays, quantity, totalCost, 'PENDING', receipt]
  );
}
 
  // Find nearest cold store 
  const stores = await matchingService.findNearestStores(location, quantity); 
  const best = stores[0]; 
 
  // Check transport pool
    const pool = await matchingService.findTransportPool(farmerId, best.id); 
 
  // Compose Hindi reply 
//   let reply = `Namaskar! ${crop} ${quantity}kg register hua.\n`; 
//  reply += `Spoilage risk: ${prediction.risk} (${prediction.shelf_hours} ghante safe)\n`;
// reply += `Nearest: ${best.name}, ${best.distanceKm}km, Rs${best.price_per_day}/kg/din\n`;
//   reply += `Available: ${best.availableCapacity}T\n`; 
//   if (pool.count > 0) reply += `${pool.count} kisaan same truck mein ja rahe hain\n`; 
//   reply += 'Book karne ke liye YES bhejein. Aur options ke liye INFO bhejein.'; 
 // Get mandi rates
  const mandiData = await getMandiRates(crop, location);

  // Build detailed reply
  let reply = `🌾 Namaskar! ${crop} ${quantity}kg register hua.\n\n`;
  
  // Weather info
  reply += `🌡️ Mausam: ${weather.temp}°C, ${weather.humidity}% humidity\n\n`;
  
  // Spoilage risk with color indicator
  const riskEmoji = prediction.risk === 'LOW' ? '🟢' : 
                    prediction.risk === 'MEDIUM' ? '🟡' : 
                    prediction.risk === 'HIGH' ? '🟠' : '🔴';
  reply += `${riskEmoji} Spoilage Risk: ${prediction.risk}\n`;
  reply += `⏱ ${prediction.shelf_hours} ghante safe\n\n`;

  // Best cold store
  if (best) {
    reply += `🏪 Best Store:\n`;
    reply += `${best.name}\n`;
    reply += `📍 ${best.distanceKm}km | ₹${best.price_per_day}/kg/day\n`;
    reply += `📦 ${best.availableCapacity}T available\n`;
    reply += `⭐ Rating: ${best.reliability_score}/5\n\n`;
  }

  // Mandi rates
  if (mandiData.localPrice) {
    reply += `💹 Mandi Rates:\n`;
    reply += `Local: ₹${mandiData.localPrice.modalPrice}/qtl\n`;
    if (mandiData.bestMarket) {
      reply += `Bhopal: ₹${mandiData.bestMarket.modalPrice}/qtl\n`;
    }
    if (mandiData.priceAdvice) {
      reply += `💡 ${mandiData.priceAdvice.message}\n\n`;
    }
  }

  // Transport pool
  if (pool.count > 0) {
    reply += `🚛 ${pool.count} kisaan same truck mein!\n`;
    reply += `💰 Transport cost share mein milega\n\n`;
  }

  // Quick care tip
  const care = require('../services/cropCareService').getCropCare(crop);
  reply += `📦 Care Tip: ${care.harvestTips[0]}\n\n`;

  reply += `Reply:\nYES → booking confirm\nINFO → aur stores\nCARE → full care guide\nHELP → all commands`;
  return reply; 
} 
 
function getHelpMessage() {
  return `KISAN BOT Commands:
1. Register harvest:
   KISAN [fasal] [kg] [shahar]
   Ex: KISAN TOMATO 200 SEHORE

2. Confirm booking:
   YES

3. More cold stores:
   INFO

4. This help message:
   HELP

Supported crops:
TOMATO, POTATO, ONION, MANGO, APPLE, BANANA, CAULIFLOWER, GRAPE`;
}

async function handleOperatorConfirm(receiptNumber) {
  try {
    const result = await db.query(
      'UPDATE bookings SET status=$1 WHERE receipt_number=$2 RETURNING *',
      ['CONFIRMED', receiptNumber]
    );
    if (result.rows.length === 0) return `Booking ${receiptNumber} not found.`;
    
    const booking = result.rows[0];
    const farmer = await db.query('SELECT * FROM farmers WHERE id=$1', [booking.farmer_id]);
    const store = await db.query('SELECT * FROM cold_stores WHERE id=$1', [booking.cold_store_id]);

    // Update capacity
    await db.query(
      'UPDATE cold_stores SET used_capacity = used_capacity + $1 WHERE id=$2',
      [Math.ceil(booking.quantity_kg / 1000), booking.cold_store_id]
    );

    // Notify farmer
    const { sendBookingConfirmation } = require('../services/notificationService');
    await sendBookingConfirmation(farmer.rows[0].phone, {
      ...booking,
      store_name: store.rows[0].name,
      store_address: store.rows[0].address
    });

    return `✅ Booking ${receiptNumber} CONFIRMED!\nFarmer has been notified.\nCapacity updated automatically.`;
  } catch (err) {
    return `Error confirming booking: ${err.message}`;
  }
}

async function handleOperatorReject(receiptNumber) {
  try {
    const result = await db.query(
      'UPDATE bookings SET status=$1 WHERE receipt_number=$2 RETURNING *',
      ['REJECTED', receiptNumber]
    );
    if (result.rows.length === 0) return `Booking ${receiptNumber} not found.`;

    const booking = result.rows[0];
    const farmer = await db.query('SELECT * FROM farmers WHERE id=$1', [booking.farmer_id]);
    const store = await db.query('SELECT * FROM cold_stores WHERE id=$1', [booking.cold_store_id]);

    const { sendBookingRejection } = require('../services/notificationService');
    await sendBookingRejection(farmer.rows[0].phone, {
      ...booking,
      store_name: store.rows[0].name
    }, 'Storage full for requested date');

    return `❌ Booking ${receiptNumber} REJECTED.\nFarmer has been notified.`;
  } catch (err) {
    return `Error rejecting booking: ${err.message}`;
  }
}
async function handleBookingConfirmation(farmerPhone) {
  try {
    // Find latest pending booking for this farmer
    const result = await db.query(`
      SELECT b.*, cs.name as store_name, cs.address as store_address
      FROM bookings b
      JOIN farmers f ON f.id = b.farmer_id
      JOIN cold_stores cs ON cs.id = b.cold_store_id
      WHERE f.phone = $1 AND b.status = 'PENDING'
      ORDER BY b.created_at DESC LIMIT 1
    `, [farmerPhone]);

    if (result.rows.length === 0) {
      return 'Koi pending booking nahi mili. Pehle KISAN [fasal] [kg] [shahar] bhejein.';
    }

    const booking = result.rows[0];
    return `✅ Booking Request Confirmed!\n\nReceipt: ${booking.receipt_number}\nStore: ${booking.store_name}\nStatus: Operator approval pending\n\nOperator ko notification bheja gaya.\n2 ghante mein confirmation milegi.\n\nPayment:\nUPI: kisancoldchain@paytm\nAmount: ₹${booking.total_cost}\nRef: ${booking.receipt_number}`;
  } catch (err) {
    throw err;
  }
}
async function sendMoreStores(farmerPhone) {
  try {
    const stores = await db.query(
      'SELECT * FROM cold_stores WHERE is_active=true ORDER BY reliability_score DESC LIMIT 5'
    );
    
    if (stores.rows.length === 0) return 'Koi cold store nahi mila.';
    
    let reply = '🏪 Nearby Cold Stores:\n\n';
    stores.rows.forEach((s, i) => {
      const available = s.total_capacity - s.used_capacity;
      reply += `${i + 1}. ${s.name}\n`;
      reply += `   📍 ${s.district}\n`;
      reply += `   💰 ₹${s.price_per_day}/kg/day\n`;
      reply += `   📦 ${available}T available\n`;
      reply += `   ⭐ ${s.reliability_score}/5\n\n`;
    });
    reply += 'Book karne ke liye store number bhejein (1-5)';
    return reply;
  } catch (err) {
    throw err;
  }
}
module.exports = router; 