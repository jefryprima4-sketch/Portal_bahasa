import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ResetPasswordForm } from './reset-form';

export default async function ResetPasswordPage() {
  return (
    <div className="min-h-screen w-full flex bg-surface">
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-900 via-slate-900/20 to-slate-900/40" />
        <img
          src="/portal_bahasa_auth_hero_1775718423197.png"
          alt="Portal Bahasa"
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
              Atur Ulang<br />
              <span className="text-blue-200">Password</span> Anda
            </h2>
            <p className="max-w-md text-blue-100/80 font-medium leading-relaxed">
              Masukkan email institusional Anda dan kami akan mengirimkan tautan untuk mengatur ulang kata sandi.
            </p>
          </div>
          <div className="text-xs font-bold tracking-widest uppercase text-blue-300">
            Politeknik Teknologi Kimia Industri Medan
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
        <div className="absolute top-8 right-8">
          <a href="/login" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors group">
            <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
            Kembali ke Login
          </a>
        </div>

        <div className="w-full max-w-sm space-y-10">
          <div className="space-y-2">
            <h3 className="text-3xl font-headline font-black text-slate-900 tracking-tight">Lupa Password?</h3>
            <p className="text-sm text-slate-500 font-medium">Kami akan mengirimkan link reset ke email Anda.</p>
          </div>

          <ResetPasswordForm />
        </div>
      </div>
    </div>
  );
}
