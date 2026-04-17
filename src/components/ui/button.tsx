import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
  const bgColors: Record<string, string> = {
    primary: 'bg-[var(--primary)] text-white hover:opacity-90',
    secondary: 'border border-[var(--outline)] hover:bg-[var(--surface-container)] bg-transparent text-[var(--on-surface-variant)]',
    ghost: 'hover:bg-[var(--surface-container-low)] bg-transparent',
    destructive: 'bg-[var(--error)] text-white hover:opacity-90',
    outline: 'border border-[var(--outline)] hover:bg-[var(--surface-container)] bg-transparent text-[var(--on-surface-variant)]',
  };

  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs rounded-md',
    md: 'px-4 py-2.5 text-sm rounded-lg',
    lg: 'px-6 py-3 text-base rounded-lg',
  };

  return (
    <button
      className={`inline-flex items-center justify-center font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${bgColors[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
