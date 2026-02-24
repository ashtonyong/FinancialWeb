"use client";

import useSWR from 'swr';
import SectionLabel from '@/components/ui/SectionLabel';

const SECTOR_ETFS = [
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

const etfSymbols = SECTOR_ETFS.map(s => s.symbol).join(',');

const MAX_PCT = 5;
const MAX_BAR_WIDTH = 60; // px

export default function SectorPerformance() {
    const { data } = useSWR(
        `/api/yahoo?symbols=${etfSymbols}`,
        (url) => fetch(url).then(r => r.json()),
        { refreshInterval: 60000 }
    );

    // Map response to sector change percents
    const quotes: Record<string, number> = {};
    (data?.quoteResponse?.result ?? []).forEach((q: any) => {
        quotes[q.symbol] = q.regularMarketChangePercent ?? 0;
    });

    // Build sorted sector list
    const sectors = SECTOR_ETFS
        .map(s => ({ name: s.name, changePct: quotes[s.symbol] ?? 0 }))
        .sort((a, b) => b.changePct - a.changePct);

    return (
        <div className="flex flex-col h-full bg-[var(--bg-surface)]">
            <div className="pt-4 px-4 pb-0 shrink-0">
                <SectionLabel>SECTOR PERFORMANCE</SectionLabel>
            </div>

            <div className="flex-1 overflow-y-auto mt-2 pb-2 hide-scrollbar">
                {sectors.map(({ name, changePct }) => {
                    const isUp = changePct >= 0;
                    const barWidth = Math.min(Math.abs(changePct) / MAX_PCT * MAX_BAR_WIDTH, MAX_BAR_WIDTH);

                    return (
                        <div
                            key={name}
                            style={{ height: '24px', display: 'flex', alignItems: 'center', padding: '0 12px', gap: '8px' }}
                        >
                            {/* Sector name */}
                            <span style={{ fontSize: '11px', color: '#9CA3AF', width: '110px', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {name}
                            </span>

                            {/* Bar container */}
                            <div style={{ flex: 1, height: '6px', position: 'relative', background: '#1E1E1E', borderRadius: '3px' }}>
                                {/* Center zero line */}
                                <div style={{
                                    position: 'absolute', left: '50%', top: 0, bottom: 0,
                                    width: '1px', background: '#4B5563', transform: 'translateX(-50%)',
                                }} />
                                {/* Colored bar */}
                                <div style={{
                                    position: 'absolute',
                                    height: '100%',
                                    width: `${barWidth / 2}px`, // half because bar goes from center
                                    background: isUp ? '#00D4AA' : '#FF4D4D',
                                    borderRadius: '3px',
                                    left: isUp ? '50%' : undefined,
                                    right: isUp ? undefined : '50%',
                                }} />
                            </div>

                            {/* Percentage value */}
                            <span style={{
                                fontSize: '11px', width: '48px', textAlign: 'right', flexShrink: 0,
                                color: isUp ? '#00D4AA' : '#FF4D4D',
                            }}>
                                {isUp ? '+' : ''}{changePct.toFixed(2)}%
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
