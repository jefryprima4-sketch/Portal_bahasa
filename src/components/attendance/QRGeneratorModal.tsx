'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { generateQrToken } from '@/app/(dashboard)/instructor/attendance-actions';

interface QRGeneratorModalProps {
  courseId: string;
  courseTitle: string;
  onClose: () => void;
}

export function QRGeneratorModal({ courseId, courseTitle, onClose }: QRGeneratorModalProps) {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState('');
  const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  useEffect(() => {
    generateQrToken(courseId).then(result => {
      if (result.error) {
        setError(result.error);
      } else if (result.token) {
        setToken(result.token);
      }
    });
  }, [courseId]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-6 font-body">
      <div className="relative w-full max-w-lg bg-white rounded-[3rem] overflow-hidden shadow-2xl animate-scale-in">

        {/* Header */}
        <div className="p-10 text-center space-y-2 border-b border-slate-50">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Pintu Masuk Kehadiran Dinamis</p>
            <h3 className="text-3xl font-headline font-black italic text-slate-800 tracking-tight">{courseTitle}</h3>
            <p className="text-sm font-medium text-slate-400">Pindai kode ini untuk memverifikasi kehadiran mahasiswa pada <span className="text-slate-600 font-bold">{today}</span></p>
        </div>

        {/* QR Core Area */}
        <div className="p-12 flex flex-col items-center justify-center bg-slate-50/50">
            {error ? (
              <div className="p-8 text-center">
                <span className="material-symbols-outlined text-5xl text-red-400 mb-4">error</span>
                <p className="text-sm text-red-600 font-bold">{error}</p>
              </div>
            ) : !token ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm text-slate-400 font-medium">Membuat token aman...</p>
              </div>
            ) : (
              <>
                <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-white">
                    <QRCodeSVG
                      value={token}
                      size={280}
                      level="H"
                      includeMargin={true}
                      imageSettings={{
                        src: "/favicon.ico",
                        x: undefined,
                        y: undefined,
                        height: 48,
                        width: 48,
                        excavate: true,
                      }}
                    />
                </div>

                <div className="mt-10 flex items-center gap-4 px-6 py-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">HMAC-Ditandatangani &amp; Terkunci Waktu</span>
                </div>
              </>
            )}
        </div>

        {/* Footer / Controls */}
        <div className="p-10 flex flex-col items-center gap-4">
            <button
                onClick={onClose}
                className="w-full py-5 rounded-[1.5rem] bg-slate-900 text-white font-black italic tracking-tight hover:bg-black transition-all shadow-xl active:scale-95"
            >
                Tutup & Akhiri Sesi
            </button>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300">Token berlaku hari ini saja &middot; Buat ulang untuk sesi baru</p>
        </div>
      </div>
    </div>
  );
}
