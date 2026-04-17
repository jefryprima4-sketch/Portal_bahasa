import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { deleteMaterial } from './actions';

export default async function InstructorMaterialsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: materials } = await supabase.from('materials').select('*').eq('course_id', id).order('created_at', { ascending: false });

  const typeIcons: Record<string, string> = { pdf: 'picture_as_pdf', audio: 'headphones', video: 'smart_display' };

  return (
    <div className="p-8 lg:p-12 space-y-10 max-w-7xl mx-auto font-body">
      {/* Header & Back Link */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <a href="/instructor/courses" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary hover:underline group mb-2">
            <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
            Kembali ke Kelola Kursus
          </a>
          <h2 className="text-4xl font-headline font-black text-on-surface tracking-tighter italic">Materi Kursus</h2>
          <p className="text-on-surface-variant font-medium">Unggah dan kelola sumber daya pembelajaran untuk mahasiswa Anda.</p>
        </div>
        <a href={`/instructor/courses/${id}/materials/upload`}>
          <Button className="h-14 px-8 rounded-2xl shadow-xl hover:scale-105 transition-all font-black text-base">
            <span className="material-symbols-outlined mr-2">upload_file</span>
            Upload Materi Baru
          </Button>
        </a>
      </section>

      {/* Materials Table Container */}
      <div className="bg-white rounded-[2.5rem] overflow-hidden whisper-shadow border border-slate-50">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-[10px] uppercase tracking-widest font-black text-slate-500">
              <th className="px-8 py-5">Judul Materi</th>
              <th className="px-8 py-5">Tipe</th>
              <th className="px-8 py-5">Kategori Kemahiran</th>
              <th className="px-8 py-5">Tgl Diperbarui</th>
              <th className="px-8 py-5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 font-medium">
            {materials && materials.length > 0 ? (
              materials.map((mat: any) => (
                <tr key={mat.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                      <span className="material-symbols-outlined text-xl">{typeIcons[mat.type] || 'description'}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-800">{mat.title}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      mat.type === 'pdf' ? 'bg-blue-50 text-blue-700' : 
                      mat.type === 'audio' ? 'bg-orange-50 text-orange-700' : 'bg-green-50 text-green-700'
                    }`}>
                      {mat.type}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-xs text-slate-500 font-bold uppercase tracking-widest italic">
                    {mat.skill_category || 'General'}
                  </td>
                  <td className="px-8 py-5 text-xs text-slate-400">
                    {new Date(mat.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <form action={async () => { 'use server'; await deleteMaterial(mat.id, id, mat.file_url); }}>
                      <button type="submit" className="w-10 h-10 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center ml-auto">
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center">
                   <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                       <span className="material-symbols-outlined text-3xl text-slate-200">inventory_2</span>
                   </div>
                   <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Belum Ada Materi Terunggah</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        <div className="px-8 py-5 bg-slate-50/20 border-t border-slate-50 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
          <span>{materials?.length || 0} Sumber Daya Dikelola</span>
          <span>Standar Akademik PTKI Medan</span>
        </div>
      </div>
    </div>
  );
}
