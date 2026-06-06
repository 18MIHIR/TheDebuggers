// import React, { useState, useRef, useEffect } from 'react';

// export default function Chatbot({ role = 'farmer' }) {
//   const [open, setOpen] = useState(false);
//   const [messages, setMessages] = useState([
//     {
//       role: 'assistant',
//       text: role === 'farmer'
//         ? 'Namaskar! Main Kisan Bot hoon. Apni fasal, cold storage ya transport ke baare mein kuch bhi poochh sakte hain! 🌾'
//         : role === 'operator'
//         ? 'Hello! I am Kisan Bot. Ask me anything about bookings, capacity management, or farmer queries!'
//         : 'Hello! Ask me about transport jobs, routes, or earnings!'
//     }
//   ]);
//   const [input, setInput] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [lang, setLang] = useState('hi');
//   const endRef = useRef(null);

//   useEffect(() => {
//     endRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   const sendMessage = async () => {
//     if (!input.trim() || loading) return;
//     const userMsg = input.trim();
//     setInput('');
//     setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
//     setLoading(true);

//     try {
//       const systemPrompt = `You are Kisan Bot, an AI assistant for the Kisan Cold Chain platform — 
// an offline-first cold storage platform for Indian farmers.

// Role context: You are talking to a ${role}.

// ${role === 'farmer' ? `Help farmers with:
// - Post-harvest care tips for crops (tomato, potato, onion, mango, etc.)
// - Cold storage advice and pricing
// - Transport pooling benefits
// - Spoilage prevention
// - Best time to sell at mandi
// - Government schemes for farmers (PM-KISAN, PMFBY, eNAM)
// Keep answers short, practical, and in simple Hindi or English based on user preference.` : ''}

// ${role === 'operator' ? `Help cold store operators with:
// - Managing bookings efficiently
// - Capacity optimization tips
// - Handling farmer disputes
// - Pricing strategies
// - Government regulations (WDRA, FSSAI)
// Keep answers professional and concise.` : ''}

// ${role === 'transporter' ? `Help transporters with:
// - Route optimization tips
// - Loading and unloading best practices
// - Vehicle maintenance for produce transport
// - Earnings optimization
// Keep answers practical and short.` : ''}

// Always be helpful, warm, and practical. Never give wrong information.
// If asked about specific bookings or data, say you need them to check the dashboard.`;

//       const response = await fetch('https://api.anthropic.com/v1/messages', {
//    method: 'POST',
//    headers: {
//     'Content-Type': 'application/json',
//     'x-api-key': process.env.REACT_APP_ANTHROPIC_KEY,
//     'anthropic-version': '2023-06-01',
//     'anthropic-dangerous-direct-browser-access': 'true'
//   },
//         body: JSON.stringify({
//           model: 'claude-sonnet-4-20250514',
//           max_tokens: 1000,
//           system: systemPrompt,
//           messages: [
//             ...messages.filter(m => m.role === 'user' || m.role === 'assistant').map(m => ({
//               role: m.role,
//               content: m.text
//             })),
//             { role: 'user', content: userMsg }
//           ]
//         })
//       });

//       const data = await response.json();
//       const reply = data.content?.[0]?.text || 'Sorry, kuch problem hui. Please try again.';
//       setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
//     } catch (err) {
//       setMessages(prev => [...prev, { 
//         role: 'assistant', 
//         text: 'Network error. Please check connection and try again.' 
//       }]);
//     }
//     setLoading(false);
//   };

//   return (
//     <>
//       {/* Floating button */}
//       <button
//         onClick={() => setOpen(!open)}
//         style={{
//           position: 'fixed',
//           bottom: '24px',
//           right: '24px',
//           width: '60px',
//           height: '60px',
//           borderRadius: '50%',
//           background: '#1B5E20',
//           border: 'none',
//           cursor: 'pointer',
//           fontSize: '28px',
//           boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
//           zIndex: 1000,
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center'
//         }}
//       >
//         {open ? '✕' : '🤖'}
//       </button>

//       {/* Chat panel */}
//       {open && (
//         <div style={{
//           position: 'fixed',
//           bottom: '96px',
//           right: '24px',
//           width: '340px',
//           height: '480px',
//           background: 'white',
//           borderRadius: '16px',
//           boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
//           display: 'flex',
//           flexDirection: 'column',
//           zIndex: 999,
//           overflow: 'hidden',
//           fontFamily: 'Arial'
//         }}>

//           {/* Header */}
//           <div style={{
//             background: '#1B5E20',
//             padding: '14px 16px',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'space-between'
//           }}>
//             <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//               <span style={{ fontSize: '24px' }}>🤖</span>
//               <div>
//                 <div style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>Kisan Bot</div>
//                 <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>AI Assistant • Online</div>
//               </div>
//             </div>
//             <button
//               onClick={() => setLang(lang === 'hi' ? 'en' : 'hi')}
//               style={{
//                 background: 'rgba(255,255,255,0.2)',
//                 border: 'none',
//                 borderRadius: '12px',
//                 padding: '4px 10px',
//                 color: 'white',
//                 cursor: 'pointer',
//                 fontSize: '12px'
//               }}
//             >
//               {lang === 'hi' ? 'EN' : 'HI'}
//             </button>
//           </div>

//           {/* Messages */}
//           <div style={{
//             flex: 1,
//             overflowY: 'auto',
//             padding: '12px',
//             display: 'flex',
//             flexDirection: 'column',
//             gap: '8px',
//             background: '#F5F5F5'
//           }}>
//             {messages.map((msg, i) => (
//               <div key={i} style={{
//                 display: 'flex',
//                 justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
//               }}>
//                 <div style={{
//                   maxWidth: '85%',
//                   background: msg.role === 'user' ? '#1B5E20' : 'white',
//                   color: msg.role === 'user' ? 'white' : '#333',
//                   borderRadius: msg.role === 'user' ? '16px 16px 0 16px' : '16px 16px 16px 0',
//                   padding: '10px 14px',
//                   fontSize: '13px',
//                   lineHeight: '1.5',
//                   boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
//                   whiteSpace: 'pre-wrap'
//                 }}>
//                   {msg.text}
//                 </div>
//               </div>
//             ))}

//             {loading && (
//               <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
//                 <div style={{
//                   background: 'white',
//                   borderRadius: '16px 16px 16px 0',
//                   padding: '12px 16px',
//                   boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
//                 }}>
//                   <div style={{ display: 'flex', gap: '4px' }}>
//                     {[0,1,2].map(i => (
//                       <div key={i} style={{
//                         width: '8px', height: '8px',
//                         background: '#1B5E20',
//                         borderRadius: '50%',
//                         opacity: 0.6
//                       }}/>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             )}
//             <div ref={endRef}/>
//           </div>

//           {/* Quick suggestions */}
//           <div style={{
//             padding: '8px 12px',
//             display: 'flex',
//             gap: '6px',
//             overflowX: 'auto',
//             background: 'white',
//             borderTop: '1px solid #eee'
//           }}>
//             {(role === 'farmer'
//               ? ['Tomato care tips', 'Cold store benefits', 'Transport cost?']
//               : role === 'operator'
//               ? ['Optimize capacity', 'Pricing tips', 'WDRA rules']
//               : ['Route tips', 'Loading guide', 'Earnings help']
//             ).map(s => (
//               <button
//                 key={s}
//                 onClick={() => { setInput(s); }}
//                 style={{
//                   padding: '4px 10px',
//                   background: '#E8F5E9',
//                   border: '1px solid #2E7D32',
//                   borderRadius: '12px',
//                   fontSize: '11px',
//                   color: '#1B5E20',
//                   cursor: 'pointer',
//                   whiteSpace: 'nowrap'
//                 }}
//               >
//                 {s}
//               </button>
//             ))}
//           </div>

//           {/* Input */}
//           <div style={{
//             padding: '10px 12px',
//             display: 'flex',
//             gap: '8px',
//             background: 'white',
//             borderTop: '1px solid #eee'
//           }}>
//             <input
//               value={input}
//               onChange={e => setInput(e.target.value)}
//               onKeyDown={e => e.key === 'Enter' && sendMessage()}
//               placeholder={lang === 'hi' ? 'Kuch bhi poochhen...' : 'Ask anything...'}
//               style={{
//                 flex: 1,
//                 padding: '10px 14px',
//                 borderRadius: '20px',
//                 border: '1px solid #ddd',
//                 fontSize: '13px',
//                 outline: 'none',
//                 fontFamily: 'Arial'
//               }}
//             />
//             <button
//               onClick={sendMessage}
//               disabled={loading}
//               style={{
//                 width: '38px', height: '38px',
//                 background: loading ? '#ccc' : '#1B5E20',
//                 border: 'none',
//                 borderRadius: '50%',
//                 cursor: loading ? 'default' : 'pointer',
//                 fontSize: '16px',
//                 color: 'white',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center'
//               }}
//             >
//               ➤
//             </button>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }
import React, { useState, useRef, useEffect } from 'react';
import { tokens as tk } from '../tokens';
import { ui } from './ui';

const ROLE_THEME = {
  farmer: tk.color.primary,
  operator: tk.color.operator,
  transporter: tk.color.transporter,
};

export default function Chatbot({ role = 'farmer' }) {
  const theme = ROLE_THEME[role] || tk.color.primary;
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'model', // Gemini uses 'model' instead of 'assistant'
      text: role === 'farmer'
        ? 'Namaskar! Main Kisan Bot hoon. Apni fasal, cold storage ya transport ke baare mein kuch bhi poochh sakte hain! 🌾'
        : role === 'operator'
        ? 'Hello! I am Kisan Bot. Ask me anything about bookings, capacity management, or farmer queries!'
        : 'Hello! Ask me about transport jobs, routes, or earnings!'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState('hi');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const systemPrompt = `You are Kisan Bot, an AI assistant for the Kisan Cold Chain platform — 
an offline-first cold storage platform for Indian farmers.

Role context: You are talking to a ${role}.

${role === 'farmer' ? `Help farmers with:
- Post-harvest care tips for crops (tomato, potato, onion, mango, etc.)
- Cold storage advice and pricing
- Transport pooling benefits
- Spoilage prevention
- Best time to sell at mandi
- Government schemes for farmers (PM-KISAN, PMFBY, eNAM)
Keep answers short, practical, and in simple Hindi or English based on user preference.` : ''}

${role === 'operator' ? `Help cold store operators with:
- Managing bookings efficiently
- Capacity optimization tips
- Handling farmer disputes
- Pricing strategies
- Government regulations (WDRA, FSSAI)
Keep answers professional and concise.` : ''}

${role === 'transporter' ? `Help transporters with:
- Route optimization tips
- Loading and unloading best practices
- Vehicle maintenance for produce transport
- Earnings optimization
Keep answers practical and short.` : ''}

Always be helpful, warm, and practical. Never give wrong information.
If asked about specific bookings or data, say you need them to check the dashboard.`;

      // 1. Format history into Gemini's required structure ({ role: 'user' | 'model', parts: [{ text: '...' }] })
      // We map your internal history to match Gemini's API specs
      const contents = [
        ...messages.map(m => ({
          role: m.role === 'assistant' ? 'model' : m.role,
          parts: [{ text: m.text }]
        })),
        { role: 'user', parts: [{ text: userMsg }] }
      ];

      // 2. Setup your API Key. Remember to replace this in your .env file
      const API_KEY = process.env.REACT_APP_GEMINI_KEY; 
      
      // Using gemini-2.5-flash as it's incredibly fast and perfect for chat assistants
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: contents,
            systemInstruction: {
              parts: [{ text: systemPrompt }]
            },
            generationConfig: {
              maxOutputTokens: 1000,
            }
          })
        }
      );

      const data = await response.json();
      
      // 3. Extract text response safely from Gemini's nested response object
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, kuch problem hui. Please try again.';
      
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: 'Network error. Please check connection and try again.' 
      }]);
    }
    setLoading(false);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="kcc-hover-scale"
        style={{
          position: 'fixed', bottom: tk.space[6], right: tk.space[6],
          width: '64px', height: '64px', borderRadius: tk.radius.full,
          background: `linear-gradient(135deg, ${theme[900] || theme[600]}, ${theme[700] || theme[500]})`,
          border: '3px solid rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '28px',
          boxShadow: `${tk.shadow.lg}, 0 0 20px ${(theme[900] || theme[600])}40`,
          zIndex: tk.zIndex.chat, display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: open ? 'none' : 'kcc-pulse-glow 3s infinite',
          transition: tk.transition.spring,
        }}
      >
        {open ? '✕' : '🤖'}
      </button>

      {open && (
        <div className="kcc-animate-in" style={{
          position: 'fixed', bottom: '100px', right: tk.space[6],
          width: '360px', height: '500px',
          ...ui.card({ padding: 0, borderRadius: tk.radius['2xl'], overflow: 'hidden' }),
          boxShadow: tk.shadow.xl, display: 'flex', flexDirection: 'column',
          zIndex: tk.zIndex.chat - 1, fontFamily: tk.font.family,
        }}>

          <div style={{
            background: `linear-gradient(135deg, ${theme[900] || theme[600]}, ${theme[700] || theme[500]})`,
            padding: `${tk.space[4]} ${tk.space[4]}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '24px' }}>🤖</span>
              <div>
                <div style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>Kisan Bot</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>AI Assistant • Online</div>
              </div>
            </div>
            <button
              onClick={() => setLang(lang === 'hi' ? 'en' : 'hi')}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '12px',
                padding: '4px 10px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              {lang === 'hi' ? 'EN' : 'HI'}
            </button>
          </div>

          <div className="kcc-scroll-smooth" style={{
            flex: 1, overflowY: 'auto', padding: tk.space[3],
            display: 'flex', flexDirection: 'column', gap: tk.space[2],
            background: tk.color.surface.sunken,
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '85%',
                  background: msg.role === 'user' ? `linear-gradient(135deg, ${theme[900] || theme[600]}, ${theme[800] || theme[500]})` : tk.color.surface.base,
                  color: msg.role === 'user' ? tk.color.text.inverse : tk.color.text.primary,
                  borderRadius: msg.role === 'user' ? `${tk.radius.lg} ${tk.radius.lg} 4px ${tk.radius.lg}` : `${tk.radius.lg} ${tk.radius.lg} ${tk.radius.lg} 4px`,
                  padding: `${tk.space[3]} ${tk.space[4]}`,
                  fontSize: tk.font.size.sm, lineHeight: 1.6,
                  boxShadow: tk.shadow.sm, whiteSpace: 'pre-wrap',
                  border: msg.role === 'user' ? 'none' : `1px solid ${tk.color.border.light}`,
                }}>
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ background: tk.color.surface.base, borderRadius: `${tk.radius.lg} ${tk.radius.lg} ${tk.radius.lg} 4px`, padding: `${tk.space[3]} ${tk.space[4]}`, boxShadow: tk.shadow.sm }}>
                  <div className="kcc-dot-loader"><span /><span /><span /></div>
                </div>
              </div>
            )}
            <div ref={endRef}/>
          </div>

          {/* Quick suggestions */}
          <div style={{
            padding: '8px 12px',
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            background: 'white',
            borderTop: '1px solid #eee'
          }}>
            {(role === 'farmer'
              ? ['Tomato care tips', 'Cold store benefits', 'Transport cost?']
              : role === 'operator'
              ? ['Optimize capacity', 'Pricing tips', 'WDRA rules']
              : ['Route tips', 'Loading guide', 'Earnings help']
            ).map(s => (
              <button
                key={s}
                onClick={() => { setInput(s); }}
                className="kcc-hover-scale"
                style={{
                  padding: `${tk.space[1]} ${tk.space[3]}`,
                  background: theme[50] || tk.color.primary[50],
                  border: `1px solid ${theme[300] || theme[500]}`,
                  borderRadius: tk.radius.full, fontSize: tk.font.size.xs,
                  color: theme[900] || theme[600], cursor: 'pointer', whiteSpace: 'nowrap',
                  fontFamily: tk.font.family, fontWeight: tk.font.weight.medium,
                }}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{
            padding: '10px 12px',
            display: 'flex',
            gap: '8px',
            background: 'white',
            borderTop: '1px solid #eee'
          }}>
            <input
              className="kcc-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder={lang === 'hi' ? 'Kuch bhi poochhen...' : 'Ask anything...'}
              style={{ ...ui.input({ flex: 1, borderRadius: tk.radius.full, fontSize: tk.font.size.sm }) }}
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="kcc-hover-scale"
              style={{
                width: '42px', height: '42px',
                background: loading ? tk.color.neutral[300] : `linear-gradient(135deg, ${theme[900] || theme[600]}, ${theme[700] || theme[500]})`,
                border: 'none', borderRadius: tk.radius.full,
                cursor: loading ? 'default' : 'pointer', fontSize: '16px', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: loading ? 'none' : tk.shadow.sm,
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}