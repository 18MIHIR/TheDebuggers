export { tokens, RISK_EMOJI, ROLE_THEME } from './tokens';

export const API = 'http://localhost:3001';
export const AI_API = 'http://localhost:8000';

export const CROPS = [
  'TOMATO', 'POTATO', 'ONION', 'MANGO',
  'APPLE', 'BANANA', 'CAULIFLOWER', 'GRAPE'
];

export const RISK_COLORS = {
  LOW:      { bg: '#E8F5E9', text: '#1B5E20', border: '#2E7D32' },
  MEDIUM:   { bg: '#FFF8E1', text: '#F57F17', border: '#F9A825' },
  HIGH:     { bg: '#FFF3E0', text: '#E65100', border: '#FF6D00' },
  CRITICAL: { bg: '#FFEBEE', text: '#B71C1C', border: '#D32F2F' }
};
