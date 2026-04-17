import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { login } from './actions';
import Link from 'next/link';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  
  return (
    <div className="min-h-screen w-full flex bg-surface">
      {/* Visual Side (Left) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-900 via-slate-900/20 to-slate-900/40" />
        <img 
          src="/portal_bahasa_auth_hero_1775718423197.png" 
          alt="Portal Bahasa Mastery" 
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
              Raih <br />
              <span className="text-blue-200">Kemahiran</span> Bahasa Anda.
            </h2>
            <p className="max-w-md text-blue-100/80 font-medium leading-relaxed">
              Selamat datang kembali di platform CBT untuk kemahiran berbahasa di PTKI Medan.
            </p>
          </div>
          
          <div className="text-xs font-bold tracking-widest uppercase text-blue-300">
            Politeknik Teknologi Kimia Industri Medan
          </div>
        </div>
      </div>

      {/* Form Side (Right) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
        <div className="absolute top-8 right-8">
            <Link href="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors group">
                <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
                Kembali ke Beranda
            </Link>
        </div>

        <div className="w-full max-w-sm space-y-10">
          <div className="space-y-2">
            <h3 className="text-3xl font-headline font-black text-slate-900 tracking-tight">Selamat Datang</h3>

            <p className="text-sm text-slate-500 font-medium">Silakan masuk untuk melanjutkan sesi belajar Anda.</p>
          </div>

          <form action={login} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100 animate-shake">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <Input 
                label="Email Institusi" 
                name="email" 
                type="email" 
                placeholder="id@ptki.ac.id" 
                required 
                className="h-12 rounded-xl bg-white border-slate-200 focus:ring-primary/20"
              />
              <Input 
                label="Password" 
                name="password" 
                type="password" 
                placeholder="••••••••" 
                required 
                className="h-12 rounded-xl bg-white border-slate-200 focus:ring-primary/20"
              />
            </div>

            <div className="flex items-center justify-end">
                <a href="/reset-password" className="text-xs font-bold text-primary hover:underline">Lupa password?</a>
            </div>

            <Button type="submit" size="lg" className="w-full h-14 rounded-2xl text-base shadow-xl hover:shadow-primary/20 transition-all font-bold">
              Masuk ke Dashboard
            </Button>
            
            <p className="text-center text-sm text-slate-500 font-medium">
              Belum punya akun?{' '}
              <Link href="/register" className="font-bold text-primary hover:underline">Daftar sekarang</Link>
            </p>
          </form>

        </div>
      </div>
    </div>
  );
}
