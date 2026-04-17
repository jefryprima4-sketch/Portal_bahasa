'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface PdfViewerProps {
  url: string;
  title: string;
}

export function PdfViewer({ url, title }: PdfViewerProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-[var(--outline-variant)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
            <span className="material-symbols-outlined text-red-600">picture_as_pdf</span>
          </div>
          <div>
            <h3 className="font-headline font-bold text-lg">{title}</h3>
            <p className="text-xs text-[var(--on-surface-variant)]">Penampil Materi PDF</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.open(url, '_blank')}>
            <span className="material-symbols-outlined text-sm mr-2">open_in_new</span>
            Buka di Tab Baru
          </Button>
        </div>
      </div>

      <Card className="flex-1 min-h-[70vh] relative overflow-hidden bg-slate-100 border-none">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-[var(--on-surface-variant)]">Memuat file PDF...</p>
            </div>
          </div>
        )}
        <iframe
          src={`${url}#toolbar=0&navpanes=0`}
          className="w-full h-full min-h-[70vh] border-none"
          onLoad={() => setIsLoading(false)}
          title={title}
        />
      </Card>
      
      <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex gap-3">
        <span className="material-symbols-outlined text-amber-600 flex-shrink-0">info</span>
        <p className="text-xs text-amber-800 leading-relaxed font-body">
          <strong>Tip:</strong> Anda bisa menggunakan tombol di pojok kanan atas untuk mengunduh materi ini atau mencetaknya jika fitur tersebut diizinkan oleh sistem browser Anda.
        </p>
      </div>
    </div>
  );
}
