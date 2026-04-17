import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium" style={{ color: 'var(--on-surface-variant)' }}>
          {label}
        </label>
      )}
      <input
        className={`w-full rounded-lg border px-3 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 disabled:opacity-50 disabled:cursor-not-allowed ${
          error ? 'border-[var(--error)]' : 'border-[var(--outline-variant)]'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs" style={{ color: 'var(--error)' }}>{error}</p>}
    </div>
  );
}
