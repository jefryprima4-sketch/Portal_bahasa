import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PdfViewer } from '@/components/materials/pdf-viewer';
import { Card, CardContent } from '@/components/ui/card';

export default async function StudentMaterialDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string; materialId: string }> 
}) {
  const { id: courseId, materialId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: material } = await supabase
    .from('materials')
    .select('*, courses (title)')
    .eq('id', materialId)
    .single();
  
  if (material) {
    // Record view asynchronously directly in server component
    const { recordMaterialView } = await import('../../../actions');
    recordMaterialView(courseId, materialId);
  }

  if (!material) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <span className="material-symbols-outlined text-6xl text-[var(--outline)]">find_in_page</span>
        <p className="text-lg font-headline font-bold">Materi tidak ditemukan</p>
        <a href={`/student/courses/${courseId}`}>
          <button className="text-[var(--primary)] hover:underline">Kembali ke Course</button>
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <a href={`/student/courses/${courseId}`} className="text-sm font-body hover:underline flex items-center gap-1" style={{ color: 'var(--primary)' }}>
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Kembali ke {material.courses?.title || 'Course'}
        </a>
      </div>

      {material.type === 'pdf' ? (
        <PdfViewer url={material.file_url} title={material.title} />
      ) : material.type === 'audio' ? (
        <Card className="overflow-hidden border border-[var(--outline-variant)]">
          <CardContent className="p-8 flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-[var(--primary-fixed)]/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-[var(--primary)]">headphones</span>
            </div>
            <div className="text-center">
              <h3 className="font-headline font-bold text-2xl">{material.title}</h3>
              <p className="text-sm text-[var(--on-surface-variant)] mt-1">{material.skill_category || 'Materi Audio'}</p>
            </div>
            <audio controls className="w-full max-w-md">
              <source src={material.file_url} type="audio/mpeg" />
              Browser Anda tidak mendukung pemutar audio.
            </audio>
            <div className="p-4 bg-slate-50 rounded-xl w-full max-w-md text-xs text-[var(--on-surface-variant)] font-body">
              <p className="leading-relaxed">
                <strong>Instruksi:</strong> Dengarkan rekaman audio di atas dengan saksama. Anda dapat memutar ulang bagian tertentu jika diperlukan. Disarankan menggunakan earphone untuk kualitas suara yang lebih baik.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-12 text-center flex flex-col items-center gap-4">
            <span className="material-symbols-outlined text-6xl text-[var(--primary)]">description</span>
            <h3 className="text-xl font-headline font-bold">{material.title}</h3>
            <p className="text-[var(--on-surface-variant)] max-w-sm">Tipe materi ini belum didukung untuk penampil langsung. Silakan unduh file untuk melihat kontennya.</p>
            <a href={material.file_url} download target="_blank" rel="noopener noreferrer">
              <button className="bg-[var(--primary)] text-white px-6 py-2 rounded-lg font-medium hover:bg-[var(--primary-container)] transition-colors">
                Unduh File
              </button>
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
