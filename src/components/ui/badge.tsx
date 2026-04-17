import React from 'react';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'secondary' | 'destructive';
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  const variants: Record<string, string> = {
    default: 'bg-[var(--surface-container)] text-[var(--on-surface-variant)]',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-[var(--tertiary-fixed)]/50 text-[var(--tertiary)]',
    error: 'bg-[var(--error-container)]/50 text-[var(--error)]',
    info: 'bg-[var(--primary-fixed)]/50 text-[var(--primary)]',
    secondary: 'bg-slate-100 text-slate-600',
    destructive: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
