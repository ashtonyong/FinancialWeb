"use client";

import useSWR from 'swr';
import { SECTOR_ETFS } from '@/lib/constants';
import Skeleton from '@/components/ui/Skeleton';

const sectorSymbols = SECTOR_ETFS.map(s => s.symbol).join(',');

export default function SectorPerformance() {
    const { data } = useSWR(`/api/yahoo?symbols=${encodeURIComponent(sectorSymbols)}`, {
        refreshInterval: 60000,
    });

    const quotesMap = new Map<string, any>();
    if (data?.quoteResponse?.result) {
        data.quoteResponse.result.forEach((q: any) => {
            quotesMap.set(q.symbol, q);
        });
    }

    // Map to desired output and sort by change descending
    const performanceData = SECTOR_ETFS.map(sector => {
        const quote = quotesMap.get(sector.symbol);
        return {
            name: sector.name,
            changePercent: quote ? quote.regularMarketChangePercent : null
        };
    });

    // Sort descending
    performanceData.sort((a, b) => {
        if (a.changePercent === null) return 1;
        if (b.changePercent === null) return -1;
        return b.changePercent - a.changePercent;
    });

    return (
        <div className="flex-1 bg-[var(--bg-surface)] border border-[var(--border)] rounded-[6px] flex flex-col overflow-hidden">

            {/* HEADER */}
            <div className="h-9 px-3 border-b border-[var(--border)] flex items-center justify-between shrink-0">
                <span className="text-[12px] font-semibold text-[#F0F0F0] uppercase tracking-wide">Sector Performance</span>
                <div className="px-1.5 py-0.5 rounded-[2px] bg-[var(--bg-elevated)] border border-[var(--border)] text-[10px] text-[#9CA3AF]">
                    Today
                </div>
            </div>

            {/* ROWS */}
            <div className="flex-1 py-1 flex flex-col justify-around">
                {performanceData.map((item, i) => {
                    if (item.changePercent === null) {
                        return (
                            <div key={i} className="flex items-center h-6 px-3">
                                <span className="text-[11px] text-[#9CA3AF] w-[110px] truncate">{item.name}</span>
                                <div className="flex-1 mx-2 h-[6px] relative">
                                    <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-[var(--border)]"></div>
                                </div>
                                <div className="w-[50px] text-right"><Skeleton width="30px" height="12px" className="float-right" /></div>
                            </div>
                        );
                    }

                    const val = item.changePercent;
                    const isUp = val >= 0;

                    // Max width assumption: ~7% corresponds to 100% of half-bar width
                    // We have ~100px width total, 50px each side.
                    // Let's cap at 5% for full width visual scaling: 5% = 50px
                    const pixelWidth = Math.min(Math.abs(val) * 10, 50);

                    return (
                        <div key={item.name} className="flex items-center h-6 px-3">
                            <span className="text-[11px] text-[#9CA3AF] w-[110px] truncate">{item.name}</span>

                            <div className="flex-1 mx-2 h-[6px] relative flex items-center">
                                <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-[var(--border)] z-10"></div>

                                {/* Bar */}
                                {isUp ? (
                                    <div
                                        className="absolute left-1/2 h-[6px] bg-[var(--up)] rounded-[2px]"
                                        style={{ width: `${pixelWidth}px` }}
                                    ></div>
                                ) : (
                                    <div
                                        className="absolute right-1/2 h-[6px] bg-[var(--down)] rounded-[2px]"
                                        style={{ width: `${pixelWidth}px` }}
                                    ></div>
                                )}
                            </div>

                            <span className={`text-[11px] w-[50px] text-right font-medium tracking-tight ${isUp ? 'text-[var(--up)]' : 'text-[var(--down)]'}`}>
                                {isUp ? '+' : ''}{val.toFixed(1)}%
                            </span>
                        </div>
                    );
                })}
            </div>

        </div>
    );
}
