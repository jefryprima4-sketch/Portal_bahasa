'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { gradeSubmission } from '@/app/(dashboard)/instructor/grading-actions';

interface GradingFormProps {
  courseId: string;
  submissionId: string;
  initialScore: number;
  initialFeedback: string;
}

export function GradingForm({ courseId, submissionId, initialScore, initialFeedback }: GradingFormProps) {
  const [score, setScore] = useState(initialScore);
  const [feedback, setFeedback] = useState(initialFeedback);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await gradeSubmission(courseId, submissionId, score, feedback);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      alert('Gagal menyimpan penilaian');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[3rem] p-10 shadow-2xl relative overflow-hidden border border-slate-100">
      <div className="relative z-10 grid grid-cols-1 gap-12">
        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl font-headline font-black text-slate-900 tracking-tight italic flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">edit_note</span>
              Evaluasi Manual & Umpan Balik
            </h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Gunakan form ini untuk menentukan nilai akhir jawaban subjektif (Speaking/Esai) dan memberikan umpan balik kualitatif kepada mahasiswa.
            </p>
          </div>

          <div className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nilai Akhir (0-100)</label>
              <div className="relative group">
                  <input
                      type="number"
                      min="0"
                      max="100"
                      value={score}
                      onChange={(e) => setScore(Number(e.target.value))}
                      required
                      className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 font-headline font-black text-2xl text-primary focus:border-primary/30 focus:outline-none transition-all"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 font-black">/100</div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Umpan Balik Dosen</label>
              <textarea
                  placeholder="Berikan catatan evaluasi atau panduan untuk mahasiswa..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full min-h-[120px] bg-slate-50 border-2 border-slate-100 rounded-2xl p-6 text-sm font-medium focus:border-primary/30 focus:outline-none transition-all resize-none"
              />
            </div>

            <Button
              type="button"
              disabled={loading}
              onClick={handleSave}
              className="w-full h-14 rounded-2xl shadow-xl hover:scale-[1.02] transition-all font-bold text-sm tracking-tight"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Menyimpan Nilai...
                </span>
              ) : success ? (
                'Nilai Tersimpan!'
              ) : (
                'Simpan Nilai & Kirim Umpan Balik'
              )}
            </Button>
          </div>
        </div>

        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32" />
      </div>
    </div>
  );
}
