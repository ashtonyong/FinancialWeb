interface SparklineProps {
    data: number[];
    width?: number;
    height?: number;
    color?: string;
    className?: string;
}

export default function Sparkline({ data, width = 48, height = 18, color, className = '' }: SparklineProps) {
    if (!data || data.length === 0) return <svg width={width} height={height} className={className} />;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    const isPositive = data[data.length - 1] >= data[0];
    const strokeColor = color || (isPositive ? 'var(--up)' : 'var(--down)');

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className={className}>
            <polyline
                fill="none"
                stroke={strokeColor}
                strokeWidth="1.5"
                points={points}
            />
        </svg>
    );
}
