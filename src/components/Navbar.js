import React from 'react';
import { tokens as t } from '../tokens';

export default function Navbar({ activePage, setPage }) {
  const navItems = [
    { id: 'home',        label: 'Home',        icon: '🏠' },
    { id: 'farmer',      label: 'Farmer',      icon: '👨‍🌾' },
    { id: 'operator',    label: 'Operator',    icon: '🏪' },
    { id: 'transporter', label: 'Transporter', icon: '🚛' },
    { id: 'simulator',   label: 'Offline Demo', icon: '📟' },
  ];

  return (
    <nav style={{
      background: t.gradient.farmer,
      backgroundSize: '200% 200%',
      animation: 'kcc-gradient-shift 8s ease infinite',
      padding: `0 ${t.space[5]}`,
      display: 'flex',
      alignItems: 'center',
      gap: t.space[2],
      boxShadow: t.shadow.lg,
      flexWrap: 'wrap',
      minHeight: '60px',
      position: 'sticky',
      top: 0,
      zIndex: t.zIndex.dropdown,
      fontFamily: t.font.family,
    }}>
      <button
        onClick={() => setPage('home')}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: t.space[2],
          marginRight: t.space[4], padding: `${t.space[2]} 0`,
        }}
      >
        <span style={{
          fontSize: t.font.size['2xl'],
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
        }}>🌾</span>
        <span style={{
          color: t.color.text.inverse,
          fontWeight: t.font.weight.extrabold,
          fontSize: t.font.size.lg,
          letterSpacing: '-0.02em',
        }}>
          Kisan Cold Chain
        </span>
      </button>

      {navItems.map(item => {
        const active = activePage === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            className="kcc-hover-scale"
            style={{
              padding: `${t.space[2]} ${t.space[4]}`,
              background: active ? t.color.surface.glass : 'rgba(255,255,255,0.12)',
              color: active ? t.color.primary[900] : t.color.text.inverse,
              border: active ? 'none' : '1px solid rgba(255,255,255,0.25)',
              borderRadius: t.radius.full,
              cursor: 'pointer',
              fontSize: t.font.size.sm,
              fontWeight: active ? t.font.weight.bold : t.font.weight.medium,
              fontFamily: t.font.family,
              transition: t.transition.spring,
              boxShadow: active ? t.shadow.md : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: t.space[1],
            }}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
