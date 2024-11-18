import { keyframes, styled } from '@/presentation/config/stitches.config';

const spin = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
});

export const LoadingContainer = styled('div', {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  height: '100%',
  minHeight: '10rem'
});

export const LoadingCircle = styled('div', {
  border: '5px solid #E5E7EB',
  borderTop: '5px solid $secondary',
  borderRadius: '50%',
  width: '3rem',
  height: '3rem',
  animation: `${spin} 0.75s linear infinite`,
});
