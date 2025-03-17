import { keyframes, style } from '@vanilla-extract/css';

const container = style({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '0 1rem',
  textAlign: 'center',
});
const rotate = keyframes({
  '100%': { transform: 'rotate(360deg)' },
});

const prixClipFix = keyframes({
  '0%': { clipPath: 'polygon(50% 50%,0 0,0 0,0 0,0 0,0 0)' },
  '25%': { clipPath: 'polygon(50% 50%,0 0,100% 0,100% 0,100% 0,100% 0)' },
  '50%': { clipPath: 'polygon(50% 50%,0 0,100% 0,100% 100%,100% 100%,100% 100%)' },
  '75%': { clipPath: 'polygon(50% 50%,0 0,100% 0,100% 100%,0 100%,0 100%)' },
  '100%': { clipPath: 'polygon(50% 50%,0 0,100% 0,100% 100%,0 100%,0 0)' },
});

export const loader = style({
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  position: 'relative',
  animation: `${rotate} 1s linear infinite`,
  ':before': {
    content: "''",
    boxSizing: 'border-box',
    position: 'absolute',
    inset: '0px',
    borderRadius: '50%',
    border: '3px solid #000',
    animation: `${prixClipFix} 2s linear infinite`,
  },
});

export const thxSt = {
  container,
  loader,
};
