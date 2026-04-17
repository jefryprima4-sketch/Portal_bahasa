import React from 'react';

interface AlertProps {
  variant?: 'info' | 'success' | 'error' | 'warning';
  title?: string;
  children: React.ReactNode;
}

export function Alert({ variant = 'info', title, children }: AlertProps) {
  const variants: Record<string, string> = {
    info: 'bg-[var(--primary-fixed)]/30 text-[var(--primary)] border-[var(--primary-fixed-dim)]',
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-[var(--error-container)]/30 text-[var(--error)] border-[var(--error-container)]',
    warning: 'bg-[var(--tertiary-fixed)]/30 text-[var(--tertiary)] border-[var(--tertiary-fixed)]',
  };

  return (
    <div className={`rounded-lg border px-4 py-3 ${variants[variant]}`} role="alert">
      {title && <p className="font-medium">{title}</p>}
      <div className="text-sm">{children}</div>
    </div>
  );
}
