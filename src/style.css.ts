import { style } from '@vanilla-extract/css';

const bottomBtn = style({
  position: 'fixed',
  zIndex: 2,
  width: '100%',
  padding: '12px 20px',
  bottom: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '.5rem',
  backgroundColor: '#fff',
});

const container = style({
  display: 'flex',
  padding: '1rem',
  flexDirection: 'column',
  gap: '24px',
});

const banner = style({
  padding: '1rem',
  backgroundColor: '#F3F4F5',
  borderRadius: '1rem',
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  marginTop: '6px',
});

const swSlide = style({
  width: 'min-content',
});

const boxGreen = style({
  backgroundColor: '#E9F7D9',
  borderRadius: '12px',
  padding: '.5rem 1rem',
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
});

const btmRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  justifyContent: 'space-between',
  padding: '0 4px',
});
const btmRowCalc = style({
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  justifyContent: 'space-between',
});

export const btmContent = style({
  padding: 0,
});

const row = style({
  display: 'flex',
  gap: '1rem',
});

const box = style({
  backgroundColor: '#F2F3F5',
  borderRadius: '1rem',
  padding: '20px 1rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
});

export const appSt = {
  bottomBtn,
  container,
  banner,
  swSlide,
  boxGreen,
  btmContent,
  btmRow,
  btmRowCalc,
  row,
  box,
};
