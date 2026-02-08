import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`p-4 rounded-xl shadow-lg bg-white border border-gray-200 ${className}`}>
      {children}
    </div>
  );
};
