'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { submitQuiz } from '@/app/(dashboard)/student/quizzes/actions';
import { AudioPlayer } from '@/components/quiz/audio-player';
import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { QuestionRenderer } from './question-renderer';
import type { Quiz } from '@/lib/supabase/types';

interface QuizQuestion {
  id: string;
  quiz_id?: string;
  type: string;
  question_text: string;
  audio_url: string | null;
  sort_order: number;
  answers: { id: string; answer_text: string; sort_order: number }[];
}

interface QuizPlayerProps {
  quiz: Quiz;
  questions: QuizQuestion[];
}

const STORAGE_KEY_PREFIX = 'pb_quiz_';

export function QuizPlayer({ quiz, questions }: QuizPlayerProps) {
  const storageKey = `${STORAGE_KEY_PREFIX}${quiz.id}`;

  // Restore saved state from localStorage
  const getSavedState = useCallback(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, [storageKey]);

  const saved = getSavedState();

  const [answers, setAnswers] = useState<Record<string, string>>(saved?.answers || {});
  const [voiceBlobs, setVoiceBlobs] = useState<Record<string, Blob>>({});
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [tabSwitchCount, setTabSwitchCount] = useState(saved?.tabSwitchCount || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Calculate time left from saved start time or current time
  const [timeLeft, setTimeLeft] = useState(() => {
    if (saved?.startTime) {
      const elapsed = Math.floor((Date.now() - saved.startTime) / 1000);
      const remaining = (quiz.duration * 60) - elapsed;
      return Math.max(remaining, 0);
    }
    return quiz.duration * 60;
  });

  const [startTime] = useState(saved?.startTime || Date.now());

  const supabase = createBrowserClient();

  // Save state to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        answers,
        startTime,
        tabSwitchCount,
      }));
    } catch {
      // localStorage full or unavailable
    }
  }, [answers, startTime, tabSwitchCount, storageKey]);

  // Clear localStorage on successful submit
  const clearSavedState = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch {}
  }, [storageKey]);

  // Tab Tracking logic
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => prev + 1);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Timer logic
  useEffect(() => {
    if (timeLeft <= 0 && !isSubmitting) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft <= 0, isSubmitting]);

  const handleAnswerSelect = (questionId: string, answerId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answerId }));
  };

  const handleTextChange = (questionId: string, text: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: text }));
  };

  const handleVoiceUpload = (questionId: string, blob: Blob) => {
    setVoiceBlobs(prev => ({ ...prev, [questionId]: blob }));
  };

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // 1. Upload Speaking Blobs first
      const finalAnswers = { ...answers };

      const uploadPromises = Object.entries(voiceBlobs).map(async ([qId, blob]) => {
        const fileName = `${quiz.id}/${crypto.randomUUID()}.webm`;
        const { error } = await supabase.storage
          .from('speaking-responses')
          .upload(fileName, blob);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('speaking-responses')
          .getPublicUrl(fileName);

        finalAnswers[qId] = publicUrl;
      });

      await Promise.all(uploadPromises);

      // 2. Submit everything to server
      await submitQuiz(quiz.id, finalAnswers, tabSwitchCount);

      // 3. Clear saved state on success
      clearSavedState();
    } catch (error) {
      console.error('Submission failed:', error);
      setIsSubmitting(false);
    }
  }, [answers, voiceBlobs, quiz.id, tabSwitchCount, supabase, isSubmitting, clearSavedState]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const answeredCount = questions.filter(q => answers[q.id] || voiceBlobs[q.id]).length;

  return (
    <div className="min-h-screen bg-surface font-body pb-32">
      {/* Floating Premium Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-100 whisper-shadow px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
           <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg">
                    <span className="material-symbols-outlined">quiz</span>
                </div>
                <div>
                    <h3 className="font-headline font-black text-slate-900 tracking-tight leading-none italic">{quiz.title}</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">Sesi CBT Aktif</p>
                </div>
           </div>

           <div className="flex items-center gap-6">
                {tabSwitchCount > 0 && (
                    <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-xl border border-orange-100 animate-pulse">
                        <span className="material-symbols-outlined text-sm font-black">warning</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">{tabSwitchCount} Tab Berpindah</span>
                    </div>
                )}
                <div className={`px-6 py-2 rounded-2xl flex items-center gap-3 transition-colors ${timeLeft < 60 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-slate-50 text-slate-800'}`}>
                    <span className="material-symbols-outlined text-sm font-black">timer</span>
                    <span className="text-xl font-headline font-black tabular-nums">
                        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                    </span>
                </div>
           </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto mt-12 px-8 grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Navigasi Sidebar */}
        <aside className="hidden lg:block space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Navigasi</h4>
            <div className="grid grid-cols-5 gap-2">
                {questions.map((_: any, i: number) => {
                    const isAnswered = answers[questions[i].id] || voiceBlobs[questions[i].id];
                    const isActive = activeQuestion === i;
                    return (
                        <button
                            key={i}
                            onClick={() => setActiveQuestion(i)}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                                isActive ? 'bg-primary text-white shadow-xl scale-110 z-10' :
                                isAnswered ? 'bg-blue-50 text-primary border border-blue-100' : 'bg-white text-slate-300 border border-slate-100 hover:border-slate-300'
                            }`}
                        >
                            {i + 1}
                        </button>
                    );
                })}
            </div>

            <div className="p-4 bg-slate-50 rounded-xl text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {answeredCount}/{questions.length} Dijawab
              </p>
            </div>

            <div className="p-6 bg-slate-900 rounded-[1.5rem] shadow-2xl space-y-3">
                <div className="flex items-center gap-2 text-blue-300">
                    <span className="material-symbols-outlined text-sm">info</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">Petunjuk</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                    Jawaban Anda otomatis tersimpan. Jika halaman ter-refresh, jawaban dan timer akan tetap ada. Klik &quot;Selesai &amp; Kirim&quot; untuk mengumpulkan.
                </p>
                <div className="pt-2 border-t border-slate-800">
                    <p className="text-[9px] text-orange-400 italic">Peringatan: Jangan berpindah tab selama ujian berlangsung.</p>
                </div>
            </div>
        </aside>

        {/* Question Area */}
        <div className="lg:col-span-3 space-y-8">
            <div className="bg-white rounded-[2.5rem] whisper-shadow border border-slate-50 overflow-hidden animate-slide-up">
                <div className="bg-slate-50 px-8 py-4 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Soal {activeQuestion + 1} dari {questions.length}</span>
                    <div className="flex gap-1 h-1.5 w-32 bg-slate-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${((activeQuestion + 1) / questions.length) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="p-10">
                    <QuestionRenderer
                        question={questions[activeQuestion] as any}
                        questionIndex={activeQuestion}
                        totalQuestions={questions.length}
                        selectedAnswerId={answers[questions[activeQuestion].id] || null}
                        answerText={answers[questions[activeQuestion].id] || ''}
                        onAnswerSelect={(id) => handleAnswerSelect(questions[activeQuestion].id, id)}
                        onTextChange={(text) => handleTextChange(questions[activeQuestion].id, text)}
                        onVoiceUpload={(blob) => handleVoiceUpload(questions[activeQuestion].id, blob)}
                    />
                </div>

            </div>

            <div className="flex items-center justify-between px-2 pt-4">
                <Button
                    variant="outline"
                    disabled={activeQuestion === 0}
                    onClick={() => setActiveQuestion(prev => prev - 1)}
                    className="h-14 px-8 rounded-2xl border-2 font-black italic tracking-tight"
                >
                    Soal Sebelumnya
                </Button>

                {activeQuestion < questions.length - 1 ? (
                    <Button
                        onClick={() => setActiveQuestion(prev => prev + 1)}
                        className="h-14 px-10 rounded-2xl shadow-xl font-black italic tracking-tight"
                    >
                        Soal Berikutnya
                        <span className="material-symbols-outlined ml-2 text-sm">arrow_forward</span>
                    </Button>
                ) : (
                    <Button
                        onClick={() => setConfirmOpen(true)}
                        disabled={isSubmitting}
                        className="h-14 px-10 rounded-2xl shadow-2xl bg-slate-900 hover:bg-black font-black italic tracking-tight"
                    >
                        {isSubmitting ? 'Mengunggah Jawaban...' : 'Selesai & Kirim'}
                        {!isSubmitting && <span className="material-symbols-outlined ml-2 text-sm">verified</span>}
                    </Button>
                )}
            </div>
        </div>
      </main>

      {/* Mobile Submit FAB */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <Button
            onClick={() => setConfirmOpen(true)}
            disabled={isSubmitting}
            className="w-16 h-16 rounded-full shadow-2xl flex items-center justify-center p-0"
        >
            <span className="material-symbols-outlined text-3xl">send</span>
        </Button>
      </div>

      {/* Confirmation Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-3xl text-primary">help</span>
              </div>
              <h3 className="text-xl font-headline font-black text-slate-900">Kirim Kuis?</h3>
              <p className="text-sm text-slate-500 font-medium">
                Anda telah menjawab <span className="font-bold text-primary">{answeredCount}</span> dari <span className="font-bold">{questions.length}</span> soal.
                {answeredCount < questions.length && (
                  <span className="block mt-2 text-orange-600 font-bold">Masih ada soal yang belum dijawab!</span>
                )}
              </p>
            </div>
            <div className="flex gap-3 p-6 bg-slate-50">
              <Button
                variant="outline"
                onClick={() => setConfirmOpen(false)}
                className="flex-1 h-12 rounded-xl font-bold"
              >
                Kembali
              </Button>
              <Button
                onClick={() => { setConfirmOpen(false); handleSubmit(); }}
                className="flex-1 h-12 rounded-xl font-bold"
              >
                Ya, Kirim
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
