interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    radius?: string | number;
    className?: string;
}

export default function Skeleton({ width = '100%', height = '100%', radius = '4px', className = '' }: SkeletonProps) {
    return (
        <div
            className={`bg-[linear-gradient(90deg,#161616_0%,#1E1E1E_50%,#161616_100%)] ${className}`}
            style={{
                width,
                height,
                borderRadius: radius,
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite linear'
            }}
        />
    );
}
