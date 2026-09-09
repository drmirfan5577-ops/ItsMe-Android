// Luminous Dark Theme — glowing, sparkling, bright
export const COLORS = {
  // Core backgrounds — deep dark with blue undertone
  bg: '#060d17',
  bgLight: '#0d1f35',
  bgLighter: '#152b42',
  bgCard: '#0f2236',

  // Primary — vivid glowing teal
  primary: '#00e5a0',
  primaryDark: '#00b87d',
  primaryGlow: '#00ff99',
  primaryDim: 'rgba(0,229,160,0.15)',

  // Bubbles
  bubble: '#003d2a',          // sent bubble
  bubbleGlow: '#005c40',      // sent bubble bright edge
  bubbleOther: '#0d2035',     // received bubble

  // Text
  text: '#e8f4ff',            // near-white with blue tint
  textMuted: '#6a92b0',       // secondary text
  textGray: '#4d718f',        // placeholder / meta

  // Accent colours
  green: '#00e5a0',
  red: '#ff3d6b',
  blue: '#4dc8ff',
  yellow: '#ffd700',
  purple: '#c084fc',
  orange: '#ff8c42',

  // Glow shadows
  glowPrimary: 'rgba(0,229,160,0.5)',
  glowBlue: 'rgba(77,200,255,0.4)',
  glowRed: 'rgba(255,61,107,0.5)',

  // Borders
  border: 'rgba(0,229,160,0.15)',
  borderBright: 'rgba(0,229,160,0.35)',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const RADIUS = {
  sm: 6,
  md: 12,
  lg: 20,
  xl: 28,
  full: 999,
};

// Glow shadow helpers
export const GLOW = {
  primary: {
    shadowColor: '#00e5a0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 12,
    elevation: 12,
  },
  blue: {
    shadowColor: '#4dc8ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 10,
  },
  subtle: {
    shadowColor: '#00e5a0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
};
