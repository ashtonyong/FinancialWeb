export type BadgeVariant = 'up' | 'down' | 'neutral' | 'warning' | 'live';

interface BadgeProps {
    value?: number | string;
    text?: string;
    variant?: BadgeVariant;
    className?: string;
}

export default function Badge({ value, text, variant, className = '' }: BadgeProps) {
    let finalVariant = variant;
    if (!finalVariant && typeof value === 'number') {
        if (value > 0) finalVariant = 'up';
        else if (value < 0) finalVariant = 'down';
        else finalVariant = 'neutral';
    }

    const baseStyles = "inline-flex items-center rounded-[2px] px-1 py-0.5 text-[10px] whitespace-nowrap font-medium";

    const variantStyles = {
        up: "bg-[var(--up-dim)] text-[var(--up)]",
        down: "bg-[var(--down-dim)] text-[var(--down)]",
        neutral: "bg-[var(--bg-elevated)] text-[#9CA3AF] border border-[var(--border)]",
        warning: "bg-[var(--warning-dim)] text-[var(--warning)]",
        live: "bg-[var(--up-dim)] text-[var(--up)] gap-1"
    };

    const style = finalVariant ? variantStyles[finalVariant] : variantStyles.neutral;

    return (
        <span className={`${baseStyles} ${style} ${className}`}>
            {finalVariant === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-[var(--up)] animate-pulse inline-block"></span>}
            {text || value}
        </span>
    );
}
