const twilio = require('twilio');
require('dotenv').config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const WHATSAPP_FROM = 'whatsapp:+14155238886'; // Twilio sandbox number

async function sendWhatsApp(toPhone, message) {
  try {
    let cleanNumber = toPhone.toString().replace(/\D/g, '');
    if (cleanNumber.startsWith('91') && cleanNumber.length === 12) {
      cleanNumber = cleanNumber.substring(2);
    }
    const formattedPhone = `whatsapp:+91${cleanNumber}`;
    console.log(`Sending WhatsApp to: ${formattedPhone}`);
    await client.messages.create({
      from: WHATSAPP_FROM,
      to: formattedPhone,
      body: message
    });
    return true;
  } catch (err) {
    console.error('WhatsApp send error:', err.message);
    return false;
  }
}
async function notifyOperator(operatorPhone, booking) {
  const message = 
`🏪 NEW BOOKING REQUEST #${booking.receipt_number}

👨‍🌾 Farmer: ${booking.farmer_name}
📱 Phone: ${booking.farmer_phone}
🌾 Crop: ${booking.crop_name}
⚖️ Quantity: ${booking.quantity_kg}kg
📅 Date: ${booking.booking_date}
⏰ Duration: ${booking.duration_days} days
💰 Revenue: ₹${booking.total_cost}

⚠️ Spoilage Risk: ${booking.spoilage_risk}
Farmer needs storage within ${booking.shelf_hours} hours!

Reply:
CONFIRM ${booking.receipt_number} to approve
REJECT ${booking.receipt_number} to decline`;

  return await sendWhatsApp(operatorPhone, message);
}

async function notifyFarmer(farmerPhone, message) {
  return await sendWhatsApp(farmerPhone, message);
}

async function sendBookingConfirmation(farmerPhone, booking) {
  const message =
`✅ BOOKING CONFIRMED!

🎫 Receipt: ${booking.receipt_number}
🏪 Store: ${booking.store_name}
📍 Address: ${booking.store_address}
📅 Date: ${booking.booking_date}
⏰ Duration: ${booking.duration_days} days
⚖️ Quantity: ${booking.quantity_kg}kg
💰 Total Cost: ₹${booking.total_cost}

📲 Payment:
UPI ID: kisancoldchain@paytm
Amount: ₹${booking.total_cost}
Reference: ${booking.receipt_number}

Show this message at the cold store gate.
Your slot is reserved for 2 hours.`;

  return await sendWhatsApp(farmerPhone, message);
}

async function sendBookingRejection(farmerPhone, booking, reason) {
  const message =
`❌ Booking Not Available

Receipt: ${booking.receipt_number}
Store: ${booking.store_name}
Reason: ${reason || 'Storage full for requested date'}

Please try:
1. Reply INFO for other nearby stores
2. Try a different date
3. Call us: 1800-XXX-XXXX

We are sorry for the inconvenience.`;

  return await sendWhatsApp(farmerPhone, message);
}

module.exports = {
  sendWhatsApp,
  notifyOperator,
  notifyFarmer,
  sendBookingConfirmation,
  sendBookingRejection
};