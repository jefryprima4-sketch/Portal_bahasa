'use client';

import { AudioPlayer } from '@/components/quiz/audio-player';
import type { MaterialType, SkillCategory } from '@/lib/supabase/types';

const categoryIcon: Record<SkillCategory, string> = {
    listening: 'headphones',
    reading: 'menu_book',
    writing: 'edit_note',
    technical: 'engineering',
    speaking: 'mic',
};

const categoryLabel: Record<SkillCategory, string> = {
    listening: 'Listening',
    reading: 'Reading',
    writing: 'Writing',
    technical: 'Technical English',
    speaking: 'Speaking',
};

interface MaterialViewerProps {
    type: MaterialType;
    fileUrl: string;
    skillCategory?: SkillCategory | null;
    title: string;
}

export function MaterialViewer({ type, fileUrl, skillCategory, title }: MaterialViewerProps) {
    return (
        <div className="space-y-4">
            {/* Badge kategori */}
            {skillCategory && (
                <div className="flex items-center gap-2">
                    <span
                        className="material-symbols-outlined filled text-base"
                        style={{ color: 'var(--primary)' }}
                    >
                        {categoryIcon[skillCategory]}
                    </span>
                    <span
                        className="text-xs font-medium font-body px-3 py-1 rounded-full"
                        style={{ background: 'var(--primary-fixed)', color: 'var(--on-primary-fixed)' }}
                    >
                        {categoryLabel[skillCategory]}
                    </span>
                </div>
            )}

            {/* Konten berdasarkan tipe */}
            {type === 'pdf' && (
                <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--outline-variant)' }}>
                    <iframe
                        src={fileUrl}
                        className="w-full"
                        style={{ height: '72vh' }}
                        title={`PDF: ${title}`}
                    />
                </div>
            )}

            {type === 'audio' && (
                <AudioPlayer src={fileUrl} maxPlays={99} />
            )}

            {type === 'video' && (
                <div className="rounded-xl overflow-hidden" style={{ background: '#000' }}>
                    <video
                        controls
                        className="w-full max-h-[72vh]"
                        src={fileUrl}
                        title={title}
                    >
                        Browser Anda tidak mendukung video player.
                    </video>
                </div>
            )}
        </div>
    );
}
