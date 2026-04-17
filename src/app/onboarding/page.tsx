import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { logout } from '@/app/(auth)/login/actions';

export const dynamic = 'force-dynamic';

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();

  if (profile) {
    redirect('/');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--surface)] p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-[var(--primary-fixed)]/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-[var(--primary)] text-4xl">person_search</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-headline" style={{ color: 'var(--primary)' }}>Profil Tidak Ditemukan</CardTitle>
          <CardDescription className="text-base">
            Akun Anda terdaftar di sistem autentikasi, tetapi data profil tidak ditemukan di database.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
            <p className="font-semibold mb-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">warning</span>
              Kemungkinan Penyebab:
            </p>
            <ul className="list-disc list-inside space-y-1 opacity-90">
              <li>Trigger pembuatan profil otomatis gagal saat pendaftaran.</li>
              <li>Akun dibuat secara manual tanpa sinkronisasi tabel profil.</li>
              <li>Data profil terhapus secara tidak sengaja.</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3 text-center">
            <p className="text-sm font-body" style={{ color: 'var(--on-surface-variant)' }}>
              Silakan hubungi administrator IT untuk mendaftarkan NIP/NIM Anda secara manual, atau coba muat ulang halaman jika Anda baru saja melakukan perubahan.
            </p>
            <div className="flex flex-col gap-2 mt-4">
              <form action={logout} className="w-full">
                <Button className="w-full" type="submit">Keluar dan Coba Login Ulang</Button>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
