'use client';

import { useState } from 'react';
import { AttendanceScanner } from '@/components/attendance/AttendanceScanner';

interface StudentAttendanceClientProps {
  children: React.ReactNode;
}

export function StudentAttendanceClient({ children }: StudentAttendanceClientProps) {
  const [showScanner, setShowScanner] = useState(false);

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="space-y-1">
          <h2 className="text-4xl font-headline font-black text-on-surface tracking-tighter italic">Kehadiran Saya</h2>
          <p className="text-on-surface-variant font-medium">Rekapitulasi kehadiran Anda untuk setiap mata kuliah yang diikuti.</p>
        </div>
        
        <button 
          onClick={() => setShowScanner(true)}
          className="group relative flex items-center justify-between gap-6 px-8 py-5 bg-slate-900 border border-slate-800 rounded-[2rem] hover:bg-black transition-all shadow-2xl active:scale-95 overflow-hidden"
        >
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Pindai Terotentikasi</p>
            <p className="text-sm font-black text-white italic tracking-tight">Catat Kehadiran Sekarang</p>
          </div>
          <div className="relative z-10 w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white backdrop-blur-sm group-hover:bg-primary group-hover:rotate-12 transition-all">
            <span className="material-symbols-outlined font-black">qr_code_scanner</span>
          </div>
          {/* Animated background element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2" />
        </button>
      </div>

      {children}

      {showScanner && (
        <AttendanceScanner onClose={() => setShowScanner(false)} />
      )}
    </>
  );
}
