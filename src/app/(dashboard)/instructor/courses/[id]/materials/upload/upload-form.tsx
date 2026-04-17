'use client';

import { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { uploadMaterial } from '../actions';

export function MaterialUploadForm({ courseId }: { courseId: string }) {
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setMessage(null);
    try {
      await uploadMaterial(formData);
      setMessage({ type: 'success', text: 'Materi berhasil diunggah ke kurikulum!' });
      formRef.current?.reset();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Gagal mengunggah materi.' });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form action={handleSubmit} ref={formRef} className="space-y-8">
      <input type="hidden" name="course_id" value={courseId} />
      
      {message && (
        <div className={`p-5 rounded-[1.5rem] text-sm font-bold border animate-fade-in ${
            message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
        }`}>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined">{message.type === 'success' ? 'check_circle' : 'error'}</span>
            {message.text}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Judul Materi</label>
        <Input 
          name="title" 
          type="text" 
          placeholder="Materi #1: Dasar Listening" 
          required 
          disabled={isPending}
          className="h-14 rounded-2xl border-slate-100 focus:ring-primary/20 bg-slate-50/30"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2 flex flex-col">
          <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Tipe Konten</label>
          <select 
            name="type" 
            required 
            disabled={isPending}
            className="h-14 rounded-2xl border border-slate-100 px-4 text-sm font-bold bg-slate-50/30 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="pdf">📄 Document (PDF)</option>
            <option value="audio">🎧 Audio Lesson (MP3)</option>
            <option value="video">🎥 Video Course (MP4)</option>
          </select>
        </div>

        <div className="space-y-2 flex flex-col">
          <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Kategori Kemahiran</label>
          <select 
            name="skill_category" 
            disabled={isPending}
            className="h-14 rounded-2xl border border-slate-100 px-4 text-sm font-bold bg-slate-50/30 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Umum</option>
            <option value="listening">Kemampuan Mendengar</option>
            <option value="reading">Penguasaan Membaca</option>
            <option value="writing">Kemampuan Menulis</option>
            <option value="technical">Kosakata Teknis</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Berkas Digital</label>
        <div className={`relative border-2 border-dashed rounded-[2rem] p-12 flex flex-col items-center justify-center bg-slate-50/50 transition-all group ${isPending ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary hover:bg-white cursor-pointer'}`}>
          <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-300 group-hover:text-primary transition-colors mb-4 border border-slate-100">
             <span className="material-symbols-outlined text-3xl">cloud_upload</span>
          </div>
          <input 
            name="file" 
            type="file" 
            accept=".pdf,.mp3,.wav,.mp4,.webm" 
            required 
            disabled={isPending}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <p className="text-sm font-bold text-slate-700">Pilih file atau seret ke sini</p>
          <p className="text-[10px] text-slate-400 mt-2 font-black uppercase tracking-widest">Ukuran maks: 50MB</p>
        </div>
      </div>

      <div className="pt-4">
        <Button type="submit" size="lg" className="w-full md:w-fit px-12 h-16 rounded-2xl shadow-2xl hover:scale-105 transition-all font-black text-base" disabled={isPending}>
          {isPending ? (
            <div className="flex items-center gap-3">
              <span className="animate-spin material-symbols-outlined">sync</span>
              Mengunggah...
            </div>
          ) : (
            'Publish Materi'
          )}
        </Button>
      </div>
    </form>
  );
}
