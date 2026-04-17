import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ResendEmailButton } from './resend-button';
import Link from 'next/link';

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email } = await searchParams;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-surface p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <span className="material-symbols-outlined text-5xl" style={{ color: 'var(--primary)' }}>mark_email_unread</span>
          </div>
          <CardTitle className="text-xl font-headline">Verifikasi Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-blue-700 text-sm font-medium">
            Kami telah mengirim link verifikasi ke <strong>{email || 'email Anda'}</strong>. Silakan cek inbox dan klik link tersebut untuk mengaktifkan akun.
          </div>

          <ResendEmailButton email={email} />

          <div className="text-center space-y-2">
            <p className="text-sm" style={{ color: 'var(--on-surface-variant)' }}>
              Setelah verifikasi, Anda bisa{' '}
              <Link href="/login" className="font-bold" style={{ color: 'var(--primary)' }}>
                login di sini
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
