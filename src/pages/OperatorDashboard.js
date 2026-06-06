import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { tokens as tk } from '../tokens';
import { ui } from '../components/ui';

const API = 'http://localhost:3001';
const THEME = tk.color.operator;

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getBookingCountColor(count) {
  if (count === 0) return '#FFFFFF';
  if (count <= 2) return '#C8E6C9';
  if (count <= 5) return '#66BB6A';
  return '#1B5E20';
}

export default function OperatorDashboard() {
  const [stores, setStores] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [pending, setPending] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [actionMsg, setActionMsg] = useState('');
  const [showNotif, setShowNotif] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [farmerModal, setFarmerModal] = useState(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [storesR, bookingsR, pendingR, farmersR] = await Promise.all([
        fetch(`${API}/api/coldstores`).then(r => r.json()),
        fetch(`${API}/api/bookings`).then(r => r.json()),
        fetch(`${API}/api/bookings/pending`).then(r => r.json()),
        fetch(`${API}/api/farmers`).then(r => r.json()),
      ]);
      setStores(storesR);
      setBookings(bookingsR);
      setPending(pendingR);
      setFarmers(farmersR);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
    setLoading(false);
  };

  const openFarmerModal = (farmerName, farmerId) => {
    const farmer = farmers.find(f => f.id === farmerId || f.name === farmerName);
    const farmerBookings = bookings.filter(b => b.farmer_id === farmerId || b.farmer_name === farmerName);
    const totalRevenue = farmerBookings.reduce((sum, b) => sum + (parseFloat(b.total_cost) || 0), 0);
    setFarmerModal({ farmer, farmerBookings, totalRevenue, farmerName });
  };

  const getBookingsByDate = () => {
    const map = {};
    bookings.forEach(b => {
      if (!b.booking_date) return;
      const key = new Date(b.booking_date).toISOString().split('T')[0];
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  };

  const getCalendarDays = () => {
    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  };

  const getBookingsForDate = (day) => {
    if (!day) return [];
    const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return bookings.filter(b => {
      if (!b.booking_date) return false;
      return new Date(b.booking_date).toISOString().split('T')[0] === dateStr;
    });
  };

  const handleConfirm = async (receiptNumber) => {
    try {
      await fetch(`${API}/api/bookings/${receiptNumber}/confirm`, { method: 'POST' });
      setActionMsg(`✅ Booking ${receiptNumber} confirmed! Farmer notified.`);
      fetchData();
      setTimeout(() => setActionMsg(''), 4000);
    } catch (err) {
      setActionMsg('Error confirming booking');
    }
  };

  const handleReject = async (receiptNumber) => {
    try {
      await fetch(`${API}/api/bookings/${receiptNumber}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Storage full for requested date' })
      });
      setActionMsg(`❌ Booking ${receiptNumber} rejected. Farmer notified.`);
      fetchData();
      setTimeout(() => setActionMsg(''), 4000);
    } catch (err) {
      setActionMsg('Error rejecting booking');
    }
  };

  // Prepare chart data
  const occupancyData = stores.map(s => ({
    name: s.name.split(' ').slice(0, 2).join(' '),
    used: s.used_capacity,
    available: s.total_capacity - s.used_capacity,
    percent: Math.round((s.used_capacity / s.total_capacity) * 100)
  }));

  const revenueData = bookings.slice(0, 7).map((b, i) => ({
    day: `Day ${i + 1}`,
    revenue: parseFloat(b.total_cost) || 0
  }));

  const totalRevenue = bookings.reduce((sum, b) => sum + (parseFloat(b.total_cost) || 0), 0);
  const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED').length;
  const avgOccupancy = stores.length > 0
    ? Math.round(stores.reduce((sum, s) => sum + (s.used_capacity / s.total_capacity * 100), 0) / stores.length)
    : 0;

  const getRiskColor = (risk) => {
    if (risk === 'CRITICAL') return '#B71C1C';
    if (risk === 'HIGH') return '#E65100';
    if (risk === 'MEDIUM') return '#F57F17';
    return '#2E7D32';
  };

  const tabs = [
    { id: 'overview',  label: '📊 Overview' },
    { id: 'pending',   label: `⏳ Pending (${pending.length})` },
    { id: 'bookings',  label: '📋 All Bookings' },
    { id: 'capacity',  label: '🏪 Capacity' },
    { id: 'calendar',  label: '📅 Calendar' },
  ];

  const bookingsByDate = getBookingsByDate();

  if (loading) return (
    <div className="kcc-page-bg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', fontFamily: tk.font.family }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: tk.space[4], animation: 'kcc-float 2s ease-in-out infinite' }}>🏪</div>
        <div className="kcc-dot-loader"><span /><span /><span /></div>
        <div style={{ color: tk.color.text.muted, marginTop: tk.space[4] }}>Loading dashboard...</div>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: tk.font.family, background: tk.color.surface.sunken, minHeight: 'calc(100vh - 60px)' }}>

      {/* Header */}
      <div style={{ ...ui.pageHeader(tk.gradient.operator), padding: `${tk.space[5]} ${tk.space[6]}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', boxShadow: tk.shadow.lg }}>
        <div>
          <h1 style={{ margin: 0, fontSize: tk.font.size['2xl'], fontWeight: tk.font.weight.extrabold }}>🏪 Operator Dashboard</h1>
          <p style={{ margin: `${tk.space[1]} 0 0`, opacity: 0.85, fontSize: tk.font.size.sm, display: 'flex', alignItems: 'center', gap: tk.space[2] }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#69F0AE', display: 'inline-block', animation: 'kcc-pulse-glow 2s infinite' }} />
            Live data • Auto-refreshes every 30s
          </p>
        </div>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="kcc-hover-scale"
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: tk.radius.full, width: '52px', height: '52px', cursor: 'pointer', fontSize: '22px', position: 'relative', transition: tk.transition.spring }}
          >
            🔔
            {pending.length > 0 && (
              <span style={{
                position: 'absolute', top: '0', right: '0',
                background: tk.color.semantic.danger, color: 'white', borderRadius: tk.radius.full,
                minWidth: '20px', height: '20px', fontSize: '11px', fontWeight: tk.font.weight.bold,
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px',
                boxShadow: '0 2px 8px rgba(198,40,40,0.5)',
              }}>
                {pending.length}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="kcc-animate-in" style={{
              position: 'absolute', right: 0, top: '60px', width: '340px',
              ...ui.card({ padding: 0, overflow: 'hidden' }),
              zIndex: tk.zIndex.dropdown, boxShadow: tk.shadow.xl,
            }}>
              <div style={{ padding: `${tk.space[3]} ${tk.space[4]}`, background: THEME[600], color: 'white', fontWeight: tk.font.weight.bold, fontSize: tk.font.size.sm }}>
                🔔 Pending Bookings ({pending.length})
              </div>
              {pending.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#888', fontSize: '14px' }}>All caught up! ✅</div>
              ) : (
                pending.slice(0, 3).map(b => (
                  <div key={b.id} style={{ padding: '12px 16px', borderBottom: '1px solid #eee' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#333', marginBottom: '4px' }}>
                      {b.farmer_name} — {b.crop_name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>
                      {b.quantity_kg}kg • ₹{b.total_cost} • {b.receipt_number}
                    </div>
                    <button
                      onClick={() => { handleConfirm(b.receipt_number); setShowNotif(false); }}
                      className="kcc-hover-scale"
                      style={{ ...ui.btn('primary', tk.color.primary), padding: `${tk.space[1]} ${tk.space[3]}`, fontSize: tk.font.size.xs }}
                    >
                      ✅ Approve
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Farmer Detail Modal */}
      {farmerModal && (
        <div
          onClick={() => setFarmerModal(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '20px' }}
        >
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '16px', padding: '28px', maxWidth: '560px', width: '100%', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, color: '#1565C0' }}>👨‍🌾 {farmerModal.farmerName}</h2>
              <button onClick={() => setFarmerModal(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#888' }}>×</button>
            </div>

            {farmerModal.farmer ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px', fontSize: '14px' }}>
                <span>📱 {farmerModal.farmer.phone}</span>
                <span>🏘️ {farmerModal.farmer.village}</span>
                <span>📍 {farmerModal.farmer.district}</span>
                <span style={{ fontWeight: 'bold', color: '#1B5E20' }}>💰 Total Revenue: ₹{farmerModal.totalRevenue.toFixed(0)}</span>
              </div>
            ) : (
              <p style={{ color: '#888', fontSize: '14px' }}>Total Revenue: ₹{farmerModal.totalRevenue.toFixed(0)}</p>
            )}

            <h4 style={{ color: '#333', marginBottom: '10px' }}>Booking History</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#F5F5F5' }}>
                  {['Receipt', 'Crop', 'Qty', 'Cost', 'Status'].map(h => (
                    <th key={h} style={{ padding: '8px', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {farmerModal.farmerBookings.map((b, i) => (
                  <tr key={b.id || i} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '8px' }}>{b.receipt_number}</td>
                    <td style={{ padding: '8px' }}>{b.crop_name || '—'}</td>
                    <td style={{ padding: '8px' }}>{b.quantity_kg}kg</td>
                    <td style={{ padding: '8px' }}>₹{b.total_cost}</td>
                    <td style={{ padding: '8px' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold',
                        background: b.status === 'CONFIRMED' ? '#E8F5E9' : b.status === 'PENDING' ? '#FFF8E1' : '#FFEBEE',
                        color: b.status === 'CONFIRMED' ? '#1B5E20' : b.status === 'PENDING' ? '#F57F17' : '#B71C1C',
                      }}>{b.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {farmerModal.farmerBookings.length === 0 && (
              <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>No bookings found</p>
            )}
          </div>
        </div>
      )}

      {/* Action message */}
      {actionMsg && (
        <div style={{
          background: actionMsg.includes('✅') ? '#E8F5E9' : '#FFEBEE',
          color: actionMsg.includes('✅') ? '#1B5E20' : '#B71C1C',
          padding: '12px 24px',
          fontWeight: 'bold',
          fontSize: '14px'
        }}>
          {actionMsg}
        </div>
      )}

      {/* Tabs */}
      <div style={{ background: tk.color.surface.base, padding: `0 ${tk.space[6]}`, display: 'flex', gap: tk.space[1], borderBottom: `2px solid ${tk.color.border.light}`, overflowX: 'auto' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={ui.dashboardTab(activeTab === tab.id, THEME[600])}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: tk.space[6] }}>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div>
            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              {[
                { label: 'Total Bookings',    value: bookings.length,       icon: '📋', color: '#1565C0' },
                { label: 'Confirmed',         value: confirmedBookings,     icon: '✅', color: '#1B5E20' },
                { label: 'Pending Approval',  value: pending.length,        icon: '⏳', color: '#F57F17' },
                { label: 'Total Revenue',     value: `₹${totalRevenue.toFixed(0)}`, icon: '💰', color: '#6A1B9A' },
                { label: 'Avg Occupancy',     value: `${avgOccupancy}%`,    icon: '📦', color: '#E65100' },
                { label: 'Active Stores',     value: stores.length,         icon: '🏪', color: '#00695C' },
              ].map((stat, i) => (
                <div key={i} className="kcc-hover-lift kcc-animate-in" style={{ ...ui.statCard(stat.color), animationDelay: `${i * 0.05}s` }}>
                  <div style={{ fontSize: tk.font.size['3xl'], marginBottom: tk.space[2] }}>{stat.icon}</div>
                  <div style={{ fontSize: tk.font.size['3xl'], fontWeight: tk.font.weight.extrabold, color: stat.color, letterSpacing: '-0.02em' }}>{stat.value}</div>
                  <div style={{ color: tk.color.text.muted, fontSize: tk.font.size.sm, marginTop: tk.space[1], fontWeight: tk.font.weight.medium }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Revenue chart */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>💰 Revenue Trend</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => [`₹${v}`, 'Revenue']} />
                  <Line type="monotone" dataKey="revenue" stroke="#1565C0" strokeWidth={2} dot={{ fill: '#1565C0' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Occupancy chart */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>📦 Storage Occupancy</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={occupancyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="used" fill="#E65100" name="Used (T)" radius={[4,4,0,0]} />
                  <Bar dataKey="available" fill="#1B5E20" name="Available (T)" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* PENDING TAB */}
        {activeTab === 'pending' && (
          <div>
            <h2 style={{ color: '#333', marginBottom: '16px' }}>⏳ Pending Booking Approvals</h2>
            {pending.length === 0 ? (
              <div style={{ background: 'white', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#888' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                <div>No pending bookings — all caught up!</div>
              </div>
            ) : (
              pending.map(booking => (
                <div key={booking.id} style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '16px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  borderLeft: `4px solid ${getRiskColor(booking.spoilage_risk)}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '20px' }}>👨‍🌾</span>
                        <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{booking.farmer_name || 'Farmer'}</span>
                        {booking.spoilage_risk && (
                          <span style={{
                            background: getRiskColor(booking.spoilage_risk),
                            color: 'white',
                            padding: '2px 10px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            {booking.spoilage_risk} RISK
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px' }}>
                        {[
                          { label: 'Crop',     value: booking.crop_name || 'N/A' },
                          { label: 'Quantity', value: `${booking.quantity_kg}kg` },
                          { label: 'Duration', value: `${booking.duration_days} days` },
                          { label: 'Revenue',  value: `₹${booking.total_cost}` },
                          { label: 'Date',     value: new Date(booking.booking_date).toLocaleDateString('en-IN') },
                          { label: 'Receipt',  value: booking.receipt_number },
                        ].map((item, i) => (
                          <div key={i} style={{ fontSize: '13px' }}>
                            <span style={{ color: '#888' }}>{item.label}: </span>
                            <span style={{ fontWeight: 'bold', color: '#333' }}>{item.value}</span>
                          </div>
                        ))}
                      </div>

                      {booking.shelf_hours && (
                        <div style={{ marginTop: '8px', fontSize: '13px', color: getRiskColor(booking.spoilage_risk) }}>
                          ⚠️ Farmer needs storage within {booking.shelf_hours} hours!
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => handleConfirm(booking.receipt_number)}
                        style={{
                          padding: '10px 24px',
                          background: '#1B5E20',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '14px'
                        }}
                      >
                        ✅ Confirm
                      </button>
                      <button
                        onClick={() => handleReject(booking.receipt_number)}
                        style={{
                          padding: '10px 24px',
                          background: '#B71C1C',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '14px'
                        }}
                      >
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ALL BOOKINGS TAB */}
        {activeTab === 'bookings' && (
          <div>
            <h2 style={{ color: '#333', marginBottom: '16px' }}>📋 All Bookings</h2>
            <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#1565C0', color: 'white' }}>
                    {['Receipt', 'Farmer', 'Crop', 'Qty', 'Date', 'Cost', 'Status'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b, i) => (
                    <tr key={b.id} style={{ background: i % 2 === 0 ? 'white' : '#F9F9F9', borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px 16px', fontSize: '12px', color: '#666' }}>{b.receipt_number}</td>
                      <td style={{ padding: '10px 16px', fontSize: '13px' }}>
                        <button
                          onClick={() => openFarmerModal(b.farmer_name, b.farmer_id)}
                          style={{ background: 'none', border: 'none', color: '#1565C0', cursor: 'pointer', textDecoration: 'underline', fontSize: '13px', padding: 0 }}
                        >
                          {b.farmer_name || 'N/A'}
                        </button>
                      </td>
                      <td style={{ padding: '10px 16px', fontSize: '13px' }}>{b.crop_name || 'N/A'}</td>
                      <td style={{ padding: '10px 16px', fontSize: '13px' }}>{b.quantity_kg}kg</td>
                      <td style={{ padding: '10px 16px', fontSize: '13px' }}>{new Date(b.booking_date).toLocaleDateString('en-IN')}</td>
                      <td style={{ padding: '10px 16px', fontSize: '13px', fontWeight: 'bold' }}>₹{b.total_cost}</td>
                      <td style={{ padding: '10px 16px' }}>
                        <span style={{
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          background: b.status === 'CONFIRMED' ? '#E8F5E9' : b.status === 'PENDING' ? '#FFF8E1' : '#FFEBEE',
                          color: b.status === 'CONFIRMED' ? '#1B5E20' : b.status === 'PENDING' ? '#F57F17' : '#B71C1C'
                        }}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {bookings.length === 0 && (
                <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>No bookings yet</div>
              )}
            </div>
          </div>
        )}

        {/* CALENDAR TAB */}
        {activeTab === 'calendar' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ color: '#333', margin: 0 }}>📅 Booking Calendar</h2>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={() => {
                    if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(y => y - 1); }
                    else setCalendarMonth(m => m - 1);
                    setSelectedDate(null);
                  }}
                  style={{ padding: '6px 12px', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', background: 'white' }}
                >◀</button>
                <span style={{ fontWeight: 'bold', minWidth: '160px', textAlign: 'center' }}>
                  {MONTH_NAMES[calendarMonth]} {calendarYear}
                </span>
                <button
                  onClick={() => {
                    if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(y => y + 1); }
                    else setCalendarMonth(m => m + 1);
                    setSelectedDate(null);
                  }}
                  style={{ padding: '6px 12px', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', background: 'white' }}
                >▶</button>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
                {DAY_HEADERS.map(d => (
                  <div key={d} style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '12px', color: '#888', padding: '8px 0' }}>{d}</div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                {getCalendarDays().map((day, i) => {
                  if (!day) return <div key={`empty-${i}`} />;
                  const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const count = bookingsByDate[dateStr] || 0;
                  const isSelected = selectedDate === day;
                  return (
                    <div
                      key={day}
                      onClick={() => setSelectedDate(day)}
                      style={{
                        aspectRatio: '1',
                        background: isSelected ? '#1565C0' : getBookingCountColor(count),
                        color: isSelected ? 'white' : count > 5 ? 'white' : '#333',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        border: '1px solid #E0E0E0',
                        fontSize: '13px',
                        fontWeight: isSelected ? 'bold' : 'normal',
                      }}
                    >
                      <span>{day}</span>
                      {count > 0 && (
                        <span style={{ fontSize: '10px', marginTop: '2px', fontWeight: 'bold' }}>{count} 📋</span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '16px', fontSize: '12px', color: '#666', flexWrap: 'wrap' }}>
                {[
                  { color: '#FFFFFF', label: '0 bookings' },
                  { color: '#C8E6C9', label: '1-2 bookings' },
                  { color: '#66BB6A', label: '3-5 bookings' },
                  { color: '#1B5E20', label: '5+ bookings' },
                ].map((item, i) => (
                  <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '16px', height: '16px', background: item.color, border: '1px solid #ccc', borderRadius: '3px', display: 'inline-block' }} />
                    {item.label}
                  </span>
                ))}
              </div>
            </div>

            {selectedDate && (
              <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <h3 style={{ margin: '0 0 16px', color: '#333' }}>
                  Bookings on {selectedDate} {MONTH_NAMES[calendarMonth]} {calendarYear}
                </h3>
                {getBookingsForDate(selectedDate).length === 0 ? (
                  <p style={{ color: '#888' }}>No bookings on this date</p>
                ) : (
                  getBookingsForDate(selectedDate).map(b => (
                    <div key={b.id} style={{ padding: '12px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <span style={{ fontWeight: 'bold', color: '#1565C0' }}>{b.receipt_number}</span>
                        <span style={{ marginLeft: '12px' }}>{b.farmer_name} — {b.crop_name}</span>
                        <span style={{ marginLeft: '12px', color: '#888' }}>{b.quantity_kg}kg • ₹{b.total_cost}</span>
                      </div>
                      <span style={{
                        padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold',
                        background: b.status === 'CONFIRMED' ? '#E8F5E9' : '#FFF8E1',
                        color: b.status === 'CONFIRMED' ? '#1B5E20' : '#F57F17',
                      }}>{b.status}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* CAPACITY TAB */}
        {activeTab === 'capacity' && (
          <div>
            <h2 style={{ color: '#333', marginBottom: '16px' }}>🏪 Cold Store Capacity</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {stores.map(store => {
                const pct = Math.round((store.used_capacity / store.total_capacity) * 100);
                const color = pct > 90 ? '#B71C1C' : pct > 70 ? '#F57F17' : '#1B5E20';
                return (
                  <div key={store.id} style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                  }}>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#333' }}>🏪 {store.name}</h3>
                    <p style={{ margin: '0 0 16px 0', color: '#888', fontSize: '13px' }}>📍 {store.district}</p>

                    {/* Progress bar */}
                    <div style={{ background: '#eee', borderRadius: '8px', height: '16px', marginBottom: '8px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: color,
                        borderRadius: '8px',
                        transition: 'width 0.5s'
                      }}/>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '12px' }}>
                      <span style={{ color, fontWeight: 'bold' }}>{pct}% used</span>
                      <span style={{ color: '#888' }}>{store.total_capacity - store.used_capacity}T available</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {[
                        { label: 'Total',     value: `${store.total_capacity}T` },
                        { label: 'Used',      value: `${store.used_capacity}T` },
                        { label: 'Price',     value: `₹${store.price_per_day}/kg/day` },
                        { label: 'Rating',    value: `⭐ ${store.reliability_score}` },
                        { label: 'Min Temp',  value: `${store.min_temp}°C` },
                        { label: 'Max Temp',  value: `${store.max_temp}°C` },
                      ].map((item, i) => (
                        <div key={i} style={{ fontSize: '12px' }}>
                          <span style={{ color: '#888' }}>{item.label}: </span>
                          <span style={{ fontWeight: 'bold', color: '#333' }}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}