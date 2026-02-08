import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card } from './Card';
import React from 'react';

describe('Card Component', () => {
  it('renders children correctly', () => {
    render(<Card>Test Content</Card>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies additional className', () => {
    const { container } = render(<Card className="extra-class">Content</Card>);
    expect(container.firstChild).toHaveClass('extra-class');
  });
});
