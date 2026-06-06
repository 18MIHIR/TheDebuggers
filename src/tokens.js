/** Kisan Cold Chain — Design Tokens */
export const tokens = {
  color: {
    primary: {
      50: '#F1F8E9',
      100: '#DCEDC8',
      200: '#C5E1A5',
      300: '#AED581',
      400: '#9CCC65',
      500: '#7CB342',
      600: '#558B2F',
      700: '#33691E',
      800: '#2E7D32',
      900: '#1B5E20',
    },
    operator: {
      50: '#E3F2FD',
      100: '#BBDEFB',
      500: '#2196F3',
      600: '#1565C0',
      700: '#0D47A1',
    },
    transporter: {
      50: '#FFF3E0',
      100: '#FFE0B2',
      500: '#FF9800',
      600: '#E65100',
      700: '#BF360C',
    },
    accent: {
      gold: '#F9A825',
      saffron: '#FF6F00',
      purple: '#6A1B9A',
    },
    neutral: {
      0: '#FFFFFF',
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#EEEEEE',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#9E9E9E',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
    semantic: {
      success: '#2E7D32',
      successBg: '#E8F5E9',
      warning: '#F57F17',
      warningBg: '#FFF8E1',
      danger: '#C62828',
      dangerBg: '#FFEBEE',
      info: '#1565C0',
      infoBg: '#E3F2FD',
    },
    risk: {
      LOW: { bg: '#1B5E20', text: '#FFFFFF', glow: 'rgba(27,94,32,0.4)' },
      MEDIUM: { bg: '#F9A825', text: '#3E2723', glow: 'rgba(249,168,37,0.4)' },
      HIGH: { bg: '#E65100', text: '#FFFFFF', glow: 'rgba(230,81,0,0.4)' },
      CRITICAL: { bg: '#B71C1C', text: '#FFFFFF', glow: 'rgba(183,28,28,0.5)' },
    },
    surface: {
      base: '#FFFFFF',
      raised: '#FFFFFF',
      sunken: '#F5F7F4',
      overlay: 'rgba(0,0,0,0.55)',
      glass: 'rgba(255,255,255,0.85)',
      glassBorder: 'rgba(255,255,255,0.35)',
    },
    text: {
      primary: '#1A2E1A',
      secondary: '#5C6B5C',
      muted: '#8A9A8A',
      inverse: '#FFFFFF',
      link: '#2E7D32',
    },
    border: {
      light: '#E8EDE8',
      default: '#D5DDD5',
      strong: '#A5B8A5',
    },
  },

  font: {
    family: "'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif",
    familyDisplay: "'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif",
    size: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    weight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
  },

  space: {
    0: '0',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
    20: '80px',
  },

  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    full: '9999px',
  },

  shadow: {
    sm: '0 1px 3px rgba(27,94,32,0.08), 0 1px 2px rgba(0,0,0,0.04)',
    md: '0 4px 16px rgba(27,94,32,0.1), 0 2px 6px rgba(0,0,0,0.06)',
    lg: '0 12px 40px rgba(27,94,32,0.14), 0 4px 12px rgba(0,0,0,0.08)',
    xl: '0 20px 60px rgba(27,94,32,0.18), 0 8px 24px rgba(0,0,0,0.1)',
    glow: (color) => `0 0 24px ${color}`,
    inner: 'inset 0 2px 4px rgba(0,0,0,0.06)',
  },

  gradient: {
    hero: 'linear-gradient(135deg, #E8F5E9 0%, #F1F8E9 40%, #FFFDE7 100%)',
    heroMesh: 'radial-gradient(ellipse at 20% 50%, rgba(124,179,66,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(249,168,37,0.1) 0%, transparent 40%), linear-gradient(180deg, #F1F8E9 0%, #FFFFFF 100%)',
    farmer: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #558B2F 100%)',
    operator: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 50%, #1976D2 100%)',
    transporter: 'linear-gradient(135deg, #BF360C 0%, #E65100 50%, #FF9800 100%)',
    impact: 'linear-gradient(135deg, #1B5E20 0%, #33691E 50%, #1B5E20 100%)',
    card: 'linear-gradient(145deg, #FFFFFF 0%, #F9FBF7 100%)',
    shimmer: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
  },

  transition: {
    fast: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
    normal: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    slow: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },

  zIndex: {
    dropdown: 100,
    modal: 200,
    chat: 1000,
  },
};

export const RISK_EMOJI = {
  LOW: '🟢', MEDIUM: '🟡', HIGH: '🟠', CRITICAL: '🔴',
};

export const ROLE_THEME = {
  farmer: tokens.color.primary,
  operator: tokens.color.operator,
  transporter: tokens.color.transporter,
  home: tokens.color.primary,
  simulator: { 600: tokens.color.accent.purple, 50: '#F3E5F5' },
};
