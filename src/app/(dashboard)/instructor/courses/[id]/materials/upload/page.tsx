import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { MaterialUploadForm } from './upload-form';

export default async function UploadMaterialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <div className="p-8 lg:p-12 space-y-10 max-w-4xl mx-auto font-body">
      {/* Header */}
      <section className="space-y-1">
        <a href={`/instructor/courses/${id}/materials`} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary hover:underline group mb-2">
          <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Back to Materials
        </a>
        <h2 className="text-4xl font-headline font-black text-on-surface tracking-tighter italic">Upload Resource</h2>
        <p className="text-on-surface-variant font-medium">Tambahkan materi pembelajaran baru ke dalam kurikulum kursus Anda.</p>
      </section>

      {/* Upload Container */}
      <div className="bg-white rounded-[2.5rem] whisper-shadow border border-slate-50 p-10">
        <MaterialUploadForm courseId={id} />
      </div>

      <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 italic">
        <div className="flex gap-4">
            <span className="material-symbols-outlined text-primary">info</span>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Pastikan file yang diunggah sesuai dengan kategori yang dipilih. Sistem akan secara otomatis mengoptimalkan file audio dan dokumen PDF untuk aksesibilitas mahasiswa yang lebih baik.
            </p>
        </div>
      </div>
    </div>
  );
}
