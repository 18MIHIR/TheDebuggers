import React, { useState, useEffect } from 'react';
import { tokens as tk } from '../tokens';
import { ui } from '../components/ui';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import shadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl: icon,
  shadowUrl: shadow,
});

const API = 'http://localhost:3001';
const THEME = tk.color.transporter;

const createNumberedIcon = (number) => L.divIcon({
  html: `<div style="
    background:#E65100;
    color:white;
    width:30px;
    height:30px;
    border-radius:50%;
    display:flex;
    align-items:center;
    justify-content:center;
    font-weight:bold;
    font-size:14px;
    border:2px solid white;
    box-shadow:0 2px 4px rgba(0,0,0,0.3)
  ">${number}</div>`,
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const storeIcon = L.divIcon({
  html: `<div style="
    background:#1B5E20;
    color:white;
    width:36px;
    height:36px;
    border-radius:50%;
    display:flex;
    align-items:center;
    justify-content:center;
    font-size:18px;
    border:2px solid white;
    box-shadow:0 2px 4px rgba(0,0,0,0.3)
  ">🏪</div>`,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

export default function TransporterDashboard() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [poolDetails, setPoolDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('jobs');
  const [actionMsg, setActionMsg] = useState('');
  const [coldStores, setColdStores] = useState([]);

  useEffect(() => {
    fetchJobs();
    fetch(`${API}/api/coldstores`).then(r => r.json()).then(setColdStores).catch(() => {});
    const interval = setInterval(fetchJobs, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchJobs = async () => {
    try {
      const result = await fetch(`${API}/api/transport`).then(r => r.json());
      setJobs(result);
    } catch (err) {
      console.error('Error:', err);
    }
    setLoading(false);
  };

  const fetchPoolDetails = async (jobId) => {
    try {
      const result = await fetch(`${API}/api/transport/${jobId}/details`).then(r => r.json());
      setPoolDetails(result);
      setSelectedJob(jobId);
      setActiveTab('route');
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const lockRoute = async (jobId) => {
    try {
      const result = await fetch(`${API}/api/transport/${jobId}/lock`, { method: 'POST' }).then(r => r.json());
      setActionMsg(`✅ Route locked! ${result.farmersNotified} farmers notified via WhatsApp.`);
      fetchJobs();
      setTimeout(() => setActionMsg(''), 5000);
    } catch (err) {
      setActionMsg('Error locking route');
    }
  };

  const getStatusColor = (status) => {
    if (status === 'OPEN')     return { bg: '#E8F5E9', text: '#1B5E20' };
    if (status === 'LOCKED')   return { bg: '#E3F2FD', text: '#1565C0' };
    if (status === 'IN_TRANSIT') return { bg: '#FFF8E1', text: '#F57F17' };
    if (status === 'DELIVERED') return { bg: '#F3E5F5', text: '#6A1B9A' };
    return { bg: '#F5F5F5', text: '#666' };
  };

  const totalFarmers = jobs.reduce((sum, j) => sum + parseInt(j.farmer_count || 0), 0);
  const totalQuantity = jobs.reduce((sum, j) => sum + parseInt(j.filled_kg || 0), 0);
  const openJobs = jobs.filter(j => j.status === 'OPEN').length;
  const estimatedEarnings = jobs.filter(j => j.status !== 'DELIVERED').length * 3000;

  const tabs = [
    { id: 'jobs',  label: '📋 Available Jobs' },
    { id: 'route', label: '🗺️ Route Details' },
    { id: 'stats', label: '📊 My Stats' },
  ];

  if (loading) return (
    <div className="kcc-page-bg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', fontFamily: tk.font.family }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: tk.space[4], animation: 'kcc-float 2s ease-in-out infinite' }}>🚛</div>
        <div className="kcc-dot-loader"><span /><span /><span /></div>
        <div style={{ color: tk.color.text.muted, marginTop: tk.space[4] }}>Loading transport jobs...</div>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: tk.font.family, background: tk.color.surface.sunken, minHeight: 'calc(100vh - 60px)' }}>

      {/* Header */}
      <div style={{ ...ui.pageHeader(tk.gradient.transporter), padding: `${tk.space[5]} ${tk.space[6]}`, boxShadow: tk.shadow.lg }}>
        <h1 style={{ margin: 0, fontSize: tk.font.size['2xl'], fontWeight: tk.font.weight.extrabold }}>🚛 Transporter Dashboard</h1>
        <p style={{ margin: `${tk.space[1]} 0 0`, opacity: 0.85, fontSize: tk.font.size.sm }}>
          Manage transport jobs and optimised pickup routes
        </p>
      </div>

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

      {/* Stats bar */}
      <div style={{
        background: tk.color.surface.base,
        padding: `${tk.space[4]} ${tk.space[6]}`,
        display: 'flex', gap: tk.space[8], borderBottom: `1px solid ${tk.color.border.light}`, flexWrap: 'wrap',
      }}>
        {[
          { label: 'Open Jobs', value: openJobs, icon: '📋' },
          { label: 'Total Farmers', value: totalFarmers, icon: '👨‍🌾' },
          { label: 'Total Produce', value: `${totalQuantity}kg`, icon: '⚖️' },
          { label: 'Est. Earnings', value: `₹${estimatedEarnings}`, icon: '💰' },
        ].map((stat, i) => (
          <div key={i} className="kcc-hover-lift" style={{ textAlign: 'center', padding: tk.space[2], borderRadius: tk.radius.md, transition: tk.transition.normal }}>
            <div style={{ fontSize: tk.font.size.xl }}>{stat.icon}</div>
            <div style={{ fontSize: tk.font.size['2xl'], fontWeight: tk.font.weight.extrabold, color: THEME[600] }}>{stat.value}</div>
            <div style={{ fontSize: tk.font.size.xs, color: tk.color.text.muted, fontWeight: tk.font.weight.medium }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ background: tk.color.surface.base, padding: `0 ${tk.space[6]}`, display: 'flex', gap: tk.space[1], borderBottom: `2px solid ${tk.color.border.light}` }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={ui.dashboardTab(activeTab === tab.id, THEME[600])}>
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: tk.space[6] }}>

        {/* JOBS TAB */}
        {activeTab === 'jobs' && (
          <div>
            <h2 style={{ color: '#333', marginBottom: '16px' }}>📋 Transport Jobs</h2>
            {jobs.length === 0 ? (
              <div style={{ background: 'white', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#888' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚛</div>
                <div>No transport jobs available yet</div>
                <div style={{ fontSize: '13px', marginTop: '8px' }}>Jobs appear when farmers book cold storage</div>
              </div>
            ) : (
              jobs.map(job => {
                const statusStyle = getStatusColor(job.status);
                const fillPercent = job.total_capacity_kg > 0
                  ? Math.round((job.filled_kg / job.total_capacity_kg) * 100)
                  : 0;

                return (
                  <div key={job.id} style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    borderLeft: '4px solid #E65100'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ flex: 1 }}>
                        {/* Job header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                          <span style={{ fontSize: '24px' }}>🚛</span>
                          <div>
                            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                              Job #{job.id} — {job.store_name || 'Cold Store'}
                            </div>
                            <div style={{ fontSize: '13px', color: '#888' }}>
                              📅 {new Date(job.pickup_date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </div>
                          </div>
                          <span style={{
                            background: statusStyle.bg,
                            color: statusStyle.text,
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            {job.status}
                          </span>
                        </div>

                        {/* Job details grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px', marginBottom: '12px' }}>
                          {[
                            { label: '👨‍🌾 Farmers',   value: job.farmer_count || 0 },
                            { label: '⚖️ Total Load', value: `${job.filled_kg || 0}kg` },
                            { label: '📦 Capacity',   value: `${job.total_capacity_kg}kg` },
                            { label: '💰 Earnings',   value: `₹${3000}` },
                          ].map((item, i) => (
                            <div key={i} style={{
                              background: '#F5F5F5',
                              borderRadius: '8px',
                              padding: '10px 14px',
                              fontSize: '13px'
                            }}>
                              <div style={{ color: '#888', marginBottom: '2px' }}>{item.label}</div>
                              <div style={{ fontWeight: 'bold', color: '#333', fontSize: '16px' }}>{item.value}</div>
                            </div>
                          ))}
                        </div>

                        {/* Fill progress */}
                        <div style={{ marginBottom: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#888', marginBottom: '4px' }}>
                            <span>Truck fill level</span>
                            <span>{fillPercent}%</span>
                          </div>
                          <div style={{ background: '#eee', borderRadius: '8px', height: '10px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${fillPercent}%`,
                              height: '100%',
                              background: fillPercent > 70 ? '#1B5E20' : '#E65100',
                              borderRadius: '8px',
                              transition: 'width 0.5s'
                            }}/>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button
                          onClick={() => fetchPoolDetails(job.id)}
                          style={{
                            padding: '10px 20px',
                            background: '#E65100',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '13px'
                          }}
                        >
                          🗺️ View Route
                        </button>
                        {job.status === 'OPEN' && parseInt(job.farmer_count) > 0 && (
                          <button
                            onClick={() => lockRoute(job.id)}
                            style={{
                              padding: '10px 20px',
                              background: '#1565C0',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontWeight: 'bold',
                              fontSize: '13px'
                            }}
                          >
                            🔒 Lock Route
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ROUTE TAB */}
        {activeTab === 'route' && (
          <div>
            <h2 style={{ color: '#333', marginBottom: '16px' }}>🗺️ Pickup Route</h2>
            {!poolDetails ? (
              <div style={{ background: 'white', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#888' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
                <div>Select a job from Available Jobs to see the route</div>
              </div>
            ) : (
              <div>
                {/* Route summary */}
                <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <h3 style={{ margin: '0 0 12px 0', color: '#E65100' }}>Job #{selectedJob} Summary</h3>
                  <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                    {[
                      { label: 'Farmers in pool', value: poolDetails.totalFarmers },
                      { label: 'Total produce',   value: `${poolDetails.totalQuantity}kg` },
                      { label: 'Pickup date',     value: new Date(poolDetails.job?.pickup_date).toLocaleDateString('en-IN') },
                      { label: 'Estimated earn',  value: '₹3,000' },
                    ].map((item, i) => (
                      <div key={i}>
                        <div style={{ color: '#888', fontSize: '12px' }}>{item.label}</div>
                        <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#333' }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Route Map */}
                {poolDetails.farmers.some(f => f.lat && f.lng) && (
                  <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <h3 style={{ margin: '0 0 12px 0', color: '#333' }}>🗺️ Route Map</h3>
                    <MapContainer
                      center={[
                        parseFloat(poolDetails.farmers[0].lat) || 23.2599,
                        parseFloat(poolDetails.farmers[0].lng) || 77.4126,
                      ]}
                      zoom={9}
                      style={{ height: '320px', borderRadius: '12px', zIndex: 0 }}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      {poolDetails.farmers.filter(f => f.lat && f.lng).map(farmer => (
                        <Marker
                          key={farmer.id}
                          position={[parseFloat(farmer.lat), parseFloat(farmer.lng)]}
                          icon={createNumberedIcon(farmer.pickup_sequence)}
                        >
                          <Popup>
                            <b>Stop {farmer.pickup_sequence}: {farmer.name}</b><br />
                            {farmer.village} — {farmer.quantity_kg}kg
                          </Popup>
                        </Marker>
                      ))}
                      {(() => {
                        const store = coldStores.find(s => s.id === poolDetails.job?.cold_store_id);
                        if (store?.lat && store?.lng) {
                          return (
                            <Marker position={[parseFloat(store.lat), parseFloat(store.lng)]} icon={storeIcon}>
                              <Popup><b>🏪 {store.name}</b><br />Destination</Popup>
                            </Marker>
                          );
                        }
                        return null;
                      })()}
                      <Polyline
                        positions={poolDetails.farmers
                          .filter(f => f.lat && f.lng)
                          .map(f => [parseFloat(f.lat), parseFloat(f.lng)])}
                        color="#E65100"
                        weight={3}
                        dashArray="5,10"
                      />
                    </MapContainer>
                  </div>
                )}

                {/* Pickup sequence */}
                <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>📍 Optimised Pickup Sequence</h3>
                  <p style={{ color: '#888', fontSize: '13px', margin: '0 0 16px 0' }}>
                    Route calculated using nearest-neighbour algorithm for minimum distance
                  </p>

                  {/* Route visualization */}
                  <div style={{ position: 'relative' }}>
                    {poolDetails.farmers.map((farmer, i) => (
                      <div key={farmer.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '8px' }}>
                        {/* Timeline */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '40px' }}>
                          <div style={{
                            width: '36px', height: '36px',
                            background: '#E65100',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '16px',
                            zIndex: 1
                          }}>
                            {farmer.pickup_sequence}
                          </div>
                          {i < poolDetails.farmers.length - 1 && (
                            <div style={{ width: '2px', height: '40px', background: '#ddd', margin: '4px 0' }}/>
                          )}
                        </div>

                        {/* Farmer card */}
                        <div style={{
                          flex: 1,
                          background: '#F9F9F9',
                          borderRadius: '10px',
                          padding: '14px 16px',
                          marginBottom: '8px',
                          border: '1px solid #eee'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontWeight: 'bold', fontSize: '15px' }}>
                                👨‍🌾 {farmer.name}
                              </div>
                              <div style={{ color: '#888', fontSize: '13px', marginTop: '2px' }}>
                                📍 {farmer.village} • 📱 {farmer.phone}
                              </div>
                              <div style={{ color: '#888', fontSize: '13px' }}>
                                📍 GPS: {parseFloat(farmer.lat).toFixed(4)}, {parseFloat(farmer.lng).toFixed(4)}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontWeight: 'bold', color: '#E65100', fontSize: '16px' }}>
                                {farmer.quantity_kg}kg
                              </div>
                              <div style={{ color: '#888', fontSize: '12px' }}>to pick up</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Final destination */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '36px', height: '36px',
                        background: '#1B5E20',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px'
                      }}>
                        🏪
                      </div>
                      <div style={{
                        flex: 1,
                        background: '#E8F5E9',
                        borderRadius: '10px',
                        padding: '14px 16px',
                        border: '1px solid #A5D6A7'
                      }}>
                        <div style={{ fontWeight: 'bold', color: '#1B5E20', fontSize: '15px' }}>
                          DESTINATION — Cold Store
                        </div>
                        <div style={{ color: '#888', fontSize: '13px', marginTop: '2px' }}>
                          Drop all {poolDetails.totalQuantity}kg produce here
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cost breakdown */}
                  <div style={{
                    marginTop: '20px',
                    background: '#FFF8E1',
                    borderRadius: '10px',
                    padding: '16px',
                    border: '1px solid #FFE082'
                  }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#F57F17' }}>💰 Cost Savings for Farmers</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                      <span>Private truck (each farmer)</span>
                      <span style={{ fontWeight: 'bold' }}>₹3,000</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                      <span>Shared cost (each farmer)</span>
                      <span style={{ fontWeight: 'bold', color: '#1B5E20' }}>
                        ₹{Math.round(3000 / (poolDetails.totalFarmers || 1))}
                      </span>
                    </div>
                    <div style={{ borderTop: '1px solid #FFE082', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                      <span style={{ fontWeight: 'bold' }}>Each farmer saves</span>
                      <span style={{ fontWeight: 'bold', color: '#1B5E20', fontSize: '16px' }}>
                        ₹{3000 - Math.round(3000 / (poolDetails.totalFarmers || 1))} 🎉
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STATS TAB */}
        {activeTab === 'stats' && (
          <div>
            <h2 style={{ color: '#333', marginBottom: '16px' }}>📊 My Statistics</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              {[
                { label: 'Total Jobs',        value: jobs.length,          icon: '🚛', color: '#E65100' },
                { label: 'Farmers Served',    value: totalFarmers,         icon: '👨‍🌾', color: '#1B5E20' },
                { label: 'Produce Delivered', value: `${totalQuantity}kg`, icon: '⚖️', color: '#1565C0' },
                { label: 'Total Earnings',    value: `₹${jobs.filter(j => j.status === 'DELIVERED').length * 3000}`, icon: '💰', color: '#6A1B9A' },
              ].map((stat, i) => (
                <div key={i} style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  borderLeft: `4px solid ${stat.color}`,
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>{stat.icon}</div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: stat.color }}>{stat.value}</div>
                  <div style={{ color: '#888', fontSize: '13px', marginTop: '4px' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Tips */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#E65100' }}>💡 Tips to Maximise Earnings</h3>
              {[
                'Accept jobs with 3+ farmers — shared transport earns same fee with lower fuel cost per km',
                'Lock routes 24 hours before pickup — gives farmers time to prepare produce',
                'Use ventilated trucks for vegetables — reduces spoilage complaints',
                'Early morning pickups (6-8 AM) keep produce fresh during transport',
                'Build relationships with cold store operators for priority job assignments',
              ].map((tip, i) => (
                <div key={i} style={{
                  display: 'flex',
                  gap: '10px',
                  padding: '10px 0',
                  borderBottom: i < 4 ? '1px solid #eee' : 'none',
                  fontSize: '14px',
                  color: '#444'
                }}>
                  <span style={{ color: '#E65100', fontWeight: 'bold' }}>{i + 1}.</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}