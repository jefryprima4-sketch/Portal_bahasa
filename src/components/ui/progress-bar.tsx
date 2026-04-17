interface ProgressBarProps {
    value: number; // 0–100
    label?: string;
    showPercentage?: boolean;
    size?: 'sm' | 'md' | 'lg';
    color?: string;
    className?: string;
}

export function ProgressBar({
    value,
    label,
    showPercentage = true,
    size = 'md',
    color,
    className = '',
}: ProgressBarProps) {
    const clampedValue = Math.min(100, Math.max(0, value));

    const heights: Record<'sm' | 'md' | 'lg', string> = {
        sm: 'h-1.5',
        md: 'h-2.5',
        lg: 'h-4',
    };

    const barColor = color || 'var(--primary)';

    return (
        <div className={`space-y-1 ${className}`}>
            {(label || showPercentage) && (
                <div className="flex items-center justify-between">
                    {label && (
                        <span className="text-sm font-body" style={{ color: 'var(--on-surface-variant)' }}>
                            {label}
                        </span>
                    )}
                    {showPercentage && (
                        <span className="text-sm font-semibold font-body tabular-nums" style={{ color: 'var(--on-surface)' }}>
                            {clampedValue}%
                        </span>
                    )}
                </div>
            )}
            <div
                className={`w-full ${heights[size]} rounded-full overflow-hidden`}
                style={{ background: 'var(--surface-container-high)' }}
                role="progressbar"
                aria-valuenow={clampedValue}
                aria-valuemin={0}
                aria-valuemax={100}
            >
                <div
                    className={`${heights[size]} rounded-full transition-all duration-500 ease-out`}
                    style={{
                        width: `${clampedValue}%`,
                        background: barColor,
                    }}
                />
            </div>
        </div>
    );
}
