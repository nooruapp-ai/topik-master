import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
  children: ReactNode;
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-btn px-6 text-[16px] font-semibold transition-all duration-200 ease-ios active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100';

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-white',
  secondary: 'bg-primary-light text-primary',
  ghost: 'border border-line bg-transparent text-ink-soft',
};

export default function Button({
  variant = 'primary',
  fullWidth = true,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${base} h-[52px] ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
