import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { StudentAttendanceClient } from './student-attendance-client';

export default async function StudentAttendancePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: enrollments } = await supabase
    .from('course_enroll')
    .select('*, courses (id, title)')
    .eq('student_id', user.id);

  const { data: attendance } = await supabase
    .from('attendance')
    .select('*, courses (title)')
    .eq('student_id', user.id)
    .order('timestamp', { ascending: false });

  // Calculate statistics per course
  const courseStats = enrollments?.map((enroll: any) => {
    const courseId = enroll.course_id;
    const records = attendance?.filter(a => a.course_id === courseId) || [];
    const presenceCount = records.length;
    const percentage = Math.min(Math.round((presenceCount / 14) * 100), 100); // Assuming 14 meetings
    
    return {
      id: courseId,
      title: enroll.courses?.title,
      presenceCount,
      percentage
    };
  }) || [];

  return (
    <div className="p-8 lg:p-12 space-y-12 max-w-7xl mx-auto font-body">
      <StudentAttendanceClient>


      {/* Course Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courseStats.map((stat) => (
          <div key={stat.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-50 whisper-shadow group hover:translate-y-[-4px] transition-all">
            <div className="flex justify-between items-start mb-8">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                    <span className="material-symbols-outlined font-black">fact_check</span>
                </div>
                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${stat.percentage >= 75 ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
                    {stat.percentage >= 75 ? 'Kelayakan: AMAN' : 'Kelayakan: RENDAH'}
                </div>
            </div>

            <h3 className="text-xl font-headline font-black text-slate-800 tracking-tight italic mb-6 line-clamp-1">{stat.title}</h3>

            <div className="space-y-6">
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Kehadiran</p>
                        <p className="text-2xl font-black text-slate-800">{stat.presenceCount} <span className="text-xs text-slate-300">Sesi</span></p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Kelengkapan</p>
                        <p className={`text-2xl font-black ${stat.percentage >= 75 ? 'text-primary' : 'text-orange-600'}`}>{stat.percentage}%</p>
                    </div>
                </div>

                <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                    <div 
                        className={`h-full transition-all duration-1000 ${stat.percentage >= 75 ? 'bg-primary' : 'bg-orange-600'}`}
                        style={{ width: `${stat.percentage}%` }}
                    />
                </div>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest italic opacity-60">Syarat akademik minimum: 75% kehadiran</p>
            </div>
          </div>
        ))}
      </section>

      {/* Detailed Logs Section */}
      <section className="space-y-8">
        <div className="flex items-center justify-between px-2">
            <h4 className="text-2xl font-headline font-black tracking-tight italic text-slate-800">Riwayat Kehadiran</h4>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">10 Catatan Terakhir</span>
        </div>

        <div className="bg-white rounded-[2.5rem] overflow-hidden whisper-shadow border border-slate-50">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50/50 text-[10px] uppercase tracking-widest font-black text-slate-500">
                        <th className="px-8 py-5">Kursus Terdaftar</th>
                        <th className="px-8 py-5">Metode Verifikasi</th>
                        <th className="px-8 py-5">Status</th>
                        <th className="px-8 py-5 text-right">Timestamp</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium">
                    {attendance && attendance.length > 0 ? (
                        attendance.slice(0, 10).map((log: any) => (
                            <tr key={log.id} className="hover:bg-slate-50/30 transition-colors">
                                <td className="px-8 py-5">
                                    <span className="text-sm font-bold text-slate-800">{log.courses?.title}</span>
                                </td>
                                <td className="px-8 py-5">
                                    <span className="text-xs text-slate-400 font-black uppercase tracking-widest italic">
                                        {log.method === 'qr' ? 'Kode QR Dinamis' : 'Verifikasi Staf'}
                                    </span>
                                </td>
                                <td className="px-8 py-5">
                                    <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black rounded-full uppercase tracking-widest">HADIR</span>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <span className="text-xs text-slate-500">
                                        {new Date(log.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={4} className="px-8 py-20 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 font-black">
                                    <span className="material-symbols-outlined text-slate-200 text-3xl">history</span>
                                </div>
                                <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Belum ada catatan kehadiran</p>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            <div className="px-8 py-5 bg-slate-50/20 text-center border-t border-slate-50">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Database Identitas Mahasiswa Terverifikasi</p>
            </div>
        </div>
      </section>
      </StudentAttendanceClient>
    </div>
  );
}

