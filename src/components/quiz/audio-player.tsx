'use client';

import { useEffect, useRef, useState } from 'react';

interface AudioPlayerProps {
    src: string;
    maxPlays?: number;
    onPlayLimitReached?: () => void;
}

export function AudioPlayer({ src, maxPlays = 2, onPlayLimitReached }: AudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playsLeft, setPlaysLeft] = useState(maxPlays);
    const [playCount, setPlayCount] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const onLoadedMetadata = () => setDuration(audio.duration);
        const onTimeUpdate = () => { if (!isDragging) setCurrentTime(audio.currentTime); };
        const onEnded = () => { setIsPlaying(false); setCurrentTime(0); audio.currentTime = 0; };
        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);

        audio.addEventListener('loadedmetadata', onLoadedMetadata);
        audio.addEventListener('timeupdate', onTimeUpdate);
        audio.addEventListener('ended', onEnded);
        audio.addEventListener('play', onPlay);
        audio.addEventListener('pause', onPause);

        return () => {
            audio.removeEventListener('loadedmetadata', onLoadedMetadata);
            audio.removeEventListener('timeupdate', onTimeUpdate);
            audio.removeEventListener('ended', onEnded);
            audio.removeEventListener('play', onPlay);
            audio.removeEventListener('pause', onPause);
        };
    }, [isDragging]);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
        } else {
            if (playsLeft <= 0) {
                onPlayLimitReached?.();
                return;
            }
            // Only increment play count when starting from beginning or it's a new play
            if (audio.currentTime === 0 || audio.ended) {
                const newCount = playCount + 1;
                setPlayCount(newCount);
                setPlaysLeft(maxPlays - newCount);
            }
            audio.play();
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current;
        if (!audio) return;
        const value = Number(e.target.value);
        audio.currentTime = value;
        setCurrentTime(value);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current;
        if (!audio) return;
        const value = Number(e.target.value);
        audio.volume = value;
        setVolume(value);
    };

    const formatTime = (s: number) => {
        if (isNaN(s)) return '0:00';
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m}:${sec.toString().padStart(2, '0')}`;
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
    const limitReached = playsLeft <= 0 && !isPlaying;

    return (
        <div
            className="rounded-2xl p-6 space-y-4"
            style={{
                background: 'var(--surface-container)',
                border: '1px solid var(--outline-variant)',
            }}
        >
            <audio ref={audioRef} src={src} preload="metadata" />

            {/* Play limit indicator */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-xl" style={{ color: 'var(--primary)' }}>
                        headphones
                    </span>
                    <span className="text-sm font-medium font-body" style={{ color: 'var(--on-surface)' }}>
                        Audio Mendengarkan
                    </span>
                </div>
                <div className="flex items-center gap-1.5">
                    {Array.from({ length: maxPlays }).map((_, i) => (
                        <div
                            key={i}
                            className="w-2.5 h-2.5 rounded-full transition-colors"
                            style={{
                                background: i < playsLeft ? 'var(--primary)' : 'var(--outline-variant)',
                            }}
                        />
                    ))}
                    <span className="text-xs font-body ml-1" style={{ color: 'var(--on-surface-variant)' }}>
                        {playsLeft}x tersisa
                    </span>
                </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-1">
                <div className="relative h-2 rounded-full overflow-hidden" style={{ background: 'var(--outline-variant)' }}>
                    <div
                        className="absolute left-0 top-0 h-full rounded-full transition-all"
                        style={{ width: `${progress}%`, background: 'var(--primary)' }}
                    />
                    <input
                        type="range"
                        min={0}
                        max={duration || 1}
                        step={0.1}
                        value={currentTime}
                        onChange={handleSeek}
                        onMouseDown={() => setIsDragging(true)}
                        onMouseUp={() => setIsDragging(false)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                </div>
                <div className="flex justify-between text-xs font-body" style={{ color: 'var(--on-surface-variant)' }}>
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
                {/* Volume */}
                <div className="flex items-center gap-2 w-28">
                    <span className="material-symbols-outlined text-lg" style={{ color: 'var(--on-surface-variant)' }}>
                        {volume === 0 ? 'volume_off' : volume < 0.5 ? 'volume_down' : 'volume_up'}
                    </span>
                    <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-full h-1 rounded-full appearance-none cursor-pointer"
                        style={{ accentColor: 'var(--primary)' }}
                    />
                </div>

                {/* Play / Pause button */}
                <button
                    onClick={togglePlay}
                    disabled={limitReached}
                    className="w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                        background: limitReached ? 'var(--outline-variant)' : 'var(--primary)',
                        color: 'white',
                    }}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                    <span className="material-symbols-outlined filled text-3xl">
                        {isPlaying ? 'pause' : 'play_arrow'}
                    </span>
                </button>

                {/* Spacer untuk balance layout */}
                <div className="w-28" />
            </div>

            {limitReached && (
                <p className="text-center text-sm font-body py-1 rounded-lg" style={{ color: 'var(--error)', background: 'var(--error-container)' }}>
                    Batas putar audio telah habis
                </p>
            )}
        </div>
    );
}
