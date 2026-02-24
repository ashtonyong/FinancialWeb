"use client";

import useSWR from 'swr';
import SectionLabel from '@/components/ui/SectionLabel';

const SECTOR_MAP = [
    { symbol: 'XLK', name: 'Technology' },
    { symbol: 'XLC', name: 'Comm Services' },
    { symbol: 'XLY', name: 'Cons Cyclical' },
    { symbol: 'XLF', name: 'Financial' },
    { symbol: 'XLI', name: 'Industrial' },
    { symbol: 'XLV', name: 'Healthcare' },
    { symbol: 'XLRE', name: 'Real Estate' },
    { symbol: 'XLP', name: 'Cons Defensive' },
    { symbol: 'XLB', name: 'Basic Materials' },
    { symbol: 'XLU', name: 'Utilities' },
    { symbol: 'XLE', name: 'Energy' },
];

const etfSymbols = SECTOR_MAP.map(s => s.symbol).join(',');

export default function SectorPerformance() {
    const { data, error } = useSWR(
        `/api/yahoo?symbols=${etfSymbols}`,
        (url: string) => fetch(url).then(r => r.json()),
        { refreshInterval: 60000, revalidateOnFocus: false }
    );

    const quotesMap: Record<string, number> = {};
    (data?.quoteResponse?.result ?? []).forEach((q: any) => {
        quotesMap[q.symbol] = q.regularMarketChangePercent ?? 0;
    });

    const sectors = SECTOR_MAP
        .map(s => ({ name: s.name, pct: quotesMap[s.symbol] ?? 0 }))
        .sort((a, b) => b.pct - a.pct);

    // Loading skeleton
    if (!data && !error) {
        return (
            <div className="flex flex-col h-full bg-[var(--bg-surface)]">
                <div className="pt-4 px-4 pb-0 shrink-0">
                    <SectionLabel>SECTOR PERFORMANCE</SectionLabel>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <span style={{ fontSize: '12px', color: '#4B5563' }}>Loading sectors...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[var(--bg-surface)]">
            <div className="pt-4 px-4 pb-0 shrink-0">
                <SectionLabel>SECTOR PERFORMANCE</SectionLabel>
            </div>

            <div className="flex-1 overflow-y-auto mt-2 pb-2 hide-scrollbar">
                {sectors.map(({ name, pct }) => {
                    const isPositive = pct >= 0;
                    const absVal = Math.abs(pct);
                    const barWidthPct = Math.min(absVal / 5 * 50, 50);

                    return (
                        <div key={name} style={{ height: '24px', display: 'flex', alignItems: 'center', padding: '0 16px', gap: '8px' }}>
                            {/* Name */}
                            <span style={{ fontSize: '11px', color: '#9CA3AF', width: '108px', flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {name}
                            </span>

                            {/* Bar */}
                            <div style={{ flex: 1, height: '6px', position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <div style={{ position: 'absolute', inset: 0, background: '#1E1E1E', borderRadius: '3px' }} />
                                <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: '#4B5563' }} />
                                <div style={{
                                    position: 'absolute',
                                    top: 0, bottom: 0,
                                    width: `${barWidthPct}%`,
                                    background: isPositive ? '#00D4AA' : '#FF4D4D',
                                    borderRadius: '3px',
                                    left: isPositive ? '50%' : undefined,
                                    right: isPositive ? undefined : '50%',
                                }} />
                            </div>

                            {/* Percentage */}
                            <span style={{
                                fontSize: '11px', width: '52px', textAlign: 'right', flexShrink: 0,
                                color: isPositive ? '#00D4AA' : '#FF4D4D',
                                fontVariantNumeric: 'tabular-nums',
                            }}>
                                {isPositive ? '+' : ''}{pct.toFixed(2)}%
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
