export default function SectionLabel({ children, className = '' }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={`text-[11px] uppercase tracking-[0.08em] text-[#4B5563] font-medium ${className}`}>
            {children}
        </div>
    );
}
