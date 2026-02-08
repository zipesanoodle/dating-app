import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

// Mocking framer-motion to avoid animation issues in jsdom
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useMotionValue: () => ({}),
  useTransform: () => ({}),
}));

describe('App Component', () => {
  it('renders the header title', () => {
    render(<App />);
    expect(screen.getByText('HeartSync')).toBeInTheDocument();
  });

  it('renders the tagline', () => {
    render(<App />);
    expect(screen.getByText('Find your perfect match')).toBeInTheDocument();
  });
});
