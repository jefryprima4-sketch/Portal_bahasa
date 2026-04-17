'use client';

import { useState, useRef, useEffect } from 'react';

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  maxDuration?: number; // seconds
}

export function VoiceRecorder({ onRecordingComplete, maxDuration = 120 }: VoiceRecorderProps) {
  const [status, setStatus] = useState<'idle' | 'recording' | 'reviewing'>('idle');
  const [timeLeft, setTimeLeft] = useState(maxDuration);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        onRecordingComplete(blob);
        setStatus('reviewing');
        
        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setStatus('recording');
      setTimeLeft(maxDuration);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('Akses mikrofon ditolak. Berikan izin untuk melanjutkan tes Speaking.');
    }

  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && status === 'recording') {
      mediaRecorderRef.current.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const discardRecording = () => {
    setAudioUrl(null);
    setStatus('idle');
    setTimeLeft(maxDuration);
  };

  return (
    <div className="p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 space-y-8 animate-fade-in font-body">
      {/* Header Stat Area */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${status === 'recording' ? 'bg-red-500 animate-pulse' : 'bg-slate-300'}`} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                {status === 'idle' ? 'Siap Merekam' : status === 'recording' ? 'Sedang Merekam' : 'Rekaman Tersimpan'}
            </span>
        </div>
        <div className="px-4 py-1.5 bg-white rounded-full shadow-sm border border-slate-100">
            <span className="text-xs font-black tabular-nums text-slate-600">
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </span>
        </div>
      </div>

      {/* Main Interaction Area */}
      <div className="flex flex-col items-center justify-center py-6">
        {status === 'idle' && (
          <button 
            onClick={startRecording}
            className="group relative w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white shadow-[0_20px_40px_rgba(var(--primary-rgb),0.3)] hover:scale-105 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-4xl font-black">mic</span>
            {/* Animated Ring */}
            <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping group-hover:duration-700" />
          </button>
        )}

        {status === 'recording' && (
          <div className="flex flex-col items-center space-y-8">
            {/* Visualizer Mock (Can be replaced with real Web Audio API visualization) */}
            <div className="flex items-center gap-1.5 h-12">
                {[...Array(12)].map((_, i) => (
                    <div 
                        key={i} 
                        className="w-1.5 bg-primary rounded-full animate-voice-bar" 
                        style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }}
                    />
                ))}
            </div>
            <button 
                onClick={stopRecording}
                className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center text-white shadow-xl hover:bg-black transition-all active:scale-95"
            >
                <span className="material-symbols-outlined text-3xl font-black">stop</span>
            </button>
          </div>
        )}

        {status === 'reviewing' && audioUrl && (
          <div className="w-full space-y-8 flex flex-col items-center">
            <div className="w-full p-6 bg-white rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                <audio controls src={audioUrl} className="flex-1 h-10" />
            </div>
            <div className="flex items-center gap-4">
                <button 
                    onClick={discardRecording}
                    className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all"
                >
                    <span className="material-symbols-outlined text-sm">delete</span>
                    Buang & Ulangi
                </button>
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-[9px] font-black uppercase tracking-widest text-slate-300 italic">
        Pastikan Anda berada di lingkungan yang tenang untuk hasil terbaik
      </p>

      <style jsx>{`
        @keyframes voice-bar {
          0%, 100% { height: 20%; }
          50% { height: 100%; }
        }
        .animate-voice-bar {
          animation: voice-bar 0.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
