import React, { useState, useEffect, useRef } from 'react';
import { tokens as tk } from '../tokens';

const CROPS = ['TOMATO', 'POTATO', 'ONION', 'MANGO', 'APPLE', 'BANANA', 'CAULIFLOWER'];
const LOCATIONS = ['SEHORE', 'VIDISHA', 'HOSHANGABAD', 'RAISEN', 'BHOPAL'];

const RISK_COLORS = {
  LOW: '#2E7D32',
  MEDIUM: '#F57F17',
  HIGH: '#E65100',
  CRITICAL: '#B71C1C'
};

export default function USSDSimulator() {
  const [mode, setMode] = useState('menu'); // menu, ussd, sms
  const [ussdScreen, setUssdScreen] = useState(0);
  const [ussdInput, setUssdInput] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [quantity, setQuantity] = useState('');
  const [location, setLocation] = useState('');
  const [smsMessages, setSmsMessages] = useState([]);
  const [smsInput, setSmsInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [stores, setStores] = useState([]);
  const [phoneNumber] = useState('+91 98XXX XXXXX');
  const [signal] = useState(3);
  const [battery] = useState(72);
  const [time, setTime] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetch('http://localhost:3001/api/coldstores')
      .then(r => r.json())
      .then(data => setStores(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [smsMessages]);

  // ── USSD Logic ─────────────────────────────────────────────

  const ussdScreens = [
    {
      text: `Welcome to Kisan Cold Chain\n*384*5678#\n\n1. Register Harvest\n2. Find Cold Store\n3. My Bookings\n4. Transport Pool\n5. Help`,
      prompt: 'Enter option:'
    },
    {
      text: `Register Harvest\n\nSelect crop:\n1. Tomato\n2. Potato\n3. Onion\n4. Mango\n5. Other`,
      prompt: 'Enter crop number:'
    },
    {
      text: `Enter quantity in KG:\n(Example: 200)`,
      prompt: 'Enter KG:'
    },
    {
      text: `Enter nearest town:\n(Example: SEHORE)`,
      prompt: 'Enter town:'
    }
  ];

  const cropMap = { '1': 'TOMATO', '2': 'POTATO', '3': 'ONION', '4': 'MANGO', '5': 'OTHER' };

  const handleUSSDInput = async () => {
    if (!ussdInput.trim()) return;
    const input = ussdInput.trim();
    setUssdInput('');

    if (ussdScreen === 0) {
      if (input === '1') setUssdScreen(1);
      else if (input === '2') setUssdScreen(10);
      else if (input === '3') setUssdScreen(11);
      else if (input === '4') setUssdScreen(12);
    } else if (ussdScreen === 1) {
      setSelectedCrop(cropMap[input] || 'TOMATO');
      setUssdScreen(2);
    } else if (ussdScreen === 2) {
      setQuantity(input);
      setUssdScreen(3);
    } else if (ussdScreen === 3) {
      setLocation(input);
      setIsTyping(true);
      // Call AI
      try {
        const res = await fetch('http://localhost:8000/predict-spoilage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            crop: selectedCrop,
            quantity_kg: parseInt(quantity) || 100,
            temperature_c: 30,
            humidity_pct: 75,
            hour_of_day: new Date().getHours()
          })
        });
        const data = await res.json();
        setAiResult(data);
      } catch (e) {
        setAiResult({ risk: 'MEDIUM', shelf_hours: 24 });
      }
      setTimeout(() => {
        setIsTyping(false);
        setUssdScreen(4);
      }, 1500);
    }
  };

  const getUSSDResultScreen = () => {
    if (!aiResult) return '';
    const store = stores[0];
    return `Processing complete!\n\nCrop: ${selectedCrop} ${quantity}kg\nRisk: ${aiResult.risk}\nSafe: ${aiResult.shelf_hours} hours\n\nNearest Store:\n${store ? store.name : 'Shri Ram Cold Storage'}\n${store ? store.district : 'Sehore'} - 12km\nRs ${store ? store.price_per_day : '8.50'}/kg/day\n\nSMS sent to confirm booking.\nDial again: *384*5678#`;
  };

  // ── SMS Logic ─────────────────────────────────────────────

  const addMessage = (text, sender, delay = 0) => {
    setTimeout(() => {
      setSmsMessages(prev => [...prev, {
        id: Date.now() + delay,
        text,
        sender,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      }]);
    }, delay);
  };

  const handleSMSSend = async () => {
    if (!smsInput.trim()) return;
    const message = smsInput.trim().toUpperCase();
    setSmsInput('');

    // Add farmer message
    addMessage(smsInput.trim(), 'farmer');

    setIsTyping(true);

    try {
      if (message.startsWith('KISAN')) {
        const parts = message.split(' ');
        const crop = parts[1] || 'TOMATO';
        const qty = parseInt(parts[2]) || 100;
        const loc = parts[3] || 'SEHORE';

        // Call AI
        const res = await fetch('http://localhost:8000/predict-spoilage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            crop,
            quantity_kg: qty,
            temperature_c: 30,
            humidity_pct: 75,
            hour_of_day: new Date().getHours()
          })
        });
        const ai = await res.json();
        const store = stores[0];

        setTimeout(() => {
          setIsTyping(false);
          const reply = `Namaskar! ${crop} ${qty}kg register hua.\n\n⚠️ Spoilage Risk: ${ai.risk}\n⏱ ${ai.shelf_hours} ghante safe\n\n🏪 Nearest Store:\n${store ? store.name : 'Shri Ram Cold Storage'}\n📍 12km | ₹${store ? store.price_per_day : '8.50'}/kg/day\n📦 Available: ${store ? (store.total_capacity - store.used_capacity) : 450}T\n\n🚛 2 farmers pooling transport\n💰 Save ₹2,000 on transport!\n\nBook karne ke liye YES bhejein\nAur options ke liye INFO bhejein`;
          addMessage(reply, 'bot');
        }, 1500);

      } else if (message === 'YES') {
        setTimeout(() => {
          setIsTyping(false);
          addMessage(`✅ Booking Request Sent!\n\nReceipt: KCC-${Date.now().toString().slice(-6)}\nStore: Shri Ram Cold Storage\nStatus: Pending operator approval\n\nOperator ko notification bheja gaya.\n2 ghante mein confirmation milegi.\n\nTransport pool mein add kiya gaya.\nPickup: Kal subah 8:00 AM`, 'bot');
        }, 1000);

      } else if (message === 'INFO') {
        setTimeout(() => {
          setIsTyping(false);
          const storeList = stores.slice(0, 3).map((s, i) =>
            `${i + 1}. ${s.name}\n   ${s.district} | ₹${s.price_per_day}/kg/day\n   Available: ${s.total_capacity - s.used_capacity}T`
          ).join('\n\n');
          addMessage(`🏪 Nearby Cold Stores:\n\n${storeList || 'No stores found'}\n\nKisi bhi number reply karein booking ke liye.`, 'bot');
        }, 1000);

      } else if (message === 'HELP') {
        setTimeout(() => {
          setIsTyping(false);
          addMessage(`KISAN BOT Help:\n\n1. Harvest register:\nKISAN [fasal] [kg] [shahar]\nEx: KISAN TOMATO 200 SEHORE\n\n2. Booking confirm:\nYES\n\n3. More stores:\nINFO\n\n4. This help:\nHELP\n\nFasalein: TOMATO, POTATO, ONION, MANGO, APPLE, BANANA`, 'bot');
        }, 800);

      } else {
        setTimeout(() => {
          setIsTyping(false);
          addMessage(`Format samajh nahi aaya.\nSend करें: KISAN [fasal] [kg] [shahar]\nExample: KISAN TOMATO 200 SEHORE\nHelp ke liye: HELP`, 'bot');
        }, 800);
      }
    } catch (err) {
      setIsTyping(false);
      addMessage('Server se connect nahi ho pa raha. Please try again.', 'bot');
    }
  };

  // ── RENDER ─────────────────────────────────────────────────

  const SignalBars = () => (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1px' }}>
      {[1,2,3,4].map(b => (
        <div key={b} style={{
          width: '3px',
          height: `${b * 3}px`,
          backgroundColor: b <= signal ? 'white' : 'rgba(255,255,255,0.3)',
          borderRadius: '1px'
        }}/>
      ))}
    </div>
  );

  return (
    <div style={{
      minHeight: 'calc(100vh - 60px)',
      background: tk.gradient.farmer,
      backgroundSize: '200% 200%',
      animation: 'kcc-gradient-shift 10s ease infinite',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: tk.space[5],
      fontFamily: tk.font.family,
    }}>

      <div className="kcc-animate-in" style={{ textAlign: 'center', marginBottom: tk.space[8] }}>
        <div style={{ fontSize: '48px', marginBottom: tk.space[2], animation: 'kcc-float 3s ease-in-out infinite' }}>📟</div>
        <h1 style={{ color: tk.color.text.inverse, margin: 0, fontSize: tk.font.size['3xl'], fontWeight: tk.font.weight.extrabold }}>Offline Simulator</h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', margin: `${tk.space[2]} 0 0`, fontSize: tk.font.size.base }}>
          USSD & SMS — works on any phone, any network
        </p>
      </div>

      <div style={{ display: 'flex', gap: tk.space[3], marginBottom: tk.space[8] }}>
        {[
          { id: 'ussd', label: '📟 USSD Demo', desc: '*384*5678#' },
          { id: 'sms', label: '💬 SMS Demo', desc: 'Feature phone' }
        ].map(m => (
          <button
            key={m.id}
            onClick={() => { setMode(m.id); setUssdScreen(0); setSmsMessages([]); setAiResult(null); }}
            className="kcc-hover-scale"
            style={{
              padding: `${tk.space[3]} ${tk.space[6]}`,
              backgroundColor: mode === m.id ? tk.color.surface.base : 'rgba(255,255,255,0.15)',
              color: mode === m.id ? tk.color.primary[900] : tk.color.text.inverse,
              border: `2px solid ${mode === m.id ? tk.color.surface.base : 'rgba(255,255,255,0.4)'}`,
              borderRadius: tk.radius.full,
              cursor: 'pointer',
              transition: tk.transition.spring,
              fontFamily: tk.font.family,
              fontWeight: mode === m.id ? tk.font.weight.bold : tk.font.weight.medium,
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            {m.label}<br/>
            <span style={{ fontSize: '11px', fontWeight: 'normal' }}>{m.desc}</span>
          </button>
        ))}
      </div>

      {/* Phone mockup */}
      <div style={{
        width: '320px',
        background: '#1a1a2e',
        borderRadius: '40px',
        padding: '12px',
        boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
        border: '3px solid #333'
      }}>

        {/* Phone notch */}
        <div style={{
          width: '120px',
          height: '25px',
          background: '#1a1a2e',
          borderRadius: '0 0 15px 15px',
          margin: '0 auto 8px',
          position: 'relative',
          zIndex: 10
        }}/>

        {/* Screen */}
        <div style={{
          background: mode === 'ussd' ? '#000' : '#ECE5DD',
          borderRadius: '30px',
          overflow: 'hidden',
          minHeight: '560px',
          display: 'flex',
          flexDirection: 'column'
        }}>

          {/* Status bar */}
          <div style={{
            background: mode === 'ussd' ? '#111' : '#075E54',
            padding: '8px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>{time}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <SignalBars />
              <span style={{ color: 'white', fontSize: '10px' }}>2G</span>
              <span style={{ color: 'white', fontSize: '10px' }}>🔋{battery}%</span>
            </div>
          </div>

          {/* ── USSD MODE ── */}
          {mode === 'ussd' && (
            <>
              {/* Header */}
              <div style={{ background: '#111', padding: '8px 16px', borderBottom: '1px solid #333' }}>
                <div style={{ color: '#4CAF50', fontSize: '12px', fontWeight: 'bold' }}>USSD Session Active</div>
                <div style={{ color: '#888', fontSize: '10px' }}>*384*5678# • Kisan Cold Chain</div>
              </div>

              {/* USSD Screen content */}
              <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column' }}>
                {isTyping ? (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ color: '#4CAF50', fontSize: '14px', textAlign: 'center' }}>
                      <div style={{ marginBottom: '10px' }}>⏳ Processing...</div>
                      <div style={{ color: '#666', fontSize: '12px' }}>Connecting to server</div>
                    </div>
                  </div>
                ) : ussdScreen === 4 ? (
                  <div style={{ flex: 1 }}>
                    <pre style={{
                      color: aiResult ? RISK_COLORS[aiResult.risk] : '#4CAF50',
                      fontSize: '12px',
                      whiteSpace: 'pre-wrap',
                      margin: 0,
                      lineHeight: '1.6',
                      fontFamily: 'monospace'
                    }}>
                      {getUSSDResultScreen()}
                    </pre>
                    <button
                      onClick={() => { setUssdScreen(0); setAiResult(null); setSelectedCrop(''); setQuantity(''); setLocation(''); }}
                      style={{
                        marginTop: '16px',
                        width: '100%',
                        padding: '10px',
                        background: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                    >
                      🔄 Start Over
                    </button>
                  </div>
                ) : ussdScreen === 10 ? (
                  <pre style={{ color: '#4CAF50', fontSize: '12px', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                    {`Nearby Cold Stores:\n\n${stores.slice(0,3).map((s,i) => `${i+1}. ${s.name}\n   ${s.district}\n   Rs${s.price_per_day}/kg/day`).join('\n\n') || 'Loading...'}\n\n0. Back to menu`}
                  </pre>
                ) : (
                  <>
                    <pre style={{
                      color: '#4CAF50',
                      fontSize: '13px',
                      whiteSpace: 'pre-wrap',
                      margin: '0 0 16px 0',
                      lineHeight: '1.7',
                      fontFamily: 'monospace',
                      flex: 1
                    }}>
                      {ussdScreens[ussdScreen]?.text}
                    </pre>

                    {/* Progress indicator */}
                    {ussdScreen > 0 && (
                      <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
                        {[1,2,3].map(s => (
                          <div key={s} style={{
                            flex: 1, height: '3px',
                            background: s <= ussdScreen ? '#4CAF50' : '#333',
                            borderRadius: '2px'
                          }}/>
                        ))}
                      </div>
                    )}

                    <div style={{ color: '#888', fontSize: '11px', marginBottom: '8px' }}>
                      {ussdScreens[ussdScreen]?.prompt}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        value={ussdInput}
                        onChange={e => setUssdInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleUSSDInput()}
                        placeholder="Type here..."
                        style={{
                          flex: 1,
                          padding: '10px',
                          background: '#1a1a1a',
                          border: '1px solid #444',
                          borderRadius: '8px',
                          color: '#4CAF50',
                          fontSize: '14px',
                          fontFamily: 'monospace',
                          outline: 'none'
                        }}
                      />
                      <button
                        onClick={handleUSSDInput}
                        style={{
                          padding: '10px 16px',
                          background: '#4CAF50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '16px'
                        }}
                      >
                        ✓
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {/* ── SMS MODE ── */}
          {mode === 'sms' && (
            <>
              {/* WhatsApp header */}
              <div style={{
                background: '#075E54',
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{
                  width: '36px', height: '36px',
                  background: '#25D366',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px'
                }}>🌾</div>
                <div>
                  <div style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>Kisan Cold Chain</div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>+1 415 523 8886 • Online</div>
                </div>
              </div>

              {/* Messages area */}
              <div style={{
                flex: 1,
                padding: '12px',
                overflowY: 'auto',
                maxHeight: '420px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                {/* Welcome message */}
                {smsMessages.length === 0 && (
                  <div style={{
                    background: 'rgba(0,0,0,0.1)',
                    borderRadius: '8px',
                    padding: '10px',
                    textAlign: 'center',
                    fontSize: '11px',
                    color: '#666',
                    margin: '8px 0'
                  }}>
                    Send a message to start<br/>
                    Try: <strong>KISAN TOMATO 200 SEHORE</strong>
                  </div>
                )}

                {smsMessages.map(msg => (
                  <div key={msg.id} style={{
                    display: 'flex',
                    justifyContent: msg.sender === 'farmer' ? 'flex-end' : 'flex-start'
                  }}>
                    <div style={{
                      maxWidth: '80%',
                      background: msg.sender === 'farmer' ? '#DCF8C6' : 'white',
                      borderRadius: msg.sender === 'farmer'
                        ? '12px 12px 0 12px'
                        : '12px 12px 12px 0',
                      padding: '8px 12px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}>
                      <pre style={{
                        margin: 0,
                        fontSize: '12px',
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'Arial',
                        color: '#333',
                        lineHeight: '1.5'
                      }}>{msg.text}</pre>
                      <div style={{
                        fontSize: '10px',
                        color: '#999',
                        textAlign: 'right',
                        marginTop: '4px'
                      }}>
                        {msg.time} {msg.sender === 'farmer' ? '✓✓' : ''}
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <div style={{
                      background: 'white',
                      borderRadius: '12px 12px 12px 0',
                      padding: '10px 16px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}>
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        {[0,1,2].map(i => (
                          <div key={i} style={{
                            width: '6px', height: '6px',
                            background: '#999',
                            borderRadius: '50%',
                            animation: `bounce 1s ${i * 0.2}s infinite`
                          }}/>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef}/>
              </div>

              {/* Input area */}
              <div style={{
                background: '#F0F0F0',
                padding: '8px',
                display: 'flex',
                gap: '8px',
                alignItems: 'center'
              }}>
                <input
                  value={smsInput}
                  onChange={e => setSmsInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSMSSend()}
                  placeholder="Type a message..."
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '20px',
                    border: 'none',
                    fontSize: '13px',
                    outline: 'none',
                    background: 'white'
                  }}
                />
                <button
                  onClick={handleSMSSend}
                  style={{
                    width: '40px', height: '40px',
                    background: '#25D366',
                    border: 'none',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    fontSize: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ➤
                </button>
              </div>
            </>
          )}
        </div>

        {/* Home button */}
        <div style={{
          width: '50px', height: '50px',
          background: '#333',
          borderRadius: '50%',
          margin: '12px auto 4px',
          border: '2px solid #555'
        }}/>
      </div>

      {/* Instructions */}
      <div style={{
        marginTop: '24px',
        background: 'rgba(255,255,255,0.15)',
        borderRadius: '12px',
        padding: '16px 24px',
        maxWidth: '500px',
        textAlign: 'center'
      }}>
        <p style={{ color: 'white', margin: 0, fontSize: '13px', lineHeight: '1.8' }}>
          {mode === 'ussd'
            ? '📟 USSD mode simulates *384*5678# on any basic phone — no internet needed. Navigate using number keys exactly like a real USSD menu.'
            : '💬 SMS/WhatsApp mode shows real conversation. Try: KISAN TOMATO 200 SEHORE → then YES → then INFO → then HELP'
          }
        </p>
      </div>
    </div>
  );
}