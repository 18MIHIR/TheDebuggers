// import React from 'react';

// function App() {
//   return (
//     <div style={{ 
//       textAlign: 'center', 
//       marginTop: '100px',
//       fontFamily: 'Arial'
//     }}>
//       <h1 style={{ color: '#1B5E20' }}>🌾 Kisan Cold Chain</h1>
//       <p style={{ color: '#424242' }}>Protecting farmer harvests with AI</p>
//       <p style={{ color: '#2E7D32' }}>Backend connected on port 3001</p>
//     </div>
//   );
// }

// export default App;

//working current
// import React, { useState } from 'react';
// import FarmerPortal from './pages/FarmerPortal';
// import USSDSimulator from './pages/USSDSimulator';

// function App() {
//   const [page, setPage] = useState('home');

//   return (
//     <div>
//       {/* Navigation */}
//       <div style={{
//         background: '#1B5E20',
//         padding: '10px 20px',
//         display: 'flex',
//         gap: '16px',
//         alignItems: 'center'
//       }}>
//         <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>🌾 Kisan Cold Chain</span>
//         <button
//           onClick={() => setPage('farmer')}
//           style={{
//             padding: '6px 16px',
//             background: page === 'farmer' ? 'white' : 'transparent',
//             color: page === 'farmer' ? '#1B5E20' : 'white',
//             border: '1px solid white',
//             borderRadius: '20px',
//             cursor: 'pointer'
//           }}
//         >
//           Farmer Portal
//         </button>
//         <button
//           onClick={() => setPage('simulator')}
//           style={{
//             padding: '6px 16px',
//             background: page === 'simulator' ? 'white' : 'transparent',
//             color: page === 'simulator' ? '#1B5E20' : 'white',
//             border: '1px solid white',
//             borderRadius: '20px',
//             cursor: 'pointer'
//           }}
//         >
//           📟 Offline Simulator
//         </button>
//       </div>

//       {/* Pages */}
//       {page === 'farmer' && <FarmerPortal />}
//       {page === 'simulator' && <USSDSimulator />}
//       {page === 'home' && (
//         <div style={{ textAlign: 'center', padding: '80px 20px', fontFamily: 'Arial' }}>
//           <h1 style={{ color: '#1B5E20', fontSize: '36px' }}>🌾 Kisan Cold Chain</h1>
//           <p style={{ color: '#666', fontSize: '18px', maxWidth: '500px', margin: '0 auto 40px' }}>
//             AI-powered cold storage platform for Indian farmers.
//             Works offline via SMS and USSD on any phone.
//           </p>
//           <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
//             <button
//               onClick={() => setPage('farmer')}
//               style={{ padding: '16px 32px', background: '#1B5E20', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}
//             >
//               👨‍🌾 Farmer Portal
//             </button>
//             <button
//               onClick={() => setPage('simulator')}
//               style={{ padding: '16px 32px', background: '#E65100', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}
//             >
//               📟 Offline Simulator
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;



//new 
// import React, { useState } from 'react';
// import FarmerPortal from './pages/FarmerPortal';
// import USSDSimulator from './pages/USSDSimulator';
// import FarmerDashboard from './pages/FarmerDashboard';
// import OperatorDashboard from './pages/OperatorDashboard';
// import TransportDashboard from './pages/TransportDashboard';

// function App() {
//   const [page, setPage] = useState('home');

//   const navBtn = (id, label, active) => (
//     <button
//       onClick={() => setPage(id)}
//       style={{
//         padding: '6px 16px',
//         background: page === id ? 'white' : 'transparent',
//         color: page === id ? '#1B5E20' : 'white',
//         border: '1px solid white',
//         borderRadius: '20px',
//         cursor: 'pointer',
//         fontSize: '13px',
//         fontWeight: page === id ? 'bold' : 'normal'
//       }}
//     >
//       {label}
//     </button>
//   );

//   return (
//     <div style={{ fontFamily: 'Segoe UI, Arial, sans-serif', minHeight: '100vh', background: '#F1F8E9' }}>
//       {/* Nav */}
//       <div style={{ background: '#1B5E20', padding: '10px 20px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
//         <span
//           onClick={() => setPage('home')}
//           style={{ color: 'white', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer', marginRight: '10px' }}
//         >
//           🌾 Kisan Cold Chain
//         </span>
//         {navBtn('farmer', '👨‍🌾 Farmer Portal')}
//         {navBtn('farmer-dash', '📊 Farmer Dashboard')}
//         {navBtn('operator', '🏪 Operator')}
//         {navBtn('transport', '🚛 Transport')}
//         {navBtn('simulator', '📟 Offline Simulator')}
//       </div>

//       {/* Pages */}
//       {page === 'farmer' && <FarmerPortal />}
//       {page === 'farmer-dash' && <FarmerDashboard />}
//       {page === 'operator' && <OperatorDashboard />}
//       {page === 'transport' && <TransportDashboard />}
//       {page === 'simulator' && <USSDSimulator />}

//       {page === 'home' && (
//         <div style={{ textAlign: 'center', padding: '60px 20px' }}>
//           <h1 style={{ color: '#1B5E20', fontSize: '40px', margin: '0 0 10px' }}>🌾 Kisan Cold Chain</h1>
//           <p style={{ color: '#555', fontSize: '18px', maxWidth: '520px', margin: '0 auto 50px' }}>
//             AI-powered cold storage platform for Indian farmers. Works offline via SMS & USSD.
//           </p>
//           <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
//             {[
//               { id: 'farmer', icon: '👨‍🌾', label: 'Farmer Portal', sub: 'Register harvest & find storage', color: '#1B5E20' },
//               { id: 'farmer-dash', icon: '📊', label: 'Farmer Dashboard', sub: 'History, predictions, mandi rates', color: '#2E7D32' },
//               { id: 'operator', icon: '🏪', label: 'Operator Dashboard', sub: 'Bookings, storage, analytics', color: '#1565C0' },
//               { id: 'transport', icon: '🚛', label: 'Transport Dashboard', sub: 'Routes, pools, earnings', color: '#E65100' },
//               { id: 'simulator', icon: '📟', label: 'Offline Simulator', sub: 'USSD & SMS demo', color: '#4A148C' },
//             ].map(card => (
//               <div
//                 key={card.id}
//                 onClick={() => setPage(card.id)}
//                 style={{
//                   background: 'white', border: `2px solid ${card.color}`, borderRadius: '12px',
//                   padding: '24px 28px', cursor: 'pointer', width: '200px',
//                   boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
//                   transition: 'transform 0.15s',
//                 }}
//                 onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
//                 onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
//               >
//                 <div style={{ fontSize: '36px', marginBottom: '10px' }}>{card.icon}</div>
//                 <div style={{ fontWeight: 'bold', color: card.color, fontSize: '15px' }}>{card.label}</div>
//                 <div style={{ color: '#777', fontSize: '12px', marginTop: '6px' }}>{card.sub}</div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Chatbot from './components/Chatbot';
import FarmerPortal from './pages/FarmerPortal';
import USSDSimulator from './pages/USSDSimulator';
import OperatorDashboard from './pages/OperatorDashboard';
import TransporterDashboard from './pages/TransporterDashboard';
import { tokens as t } from './tokens';
import { ui } from './components/ui';

function AnimatedCounter({ target, suffix = '', prefix = '', decimals = 0, duration = 1500 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const steps = 50;
    const step = target / steps;
    const interval = duration / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, interval);
    return () => clearInterval(timer);
  }, [target, duration]);

  const display = decimals > 0 ? count.toFixed(decimals) : Math.floor(count).toLocaleString('en-IN');
  return <>{prefix}{display}{suffix}</>;
}

function HomePage({ setPage }) {
  const [hoveredCard, setHoveredCard] = useState(null);

  const portals = [
    { id: 'farmer', emoji: '👨‍🌾', label: 'Farmer Portal', desc: 'Submit harvest, find cold storage', theme: t.color.primary, gradient: 'linear-gradient(145deg, #E8F5E9, #FFFFFF)' },
    { id: 'operator', emoji: '🏪', label: 'Operator Dashboard', desc: 'Manage bookings, track revenue', theme: t.color.operator, gradient: 'linear-gradient(145deg, #E3F2FD, #FFFFFF)' },
    { id: 'transporter', emoji: '🚛', label: 'Transporter Panel', desc: 'View routes, manage deliveries', theme: t.color.transporter, gradient: 'linear-gradient(145deg, #FFF3E0, #FFFFFF)' },
    { id: 'simulator', emoji: '📟', label: 'Offline Demo', desc: 'USSD & SMS simulation', theme: { 600: t.color.accent.purple, 900: '#4A148C', 50: '#F3E5F5' }, gradient: 'linear-gradient(145deg, #F3E5F5, #FFFFFF)' },
  ];

  return (
    <div style={{ minHeight: '90vh', background: t.gradient.heroMesh, fontFamily: t.font.family }}>
      {/* Hero */}
      <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: `${t.space[16]} ${t.space[5]} ${t.space[10]}`, position: 'relative' }}>
        <div className="kcc-animate-in" style={{ textAlign: 'center', maxWidth: '720px' }}>
          <div style={{ fontSize: '64px', marginBottom: t.space[4], animation: 'kcc-float 3s ease-in-out infinite' }}>🌾</div>
          <h1 className="kcc-gradient-text" style={{ fontSize: t.font.size['5xl'], fontWeight: t.font.weight.extrabold, margin: `0 0 ${t.space[3]}`, letterSpacing: '-0.03em' }}>
            Kisan Cold Chain
          </h1>
          <p style={{ color: t.color.text.secondary, fontSize: t.font.size.xl, marginBottom: t.space[10], lineHeight: 1.6 }}>
            AI-powered cold storage protecting <strong style={{ color: t.color.primary[800] }}>40 million farmers</strong> from post-harvest losses
          </p>
        </div>

        {/* Problem stats */}
        <div className="kcc-animate-in kcc-animate-in-delay-1" style={{ display: 'flex', gap: t.space[4], marginBottom: t.space[10], flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { value: '₹1.5L Cr', label: 'Annual loss', icon: '💸' },
            { value: '86%', label: 'Unconnected', icon: '📵' },
            { value: '30-40%', label: 'Wasted', icon: '🥀' },
            { value: '67%', label: 'Savings', icon: '💰' },
          ].map((stat, i) => (
            <div key={i} className="kcc-glass kcc-hover-lift" style={{
              borderRadius: t.radius.xl, padding: `${t.space[5]} ${t.space[6]}`,
              textAlign: 'center', minWidth: '140px', boxShadow: t.shadow.md,
            }}>
              <div style={{ fontSize: t.font.size['2xl'], marginBottom: t.space[1] }}>{stat.icon}</div>
              <div style={{ color: t.color.primary[900], fontSize: t.font.size['2xl'], fontWeight: t.font.weight.extrabold }}>{stat.value}</div>
              <div style={{ color: t.color.text.muted, fontSize: t.font.size.sm, marginTop: t.space[1] }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Portal cards */}
        <div className="kcc-animate-in kcc-animate-in-delay-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: t.space[5], maxWidth: '960px', width: '100%', marginBottom: t.space[16] }}>
          {portals.map(btn => (
            <button
              key={btn.id}
              onClick={() => setPage(btn.id)}
              onMouseEnter={() => setHoveredCard(btn.id)}
              onMouseLeave={() => setHoveredCard(null)}
              className="kcc-hover-lift"
              style={{
                background: btn.gradient,
                border: `2px solid ${hoveredCard === btn.id ? btn.theme[600] : t.color.border.light}`,
                borderRadius: t.radius['2xl'],
                padding: t.space[6],
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: hoveredCard === btn.id ? t.shadow.lg : t.shadow.md,
                transition: t.transition.spring,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{
                position: 'absolute', top: '-20px', right: '-20px',
                width: '80px', height: '80px', borderRadius: '50%',
                background: `${btn.theme[600]}15`,
              }} />
              <div style={{ fontSize: '44px', marginBottom: t.space[3] }}>{btn.emoji}</div>
              <div style={{ color: btn.theme[900] || btn.theme[600], fontWeight: t.font.weight.bold, fontSize: t.font.size.lg, marginBottom: t.space[2] }}>{btn.label}</div>
              <div style={{ color: t.color.text.muted, fontSize: t.font.size.sm, lineHeight: 1.5 }}>{btn.desc}</div>
              <div style={{ marginTop: t.space[4], color: btn.theme[600], fontWeight: t.font.weight.semibold, fontSize: t.font.size.sm }}>
                Open →
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section style={{ background: t.color.surface.base, padding: `${t.space[16]} ${t.space[5]}`, textAlign: 'center' }}>
        <p style={{ color: t.color.primary[600], fontWeight: t.font.weight.bold, fontSize: t.font.size.sm, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: t.space[2] }}>Simple Process</p>
        <h2 style={ui.sectionTitle()}>How It Works</h2>
        <p style={{ color: t.color.text.muted, marginBottom: t.space[10], fontSize: t.font.size.lg }}>Three steps from harvest to cold storage</p>

        <div style={{ display: 'flex', alignItems: 'stretch', justifyContent: 'center', gap: t.space[3], flexWrap: 'wrap', maxWidth: '1000px', margin: '0 auto' }}>
          {[
            { num: '1', icon: '📱', title: 'Send WhatsApp', desc: 'Farmer texts crop details via WhatsApp or SMS — works on any phone, even offline.' },
            { num: '2', icon: '🤖', title: 'AI Analyses', desc: 'AI predicts spoilage risk instantly and finds the nearest cold store with best price.' },
            { num: '3', icon: '🏪', title: 'Book Storage', desc: 'Cold store booked automatically. Shared transport pools cut costs by 67%.' },
          ].map((step, i) => (
            <React.Fragment key={step.num}>
              <div className="kcc-hover-lift" style={{
                ...ui.card({ padding: t.space[8], width: '280px', textAlign: 'center' }),
                borderTop: `4px solid ${t.color.primary[500]}`,
              }}>
                <div style={{
                  width: '40px', height: '40px',
                  background: t.gradient.farmer,
                  color: t.color.text.inverse,
                  borderRadius: t.radius.full,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: t.font.weight.bold, margin: `0 auto ${t.space[4]}`,
                  boxShadow: t.shadow.sm,
                }}>{step.num}</div>
                <div style={{ fontSize: '48px', marginBottom: t.space[4] }}>{step.icon}</div>
                <h3 style={{ color: t.color.primary[900], margin: `0 0 ${t.space[3]}`, fontSize: t.font.size.xl, fontWeight: t.font.weight.bold }}>{step.title}</h3>
                <p style={{ color: t.color.text.secondary, fontSize: t.font.size.sm, margin: 0, lineHeight: 1.6 }}>{step.desc}</p>
              </div>
              {i < 2 && (
                <div style={{ display: 'flex', alignItems: 'center', fontSize: t.font.size['3xl'], color: t.color.primary[400], fontWeight: t.font.weight.bold }}>→</div>
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* Impact */}
      <section style={{
        background: t.gradient.impact,
        backgroundSize: '200% 200%',
        animation: 'kcc-gradient-shift 6s ease infinite',
        padding: `${t.space[16]} ${t.space[5]}`,
        textAlign: 'center',
      }}>
        <h2 style={{ color: t.color.text.inverse, fontSize: t.font.size['4xl'], fontWeight: t.font.weight.extrabold, margin: `0 0 ${t.space[10]}`, letterSpacing: '-0.02em' }}>Our Impact</h2>
        <div style={{ display: 'flex', gap: t.space[6], flexWrap: 'wrap', justifyContent: 'center', maxWidth: '900px', margin: '0 auto' }}>
          {[
            { target: 1.5, prefix: '₹', suffix: 'L Cr', label: 'Loss prevented', decimals: 1 },
            { target: 40, suffix: 'M+', label: 'Farmers reached', decimals: 0 },
            { target: 15000, suffix: '+', label: 'Cold stores', decimals: 0 },
            { target: 67, suffix: '%', label: 'Transport saved', decimals: 0 },
          ].map((item, i) => (
            <div key={i} className="kcc-glass" style={{
              flex: '1 1 180px', maxWidth: '200px',
              borderRadius: t.radius.xl, padding: t.space[6],
              boxShadow: t.shadow.md,
            }}>
              <div style={{ color: t.color.primary[900], fontSize: t.font.size['4xl'], fontWeight: t.font.weight.extrabold, marginBottom: t.space[2] }}>
                <AnimatedCounter target={item.target} prefix={item.prefix || ''} suffix={item.suffix} decimals={item.decimals} />
              </div>
              <div style={{ color: t.color.text.secondary, fontSize: t.font.size.sm, fontWeight: t.font.weight.medium }}>{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: `${t.space[16]} ${t.space[5]}`, textAlign: 'center' }}>
        <h2 style={ui.sectionTitle()}>Kisan Voices</h2>
        <p style={{ color: t.color.text.muted, marginBottom: t.space[10] }}>Real stories from Madhya Pradesh farmers</p>
        <div style={{ display: 'flex', gap: t.space[5], flexWrap: 'wrap', justifyContent: 'center', maxWidth: '1000px', margin: '0 auto' }}>
          {[
            { quote: 'Pehle tamatar kharab ho jaate the, ab cold store mein safe hai. 3 hafte baad achhe daam mile!', name: 'Ramesh Verma', village: 'Ashta, Sehore' },
            { quote: 'WhatsApp pe message kiya, 10 minute mein cold store book ho gaya. Bahut aasaan hai!', name: 'Sunita Devi', village: 'Nasrullaganj' },
            { quote: '3 kisan milke ek truck liya — sab ka transport sasta pada. Zabardast system!', name: 'Mohan Patel', village: 'Sanchi' },
          ].map((item, i) => (
            <div key={i} className="kcc-hover-lift" style={{
              ...ui.card({ padding: t.space[8], width: '300px', textAlign: 'left' }),
              borderLeft: `4px solid ${t.color.primary[500]}`,
            }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: t.radius.full,
                background: t.color.primary[50], display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: t.font.size['2xl'], marginBottom: t.space[4],
              }}>👨‍🌾</div>
              <p style={{ color: t.color.text.primary, fontSize: t.font.size.base, lineHeight: 1.7, fontStyle: 'italic', margin: `0 0 ${t.space[5]}` }}>
                "{item.quote}"
              </p>
              <div style={{ fontWeight: t.font.weight.bold, color: t.color.primary[900] }}>{item.name}</div>
              <div style={{ color: t.color.text.muted, fontSize: t.font.size.sm, marginTop: t.space[1] }}>📍 {item.village}</div>
              <div style={{ marginTop: t.space[3], color: t.color.accent.gold, letterSpacing: '2px' }}>★★★★★</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState('home');

  const getChatbotRole = () => {
    if (page === 'operator') return 'operator';
    if (page === 'transporter') return 'transporter';
    return 'farmer';
  };

  return (
    <div style={{ fontFamily: t.font.family, minHeight: '100vh' }}>
      <Navbar activePage={page} setPage={setPage} />

      {page === 'home'        && <HomePage setPage={setPage} />}
      {page === 'farmer'      && <FarmerPortal />}
      {page === 'simulator'   && <USSDSimulator />}
      {page === 'operator' && <OperatorDashboard />}
      {page === 'transporter' && <TransporterDashboard />}

      <Chatbot role={getChatbotRole()} />
    </div>
  );
}