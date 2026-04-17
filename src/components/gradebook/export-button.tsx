'use client';

import { Button } from '@/components/ui/button';

interface ExportButtonProps {
  data: any[];
  filename: string;
}

export function GradebookExport({ data, filename }: ExportButtonProps) {
  const handleExport = () => {
    // Header CSV
    const headers = ['Nama', 'NIM', 'Kehadiran (Sesi)', 'Progres Materi (%)', 'Skor Kuis', 'Proctoring (Switches)', 'Tanggal Submit'];
    
    // Baris Data
    const rows = data.map(item => [
      `"${item.name}"`,
      `"${item.nim_nip}"`,
      item.attendanceCount,
      item.progress,
      item.score || '-',
      item.tabSwitches || 0,
      item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : '-'
    ]);


    // Gabungkan
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    // Download logic
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button variant="outline" className="h-10" onClick={handleExport}>
      <span className="material-symbols-outlined text-sm mr-2">download</span>
      Ekspor CSV
    </Button>
  );
}
