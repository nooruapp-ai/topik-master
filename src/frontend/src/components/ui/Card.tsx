import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padded?: boolean;
}

export default function Card({ children, padded = true, className = '', ...props }: CardProps) {
  return (
    <div
      className={`rounded-card border border-surface-muted bg-white shadow-card ${
        padded ? 'p-5' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
