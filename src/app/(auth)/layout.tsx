export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--primary-fixed)]/30 to-[var(--surface)] p-4">
      {children}
    </div>
  );
}
