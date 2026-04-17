import React from 'react';

export function Card({ className = '', style, children }: { className?: string; style?: React.CSSProperties; children: React.ReactNode }) {
  return (
    <div className={`bg-[var(--surface-container-lowest)] rounded-xl shadow-[0px_12px_32px_rgba(25,28,29,0.04)] ${className}`} style={style}>
      {children}
    </div>
  );
}

export function CardHeader({ className = '', style, children }: { className?: string; style?: React.CSSProperties; children: React.ReactNode }) {
  return <div className={`p-6 pb-0 ${className}`} style={style}>{children}</div>;
}

export function CardTitle({ className = '', style, children }: { className?: string; style?: React.CSSProperties; children: React.ReactNode }) {
  return <h3 className={`text-lg font-semibold font-headline ${className}`} style={style}>{children}</h3>;
}

export function CardDescription({ className = '', style, children }: { className?: string; style?: React.CSSProperties; children: React.ReactNode }) {
  return <p className={`text-sm mt-0.5`} style={{ color: 'var(--on-surface-variant)', ...style }}>{children}</p>;
}

export function CardContent({ className = '', style, children }: { className?: string; style?: React.CSSProperties; children: React.ReactNode }) {
  return <div className={`p-6 ${className}`} style={style}>{children}</div>;
}
