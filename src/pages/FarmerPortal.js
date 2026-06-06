import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { QRCodeSVG } from 'qrcode.react';
import 'leaflet/dist/leaflet.css';
import { API, AI_API, CROPS, RISK_EMOJI } from '../config';
import { tokens as tk } from '../tokens';
import { ui } from '../components/ui';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import shadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl: icon,
  shadowUrl: shadow,
});

const T = {
  en: {
    loginTitle: 'Apna phone number daalen',
    phone: 'Phone Number',
    phonePh: '10-digit mobile number',
    continue: 'Aage Badhen',
    register: 'Complete Registration',
    name: 'Your Name',
    village: 'Village',
    district: 'District',
    registerBtn: 'Register',
    welcome: 'Welcome',
    registerHarvest: 'Register Harvest',
    crop: 'Select Crop',
    qty: 'Quantity (kg)',
    loc: 'Your Location',
    findStorage: 'Find Cold Storage',
    myBookings: 'My Bookings',
    bookNow: 'Book Now',
    noBookings: 'No bookings yet.',
    loading: 'Loading...',
    logout: 'Logout',
    receipt: 'Receipt',
    store: 'Cold Store',
    date: 'Date',
    duration: 'Duration',
    cost: 'Total Cost',
    days: 'days',
    downloadReceipt: 'Download Receipt',
    close: 'Close',
    paymentRef: 'Reference',
    transportPool: 'Transport Pool',
    farmersInPool: 'farmers in pool',
    youSave: 'You save',
    newFarmer: 'New farmer? Tell us about yourself',
  },
  hi: {
    loginTitle: 'अपना फ़ोन नंबर डालें',
    phone: 'मोबाइल नंबर',
    phonePh: '10 अंकों का नंबर',
    continue: 'आगे बढ़ें',
    register: 'रजिस्ट्रेशन पूरा करें',
    name: 'आपका नाम',
    village: 'गाँव',
    district: 'ज़िला',
    registerBtn: 'रजिस्टर करें',
    welcome: 'नमस्ते',
    registerHarvest: 'फसल दर्ज करें',
    crop: 'फसल चुनें',
    qty: 'मात्रा (किलो)',
    loc: 'आपका स्थान',
    findStorage: 'कोल्ड स्टोरेज खोजें',
    myBookings: 'मेरी बुकिंग',
    bookNow: 'बुक करें',
    noBookings: 'अभी कोई बुकिंग नहीं।',
    loading: 'लोड हो रहा है...',
    logout: 'लॉग आउट',
    receipt: 'रसीद',
    store: 'कोल्ड स्टोर',
    date: 'तारीख',
    duration: 'अवधि',
    cost: 'कुल लागत',
    days: 'दिन',
    downloadReceipt: 'रसीद डाउनलोड करें',
    close: 'बंद करें',
    paymentRef: 'संदर्भ',
    transportPool: 'ट्रांसपोर्ट पूल',
    farmersInPool: 'किसान पूल में',
    youSave: 'आपकी बचत',
    newFarmer: 'नए किसान? अपनी जानकारी दें',
  },
};

const RISK_TIPS = {
  LOW: 'Keep produce in shade — spoilage risk is low but act within a day.',
  MEDIUM: 'Book cold storage today — temperature is rising spoilage risk.',
  HIGH: 'Urgent: transport to cold store immediately to prevent losses.',
  CRITICAL: 'Critical! Do not delay — produce is spoiling fast!',
};

const CROP_TIPS = {
  TOMATO: 'Handle gently and keep in shade — bruising speeds spoilage.',
  POTATO: 'Keep in darkness and do not wash before storage.',
  ONION: 'Ensure good ventilation — avoid plastic bags.',
  MANGO: 'Do not refrigerate below 12°C — causes chilling injury.',
  DEFAULT: 'Keep produce cool and shaded until cold storage is booked.',
};

function SpoilageRiskCard({ prediction, crop, lang }) {
  const [hoursLeft, setHoursLeft] = useState(prediction.shelf_hours);
  const risk = prediction.risk || 'LOW';
  const isCritical = risk === 'CRITICAL';
  const riskToken = tk.color.risk[risk] || tk.color.risk.LOW;

  useEffect(() => {
    setHoursLeft(prediction.shelf_hours);
    const interval = setInterval(() => {
      setHoursLeft(prev => Math.max(0, prev - 1 / 3600));
    }, 1000);
    return () => clearInterval(interval);
  }, [prediction.shelf_hours]);

  const h = Math.floor(hoursLeft);
  const m = Math.floor((hoursLeft - h) * 60);
  const tip = CROP_TIPS[crop] || RISK_TIPS[risk] || CROP_TIPS.DEFAULT;

  return (
    <div className="kcc-animate-in" style={{
      background: `linear-gradient(135deg, ${riskToken.bg}, ${riskToken.bg}dd)`,
      color: riskToken.text,
      padding: tk.space[6],
      borderRadius: tk.radius.xl,
      marginBottom: tk.space[4],
      textAlign: 'center',
      width: '100%',
      boxSizing: 'border-box',
      boxShadow: `${tk.shadow.lg}, 0 0 40px ${riskToken.glow}`,
      animation: isCritical ? 'kcc-pulse-critical 1.5s infinite' : undefined,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
      <div style={{ fontSize: '56px', marginBottom: tk.space[2], filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }}>{RISK_EMOJI[risk]}</div>
      <h2 style={{ margin: `0 0 ${tk.space[2]}`, fontSize: tk.font.size['2xl'], fontWeight: tk.font.weight.bold }}>
        {lang === 'hi' ? 'खराबी जोखिम' : 'Spoilage Risk'}: {risk}
      </h2>
      <div style={{
        display: 'inline-block', background: 'rgba(0,0,0,0.15)',
        borderRadius: tk.radius.lg, padding: `${tk.space[3]} ${tk.space[6]}`,
        fontSize: tk.font.size['3xl'], fontWeight: tk.font.weight.extrabold,
        margin: `${tk.space[3]} 0`, fontFamily: 'monospace', letterSpacing: '0.05em',
      }}>
        ⏱ {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}
      </div>
      <p style={{ margin: `0 0 ${tk.space[2]}`, fontSize: tk.font.size.sm, opacity: 0.9 }}>
        {lang === 'hi' ? 'घंटे शेष सुरक्षित' : 'hours remaining safe'}
      </p>
      <p style={{ margin: `${tk.space[3]} 0 0`, fontSize: tk.font.size.sm, fontStyle: 'italic', opacity: 0.95, background: 'rgba(255,255,255,0.15)', borderRadius: tk.radius.md, padding: tk.space[3] }}>
        💡 {tip}
      </p>
    </div>
  );
}

function BookingConfirmation({ confirmation, lang, t, onClose }) {
  const { booking, store, transportStatus } = confirmation;
  const amount = parseFloat(booking.total_cost || 0).toFixed(0);
  const upiString = `upi://pay?pa=kisancoldchain@paytm&pn=KisanColdChain&am=${amount}&cu=INR&tn=${booking.receipt_number}`;

  const downloadReceipt = () => {
    const text = `
KISAN COLD CHAIN — BOOKING RECEIPT
==================================
Receipt: ${booking.receipt_number}
Farmer: ${booking.farmer_name || 'Farmer'}
Crop: ${booking.crop_name || '—'}
Quantity: ${booking.quantity_kg} kg
Cold Store: ${store.name}
Address: ${store.address || store.district}
Duration: ${booking.duration_days} days
Total Cost: ₹${amount}
Status: ${booking.status}
Payment UPI: kisancoldchain@paytm
Reference: ${booking.receipt_number}
==================================
    `.trim();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${booking.receipt_number}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={ui.overlay()}>
      <div style={{ ...ui.modal(), textAlign: 'center' }}>
        <div style={{ fontSize: '72px', animation: 'kcc-checkmark 0.5s ease-out' }}>✅</div>
        <h2 style={{ color: tk.color.primary[900], margin: `${tk.space[3]} 0 ${tk.space[1]}`, fontSize: tk.font.size['2xl'], fontWeight: tk.font.weight.bold }}>
          {lang === 'hi' ? 'बुकिंग सफल!' : 'Booking Submitted!'}
        </h2>
        <div style={{ fontSize: tk.font.size['2xl'], fontWeight: tk.font.weight.extrabold, color: tk.color.primary[800], margin: `${tk.space[2]} 0 ${tk.space[5]}`, letterSpacing: '-0.02em' }}>
          {booking.receipt_number}
        </div>

        <div style={{ ...ui.card({ padding: tk.space[4], textAlign: 'left', marginBottom: tk.space[4], background: tk.color.neutral[50] }) }}>
          <p style={{ margin: '4px 0' }}>🏪 <b>{store.name}</b></p>
          <p style={{ margin: '4px 0', color: tk.color.text.muted }}>📍 {store.district}</p>
          <p style={{ margin: '4px 0' }}>📦 {booking.quantity_kg} kg • {booking.duration_days} {t.days}</p>
        </div>

        <div style={{ background: tk.color.semantic.successBg, borderRadius: tk.radius.lg, padding: tk.space[4], marginBottom: tk.space[4], border: `1px solid ${tk.color.primary[200]}` }}>
          <h4 style={{ margin: `0 0 ${tk.space[3]}`, color: tk.color.primary[900] }}>💳 {lang === 'hi' ? 'भुगतान' : 'Payment'}</h4>
          <p style={{ margin: '4px 0', fontSize: tk.font.size.sm }}>UPI: <b>kisancoldchain@paytm</b></p>
          <p style={{ margin: '4px 0', fontSize: tk.font.size.sm }}>{t.paymentRef}: <b>{booking.receipt_number}</b></p>
          <p style={{ margin: `${tk.space[2]} 0`, fontSize: tk.font.size['2xl'], fontWeight: tk.font.weight.extrabold, color: tk.color.primary[900] }}>₹{amount}</p>
          <div style={{ display: 'inline-flex', justifyContent: 'center', marginTop: tk.space[3], padding: tk.space[3], background: 'white', borderRadius: tk.radius.md }}>
            <QRCodeSVG value={upiString} size={120} fgColor={tk.color.primary[900]} />
          </div>
        </div>

        {transportStatus && (
          <div style={{ background: tk.color.semantic.warningBg, borderRadius: tk.radius.lg, padding: tk.space[4], marginBottom: tk.space[4], fontSize: tk.font.size.sm }}>
            <b>🚛 {t.transportPool}:</b> {transportStatus.poolSize || 1} {t.farmersInPool}
            {transportStatus.savings > 0 && (
              <span style={{ color: tk.color.primary[800], fontWeight: tk.font.weight.bold }}> — {t.youSave} ₹{transportStatus.savings}!</span>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: tk.space[3] }}>
          <button onClick={downloadReceipt} className="kcc-hover-scale" style={{ ...ui.btn('primary', tk.color.primary), flex: 1, width: '100%' }}>
            📥 {t.downloadReceipt}
          </button>
          <button onClick={onClose} className="kcc-hover-scale" style={{ ...ui.btn('ghost'), flex: 1, width: '100%' }}>
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FarmerPortal() {
  const [lang, setLang] = useState(() => localStorage.getItem('farmerLang') || 'hi');
  const [phone, setPhone] = useState('');
  const [farmer, setFarmer] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [regName, setRegName] = useState('');
  const [regVillage, setRegVillage] = useState('');
  const [regDistrict, setRegDistrict] = useState('Sehore');
  const [loginLoading, setLoginLoading] = useState(false);

  const [tab, setTab] = useState('harvest');
  const [crop, setCrop] = useState('');
  const [quantity, setQuantity] = useState('');
  const [location, setLocation] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [confirmation, setConfirmation] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(null);

  const t = T[lang];

  const loadBookings = useCallback(async (farmerId) => {
    try {
      const res = await axios.get(`${API}/api/bookings`);
      setBookings(res.data.filter(b => b.farmer_id === farmerId));
    } catch (err) {
      console.error(err);
    }
  }, []);

  const initFarmer = useCallback(async (phoneNum) => {
    try {
      const res = await axios.get(`${API}/api/farmers`);
      const found = res.data.find(f =>
        f.phone === phoneNum || f.phone === `+91${phoneNum}` || f.phone?.replace('+91', '') === phoneNum
      );
      if (found) {
        setFarmer(found);
        setShowRegister(false);
        await loadBookings(found.id);
      } else {
        setShowRegister(true);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }, [loadBookings]);

  useEffect(() => {
    const saved = localStorage.getItem('farmerPhone');
    if (saved) {
      setPhone(saved);
      initFarmer(saved);
    }
  }, [initFarmer]);

  const handleLogin = async () => {
    if (!phone || phone.length < 10) {
      alert(lang === 'hi' ? 'सही मोबाइल नंबर डालें' : 'Enter a valid 10-digit phone number');
      return;
    }
    setLoginLoading(true);
    localStorage.setItem('farmerPhone', phone);
    localStorage.setItem('farmerLang', lang);
    await initFarmer(phone);
    setLoginLoading(false);
  };

  const handleRegister = async () => {
    if (!regName || !regVillage) {
      alert(lang === 'hi' ? 'नाम और गाँव भरें' : 'Fill name and village');
      return;
    }
    setLoginLoading(true);
    try {
      const res = await axios.post(`${API}/api/farmers/register`, {
        phone, name: regName, village: regVillage, district: regDistrict,
      });
      setFarmer(res.data);
      setShowRegister(false);
      localStorage.setItem('farmerPhone', phone);
    } catch (err) {
      alert('Error: ' + err.message);
    }
    setLoginLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('farmerPhone');
    setFarmer(null);
    setPhone('');
    setShowRegister(false);
    setResult(null);
    setBookings([]);
  };

  const handleSubmit = async () => {
    if (!crop || !quantity || !location) {
      alert(lang === 'hi' ? 'सभी फ़ील्ड भरें' : 'Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const aiResponse = await axios.post(`${AI_API}/predict-spoilage`, {
        crop,
        quantity_kg: parseInt(quantity),
        temperature_c: 30,
        humidity_pct: 75,
        hour_of_day: new Date().getHours(),
      });
      const storesResponse = await axios.get(`${API}/api/coldstores`);
      setResult({
        prediction: aiResponse.data,
        stores: storesResponse.data.slice(0, 5),
        crop,
        quantity,
      });
    } catch (err) {
      alert('Error: ' + err.message);
    }
    setLoading(false);
  };

  const handleBookNow = async (store) => {
    if (!farmer) return;
    setBookingLoading(store.id);
    const durationDays = 7;
    const totalCost = store.price_per_day * parseInt(quantity) * durationDays;
    const bookingDate = new Date();
    bookingDate.setDate(bookingDate.getDate() + 1);
    const dateStr = bookingDate.toISOString().split('T')[0];

    try {
      const bookingRes = await axios.post(`${API}/api/bookings`, {
        harvest_id: null,
        cold_store_id: store.id,
        farmer_id: farmer.id,
        booking_date: dateStr,
        duration_days: durationDays,
        quantity_kg: parseInt(quantity),
        total_cost: totalCost,
      });

      let transportStatus = null;
      try {
        const transportRes = await axios.post(`${API}/api/transport/match`, {
          farmer_id: farmer.id,
          cold_store_id: store.id,
          pickup_date: dateStr,
          quantity_kg: parseInt(quantity),
        });
        transportStatus = transportRes.data;
      } catch {
        // Farmer may not have GPS — booking still succeeds
      }

      const booking = {
        ...bookingRes.data,
        crop_name: crop,
        farmer_name: farmer.name,
      };
      setConfirmation({ booking, store, transportStatus });
      await loadBookings(farmer.id);
    } catch (err) {
      alert('Booking error: ' + err.message);
    }
    setBookingLoading(null);
  };

  const pageWrap = { maxWidth: '640px', margin: '0 auto', padding: tk.space[5], fontFamily: tk.font.family };

  // Login screen
  if (!farmer && !showRegister) {
    return (
      <div className="kcc-page-bg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 60px)', padding: tk.space[5] }}>
        <div className="kcc-animate-in" style={{ maxWidth: '440px', width: '100%' }}>
          <div style={{ ...ui.pageHeader(tk.gradient.farmer), borderRadius: tk.radius['2xl'], textAlign: 'center', marginBottom: tk.space[6], boxShadow: tk.shadow.lg }}>
            <div style={{ fontSize: '64px', marginBottom: tk.space[2], animation: 'kcc-float 3s ease-in-out infinite' }}>🌾</div>
            <h1 style={{ margin: 0, fontSize: tk.font.size['3xl'], fontWeight: tk.font.weight.extrabold }}>Kisan Cold Chain</h1>
          </div>

          <div style={{ ...ui.card({ padding: tk.space[8] }) }}>
            <h2 style={{ color: tk.color.primary[900], textAlign: 'center', marginTop: 0, fontSize: tk.font.size['2xl'], fontWeight: tk.font.weight.bold }}>{t.loginTitle}</h2>

            <label style={{ fontWeight: tk.font.weight.semibold, display: 'block', marginBottom: tk.space[2], color: tk.color.text.primary }}>{t.phone}</label>
            <input
              className="kcc-input"
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder={t.phonePh}
              style={{ ...ui.input({ padding: tk.space[5], marginBottom: tk.space[5], fontSize: tk.font.size['2xl'], textAlign: 'center', borderColor: tk.color.primary[600] }) }}
            />

            <div style={{ display: 'flex', gap: tk.space[3], marginBottom: tk.space[6] }}>
              {['hi', 'en'].map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className="kcc-hover-scale"
                  style={{
                    flex: 1, padding: tk.space[3], borderRadius: tk.radius.md, cursor: 'pointer',
                    border: lang === l ? `2px solid ${tk.color.primary[700]}` : `1px solid ${tk.color.border.default}`,
                    background: lang === l ? tk.color.primary[50] : tk.color.surface.base,
                    color: lang === l ? tk.color.primary[900] : tk.color.text.muted,
                    fontWeight: lang === l ? tk.font.weight.bold : tk.font.weight.normal,
                    fontFamily: tk.font.family, transition: tk.transition.spring,
                  }}
                >
                  {l === 'hi' ? '🇮🇳 हिंदी' : '🇬🇧 English'}
                </button>
              ))}
            </div>

            <button onClick={handleLogin} disabled={loginLoading} className="kcc-hover-scale" style={{ ...ui.btn('primary', tk.color.primary, loginLoading), width: '100%', padding: tk.space[5], fontSize: tk.font.size.xl }}>
              {loginLoading ? t.loading : `➡️ ${t.continue}`}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Registration screen
  if (!farmer && showRegister) {
    return (
      <div className="kcc-page-bg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 60px)', padding: tk.space[5] }}>
        <div className="kcc-animate-in" style={{ maxWidth: '440px', width: '100%' }}>
          <div style={{ ...ui.pageHeader(tk.gradient.farmer), borderRadius: tk.radius['2xl'], textAlign: 'center', marginBottom: tk.space[5], boxShadow: tk.shadow.lg }}>
            <div style={{ fontSize: '52px' }}>🌾</div>
            <h2 style={{ margin: `${tk.space[2]} 0 0`, fontWeight: tk.font.weight.bold }}>{t.newFarmer}</h2>
          </div>
          <div style={{ ...ui.card({ padding: tk.space[6] }) }}>
            <h3 style={{ color: tk.color.primary[900], marginTop: 0, fontWeight: tk.font.weight.bold }}>{t.register}</h3>
            <p style={{ color: tk.color.text.muted, fontSize: tk.font.size.sm, background: tk.color.primary[50], padding: tk.space[2], borderRadius: tk.radius.sm, display: 'inline-block' }}>📱 {phone}</p>

            {[
              { label: t.name, val: regName, set: setRegName, ph: 'Ramesh Verma' },
              { label: t.village, val: regVillage, set: setRegVillage, ph: 'Ashta' },
              { label: t.district, val: regDistrict, set: setRegDistrict, ph: 'Sehore' },
            ].map((f, i) => (
              <div key={i} style={{ marginBottom: tk.space[4] }}>
                <label style={{ fontWeight: tk.font.weight.semibold, display: 'block', marginBottom: tk.space[1], color: tk.color.text.primary }}>{f.label}</label>
                <input className="kcc-input" value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph} style={ui.input()} />
              </div>
            ))}

            <button onClick={handleRegister} disabled={loginLoading} className="kcc-hover-scale" style={{ ...ui.btn('primary', tk.color.primary, loginLoading), width: '100%', marginTop: tk.space[2] }}>
              {loginLoading ? t.loading : t.registerBtn}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="kcc-page-bg" style={pageWrap}>
      {confirmation && (
        <BookingConfirmation
          confirmation={confirmation}
          lang={lang}
          t={t}
          onClose={() => setConfirmation(null)}
        />
      )}

      {/* Header */}
      <div className="kcc-animate-in" style={{
        ...ui.pageHeader(tk.gradient.farmer), borderRadius: tk.radius.xl,
        marginBottom: tk.space[4], display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: tk.shadow.lg,
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: tk.font.size['2xl'], fontWeight: tk.font.weight.extrabold }}>🌾 Kisan Cold Chain</h1>
          <p style={{ margin: `${tk.space[1]} 0 0`, fontSize: tk.font.size.sm, opacity: 0.9 }}>
            {t.welcome}, <strong>{farmer.name}</strong> • {farmer.village}
          </p>
        </div>
        <button onClick={handleLogout} className="kcc-hover-scale" style={{
          background: 'rgba(255,255,255,0.15)', color: tk.color.text.inverse,
          border: '1px solid rgba(255,255,255,0.3)', borderRadius: tk.radius.md,
          padding: `${tk.space[2]} ${tk.space[3]}`, cursor: 'pointer', fontSize: tk.font.size.xs,
          fontFamily: tk.font.family, fontWeight: tk.font.weight.medium,
        }}>
          {t.logout}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: tk.space[2], marginBottom: tk.space[4], background: tk.color.primary[50], padding: tk.space[1], borderRadius: tk.radius.lg }}>
        {[
          { id: 'harvest', label: `🌾 ${t.registerHarvest}` },
          { id: 'bookings', label: `📋 ${t.myBookings}`, count: bookings.length },
        ].map(tabItem => (
          <button
            key={tabItem.id}
            onClick={() => setTab(tabItem.id)}
            className="kcc-hover-scale"
            style={{ ...ui.tab(tab === tabItem.id, tk.color.primary), flex: 1, fontSize: tk.font.size.sm }}
          >
            {tabItem.label}{tabItem.count > 0 ? ` (${tabItem.count})` : ''}
          </button>
        ))}
      </div>

      {/* Harvest Tab */}
      {tab === 'harvest' && (
        <>
          <div style={{ ...ui.card({ padding: tk.space[6], marginBottom: tk.space[5] }) }}>
            <h2 style={{ color: tk.color.primary[900], marginTop: 0, fontWeight: tk.font.weight.bold, fontSize: tk.font.size.xl }}>{t.registerHarvest}</h2>

            <label style={{ fontWeight: tk.font.weight.semibold, display: 'block', marginBottom: tk.space[1], color: tk.color.text.secondary }}>{t.crop}</label>
            <select value={crop} onChange={e => setCrop(e.target.value)} className="kcc-input" style={{ ...ui.input({ marginBottom: tk.space[4] }) }}>
              <option value="">-- {t.crop} --</option>
              {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <label style={{ fontWeight: tk.font.weight.semibold, display: 'block', marginBottom: tk.space[1], color: tk.color.text.secondary }}>{t.qty}</label>
            <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="150" className="kcc-input" style={{ ...ui.input({ marginBottom: tk.space[4] }) }} />

            <label style={{ fontWeight: tk.font.weight.semibold, display: 'block', marginBottom: tk.space[1], color: tk.color.text.secondary }}>{t.loc}</label>
            <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Ashta, Sehore" className="kcc-input" style={{ ...ui.input({ marginBottom: tk.space[5] }) }} />

            <button onClick={handleSubmit} disabled={loading} className="kcc-hover-scale" style={{ ...ui.btn('primary', tk.color.primary, loading), width: '100%', fontSize: tk.font.size.lg }}>
              {loading ? t.loading : `🔍 ${t.findStorage}`}
            </button>
          </div>

          {result && (
            <div className="kcc-animate-in">
              <SpoilageRiskCard prediction={result.prediction} crop={result.crop} lang={lang} />

              <h3 style={{ color: tk.color.primary[900], fontWeight: tk.font.weight.bold, fontSize: tk.font.size.xl, marginBottom: tk.space[4] }}>
                🏪 {lang === 'hi' ? 'नज़दीकी कोल्ड स्टोर' : 'Nearest Cold Stores'}
              </h3>
              {result.stores.map((store, i) => (
                <div key={store.id || i} className="kcc-hover-lift" style={{ ...ui.card({ padding: tk.space[5], marginBottom: tk.space[3], borderLeft: `4px solid ${tk.color.primary[500]}` }) }}>
                  <h4 style={{ margin: `0 0 ${tk.space[2]}`, color: tk.color.primary[900], fontWeight: tk.font.weight.bold }}>🏪 {store.name}</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tk.space[1], fontSize: tk.font.size.sm, color: tk.color.text.secondary, marginBottom: tk.space[3] }}>
                    <span>📍 {store.district}</span>
                    <span>💰 ₹{store.price_per_day}/kg/day</span>
                    <span>📦 {store.total_capacity - store.used_capacity}T {lang === 'hi' ? 'उपलब्ध' : 'free'}</span>
                    <span>⭐ {store.reliability_score}/5</span>
                  </div>
                  <button onClick={() => handleBookNow(store)} disabled={bookingLoading === store.id} className="kcc-hover-scale" style={{ ...ui.btn('primary', tk.color.primary, bookingLoading === store.id), width: '100%' }}>
                    {bookingLoading === store.id ? t.loading : `✓ ${t.bookNow}`}
                  </button>
                </div>
              ))}

              {result.stores.some(s => s.lat && s.lng) && (
                <div style={{ marginTop: tk.space[5] }}>
                  <h3 style={{ color: tk.color.primary[900], fontWeight: tk.font.weight.bold }}>🗺️ {lang === 'hi' ? 'मानचित्र' : 'Store Map'}</h3>
                  <MapContainer
                    center={[23.2599, 77.4126]}
                    zoom={8}
                    style={{ height: '300px', borderRadius: tk.radius.lg, zIndex: 0, boxShadow: tk.shadow.md }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {result.stores.filter(s => s.lat && s.lng).map(store => (
                      <Marker key={store.id} position={[parseFloat(store.lat), parseFloat(store.lng)]}>
                        <Popup>
                          <b>{store.name}</b><br />
                          ₹{store.price_per_day}/kg/day<br />
                          {store.total_capacity - store.used_capacity}T {lang === 'hi' ? 'उपलब्ध' : 'available'}
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Bookings Tab */}
      {tab === 'bookings' && (
        <div>
          <h3 style={{ color: tk.color.primary[900], fontWeight: tk.font.weight.bold, fontSize: tk.font.size.xl }}>{t.myBookings}</h3>
          {bookings.length === 0 ? (
            <div style={{ ...ui.card({ padding: tk.space[10], textAlign: 'center' }) }}>
              <div style={{ fontSize: '48px', marginBottom: tk.space[3] }}>📋</div>
              <p style={{ color: tk.color.text.muted, margin: 0 }}>{t.noBookings}</p>
            </div>
          ) : (
            bookings.map((b, i) => (
              <div key={b.id || i} className="kcc-hover-lift kcc-animate-in" style={{ ...ui.card({ padding: tk.space[4], marginBottom: tk.space[3] }), animationDelay: `${i * 0.05}s` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tk.space[3] }}>
                  <span style={{ fontWeight: tk.font.weight.bold, color: tk.color.primary[900], fontSize: tk.font.size.lg }}>#{b.receipt_number}</span>
                  <span style={ui.badge(b.status)}>{b.status}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tk.space[2], fontSize: tk.font.size.sm, color: tk.color.text.secondary }}>
                  <span>🏪 {b.store_name}</span>
                  <span>🌾 {b.crop_name || crop || '—'}</span>
                  <span>📦 {b.quantity_kg} kg</span>
                  <span>💰 ₹{b.total_cost}</span>
                  <span>📅 {b.booking_date ? new Date(b.booking_date).toLocaleDateString('en-IN') : '—'}</span>
                  <span>⏱ {b.duration_days} {t.days}</span>
                </div>
                {b.status === 'CONFIRMED' && (
                  <div style={{ marginTop: tk.space[4], textAlign: 'center', padding: tk.space[4], background: tk.color.primary[50], borderRadius: tk.radius.md, border: `1px dashed ${tk.color.primary[300]}` }}>
                    <p style={{ margin: `0 0 ${tk.space[2]}`, fontSize: tk.font.size.sm, color: tk.color.primary[800], fontWeight: tk.font.weight.medium }}>
                      📱 {lang === 'hi' ? 'रसीद QR कोड' : 'Receipt QR Code'}
                    </p>
                    <QRCodeSVG value={b.receipt_number} size={150} fgColor={tk.color.primary[900]} />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
