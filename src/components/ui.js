import { tokens as t } from '../tokens';

export const ui = {
  card: (opts = {}) => ({
    background: t.gradient.card,
    borderRadius: t.radius.lg,
    boxShadow: t.shadow.md,
    border: `1px solid ${t.color.border.light}`,
    transition: t.transition.normal,
    ...opts,
  }),

  cardInteractive: (opts = {}) => ({
    ...ui.card(opts),
    cursor: opts.cursor || 'pointer',
  }),

  btn: (variant = 'primary', theme = t.color.primary, disabled = false) => {
    const base = {
      padding: `${t.space[3]} ${t.space[6]}`,
      borderRadius: t.radius.md,
      border: 'none',
      fontFamily: t.font.family,
      fontWeight: t.font.weight.semibold,
      fontSize: t.font.size.base,
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: t.transition.spring,
      opacity: disabled ? 0.6 : 1,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: t.space[2],
    };
    const variants = {
      primary: {
        background: `linear-gradient(135deg, ${theme[900] || theme[600]}, ${theme[800] || theme[500]})`,
        color: t.color.text.inverse,
        boxShadow: `0 4px 14px ${(theme[900] || theme[600])}40`,
      },
      secondary: {
        background: theme[50] || t.color.primary[50],
        color: theme[800] || theme[600],
        border: `2px solid ${theme[200] || theme[500]}`,
        boxShadow: 'none',
      },
      ghost: {
        background: 'transparent',
        color: theme[800] || theme[600],
        border: `1px solid ${t.color.border.default}`,
        boxShadow: 'none',
      },
      danger: {
        background: `linear-gradient(135deg, ${t.color.semantic.danger}, #B71C1C)`,
        color: t.color.text.inverse,
        boxShadow: `0 4px 14px rgba(198,40,40,0.3)`,
      },
    };
    return { ...base, ...variants[variant] };
  },

  input: (opts = {}) => ({
    width: '100%',
    padding: `${t.space[3]} ${t.space[4]}`,
    borderRadius: t.radius.md,
    border: `2px solid ${t.color.border.default}`,
    fontSize: t.font.size.base,
    fontFamily: t.font.family,
    background: t.color.surface.base,
    color: t.color.text.primary,
    transition: t.transition.fast,
    boxSizing: 'border-box',
    ...opts,
  }),

  badge: (status) => {
    const map = {
      PENDING: { bg: t.color.semantic.warningBg, text: t.color.semantic.warning },
      CONFIRMED: { bg: t.color.semantic.successBg, text: t.color.semantic.success },
      REJECTED: { bg: t.color.semantic.dangerBg, text: t.color.semantic.danger },
      OPEN: { bg: t.color.semantic.successBg, text: t.color.semantic.success },
      LOCKED: { bg: t.color.semantic.infoBg, text: t.color.semantic.info },
    };
    const c = map[status] || { bg: t.color.neutral[100], text: t.color.neutral[700] };
    return {
      background: c.bg,
      color: c.text,
      padding: `${t.space[1]} ${t.space[3]}`,
      borderRadius: t.radius.full,
      fontSize: t.font.size.xs,
      fontWeight: t.font.weight.bold,
      letterSpacing: '0.03em',
      textTransform: 'uppercase',
    };
  },

  pageHeader: (gradient) => ({
    background: gradient,
    padding: `${t.space[6]} ${t.space[6]}`,
    color: t.color.text.inverse,
    position: 'relative',
    overflow: 'hidden',
  }),

  tab: (active, theme = t.color.primary) => ({
    padding: `${t.space[3]} ${t.space[5]}`,
    border: 'none',
    borderRadius: t.radius.md,
    cursor: 'pointer',
    fontFamily: t.font.family,
    fontWeight: active ? t.font.weight.bold : t.font.weight.medium,
    fontSize: t.font.size.sm,
    transition: t.transition.normal,
    background: active ? (theme[900] || theme[600]) : 'transparent',
    color: active ? t.color.text.inverse : t.color.text.secondary,
    boxShadow: active ? t.shadow.sm : 'none',
  }),

  dashboardTab: (active, accent) => ({
    padding: `${t.space[4]} ${t.space[5]}`,
    background: 'none',
    border: 'none',
    borderBottom: active ? `3px solid ${accent}` : '3px solid transparent',
    color: active ? accent : t.color.text.muted,
    cursor: 'pointer',
    fontWeight: active ? t.font.weight.bold : t.font.weight.medium,
    fontSize: t.font.size.sm,
    fontFamily: t.font.family,
    transition: t.transition.fast,
  }),

  statCard: (accent) => ({
    ...ui.card({ padding: t.space[5] }),
    borderLeft: `4px solid ${accent}`,
    position: 'relative',
    overflow: 'hidden',
  }),

  sectionTitle: () => ({
    fontSize: t.font.size['3xl'],
    fontWeight: t.font.weight.extrabold,
    color: t.color.primary[900],
    margin: `0 0 ${t.space[3]}`,
    letterSpacing: '-0.02em',
  }),

  overlay: () => ({
    position: 'fixed',
    inset: 0,
    background: t.color.surface.overlay,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: t.zIndex.modal,
    padding: t.space[5],
    backdropFilter: 'blur(4px)',
  }),

  modal: () => ({
    background: t.color.surface.base,
    borderRadius: t.radius['2xl'],
    padding: t.space[8],
    maxWidth: '480px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: t.shadow.xl,
    animation: 'kcc-fade-in-up 0.35s ease-out',
  }),
};

export { t as tokens };
