'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { recordAttendance } from '@/app/(dashboard)/student/attendance/actions';

interface AttendanceScannerProps {
  onClose: () => void;
}

export function AttendanceScanner({ onClose }: AttendanceScannerProps) {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'processing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Timeout to allow DOM rendering
    const timer = setTimeout(() => {
      startScanner();
    }, 300);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, []);

  const startScanner = () => {
    if (scannerRef.current) return;

    setStatus('scanning');
    
    // Configure scanner
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
      rememberLastUsedCamera: true,
    };

    const scanner = new Html5QrcodeScanner('qr-reader', config, false);
    scannerRef.current = scanner;

    scanner.render(onScanSuccess, onScanFailure);
  };

  async function onScanSuccess(decodedText: string) {
    if (status === 'processing' || status === 'success') return;
    
    // Stop scanner briefly to process
    setStatus('processing');
    
    try {
      const result = await recordAttendance(decodedText);
      if (result.success) {
        setStatus('success');
        setMessage(result.message);
        // Automatically close after 3 seconds on success
        setTimeout(onClose, 3000);
      } else {
        setStatus('error');
        setMessage(result.message);
        // Reset to scanning after 3 seconds on error
        setTimeout(() => {
            setStatus('scanning');
            setMessage('');
        }, 3000);
      }
    } catch (error) {
      setStatus('error');
      setMessage('Terjadi kesalahan tak terduga.');
      setTimeout(() => setStatus('scanning'), 3000);
    }
  }

  function onScanFailure(error: string) {
    // Silence errors to keep console clean unless needed for debugging
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-6 font-body">
      <div className="relative w-full max-w-md bg-white rounded-[3rem] overflow-hidden shadow-2xl animate-scale-in">
        
        {/* Header */}
        <div className="p-8 text-center space-y-2">
            <h3 className="text-2xl font-headline font-black italic text-slate-800 tracking-tight">Pemindai QR Kehadiran</h3>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Pindai kode di layar Dosen</p>
        </div>

        {/* Scanner Area */}
        <div className="relative aspect-square bg-slate-100 mx-8 overflow-hidden rounded-[2rem] border-2 border-slate-50">
            <div id="qr-reader" className="w-full h-full" />
            
            {/* Overlay Status */}
            {(status === 'processing' || status === 'success' || status === 'error') && (
                <div className={`absolute inset-0 flex flex-col items-center justify-center p-8 transition-all duration-500 z-10 ${
                    status === 'success' ? 'bg-primary/90 text-white' : 
                    status === 'error' ? 'bg-red-500/90 text-white' : 
                    'bg-white/80 text-slate-800'
                }`}>
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4 backdrop-blur-md animate-bounce">
                        <span className="material-symbols-outlined text-4xl">
                            {status === 'success' ? 'check_circle' : status === 'error' ? 'error' : 'sync'}
                        </span>
                    </div>
                    <p className="text-center font-bold text-lg leading-tight">{message || (status === 'processing' ? 'Memproses...' : '')}</p>
                </div>
            )}
        </div>

        {/* Footer / Controls */}
        <div className="p-10 flex flex-col items-center gap-6">
            <button 
                onClick={onClose}
                className="px-10 py-4 rounded-2xl bg-slate-100 text-slate-500 font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-200 transition-all"
            >
                Batalkan Pemindaian
            </button>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 italic">Memastikan koneksi terverifikasi yang aman</p>
        </div>

        {/* Styling overrides for html5-qrcode library to match theme */}
        <style jsx global>{`
          #qr-reader { border: none !important; }
          #qr-reader__dashboard { display: none !important; }
          #qr-reader__status_span { display: none !important; }
          #qr-reader video { object-fit: cover !important; border-radius: 1.5rem; }
        `}</style>
      </div>
    </div>
  );
}
