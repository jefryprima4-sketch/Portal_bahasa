import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { register } from './actions';
import Link from 'next/link';

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen w-full flex bg-surface">
      {/* Visual Side (Left) - Hidden on smaller screens for mobile registration focus */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-900 via-slate-900/20 to-slate-900/40" />
        <img 
          src="/portal_bahasa_auth_hero_1775718423197.png" 
          alt="Portal Bahasa Registration" 
          className="absolute inset-0 w-full h-full object-cover opacity-80 scale-105"
        />
        <div className="relative z-20 p-20 flex flex-col justify-between h-full text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <span className="material-symbols-outlined text-white">school</span>
            </div>
            <span className="text-xl font-headline font-black tracking-tighter uppercase">Portal Bahasa</span>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-5xl font-headline font-black leading-tight tracking-tighter">
              Mulai <br />
              <span className="text-blue-200">Perjalanan</span> Anda.
            </h2>
            <p className="max-w-md text-blue-100/80 font-medium leading-relaxed">
              Bergabunglah dengan ribuan mahasiswa lainnya untuk meningkatkan kemahiran bahasa Anda melalui sistem pengujian standar akademik.
            </p>
          </div>
          
          <div className="text-xs font-medium text-blue-300/80 tracking-wide">
            Politeknik Teknologi Kimia Industri Medan
          </div>
        </div>
      </div>

      {/* Form Side (Right) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-sm space-y-8 py-12">
          <div className="space-y-2">
            <h3 className="text-3xl font-headline font-black text-slate-900 tracking-tight">Daftar Akun Baru</h3>
            <p className="text-sm text-slate-500 font-medium">Lengkapi data diri Anda untuk memulai akses CBT.</p>
          </div>

          <form action={register} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <Input 
                label="Nama Lengkap" 
                name="name" 
                type="text" 
                placeholder="Masukkan nama lengkap Anda" 
                required 
                className="h-12 rounded-xl"
              />
              <Input 
                label="Email Institusi" 
                name="email" 
                type="email" 
                placeholder="nim@ptki.ac.id" 
                required 
                className="h-12 rounded-xl"
              />
              <Input
                label="NIM"
                name="nim"
                type="text"
                placeholder="8-10 digit"
                required
                className="h-12 rounded-xl"
                pattern="\d{8,10}"
                title="NIM harus berupa angka 8-10 digit"
              />
              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="Minimal 8 karakter"
                required
                className="h-12 rounded-xl"
                minLength={8}
              />
              <Input
                label="Konfirmasi Password"
                name="passwordConfirm"
                type="password"
                placeholder="Ulangi password"
                required
                className="h-12 rounded-xl"
                minLength={8}
              />
            </div>

            <Button type="submit" size="lg" className="w-full h-14 rounded-2xl text-base shadow-xl hover:shadow-primary/20 transition-all font-bold mt-4">
              Buat Akun Sekarang
            </Button>
            
            <p className="text-center text-sm text-slate-500 font-medium">
              Sudah memiliki akun?{' '}
              <Link href="/login" className="font-bold text-primary hover:underline">Masuk di sini</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
