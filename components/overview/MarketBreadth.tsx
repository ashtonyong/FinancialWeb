"use client";

import useSWR from 'swr';
import Skeleton from '@/components/ui/Skeleton';

export default function MarketBreadth() {
    const { data: breadthData } = useSWR('/api/fmp?endpoint=breadth', {
        refreshInterval: 60000,
    });

    const { data: vixData } = useSWR('/api/fred?series_id=VIXCLS', {
        refreshInterval: 360000, // 6 min
    });

    const advancing = breadthData?.[0]?.advancing;
    const declining = breadthData?.[0]?.declining;
    const unchanged = breadthData?.[0]?.unchanged;
    const newHighs = breadthData?.[0]?.new52WeekHigh;
    const newLows = breadthData?.[0]?.new52WeekLow;

    const vixValue = vixData?.observations?.[0]?.value ? parseFloat(vixData.observations[0].value) : null;

    return (
        <div className="flex-1 bg-[var(--bg-surface)] border border-[var(--border)] rounded-[6px] flex flex-col overflow-hidden">

            {/* HEADER */}
            <div className="h-9 px-3 border-b border-[var(--border)] flex items-center justify-between shrink-0">
                <span className="text-[12px] font-semibold text-[#F0F0F0] uppercase tracking-wide">Market Breadth</span>
                <div className="px-1.5 py-0.5 rounded-[2px] bg-[var(--bg-elevated)] border border-[var(--border)] text-[10px] text-[#9CA3AF]">
                    NYSE + NASDAQ
                </div>
            </div>

            {/* STATS GRID */}
            <div className="grid grid-cols-3 gap-2 p-3">
                {/* ROW 1 */}
                <div className="flex flex-col">
                    <span className="text-[10px] text-[#4B5563] uppercase tracking-[0.08em] mb-0.5">Advancing</span>
                    {advancing ? <span className="text-[20px] font-bold text-[var(--up)] leading-none">{advancing.toLocaleString()}</span> : <Skeleton width="60px" height="20px" />}
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] text-[#4B5563] uppercase tracking-[0.08em] mb-0.5">Declining</span>
                    {declining ? <span className="text-[20px] font-bold text-[var(--down)] leading-none">{declining.toLocaleString()}</span> : <Skeleton width="60px" height="20px" />}
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] text-[#4B5563] uppercase tracking-[0.08em] mb-0.5">Unchanged</span>
                    {unchanged !== undefined ? <span className="text-[20px] font-bold text-[#F0F0F0] leading-none">{unchanged.toLocaleString()}</span> : <Skeleton width="60px" height="20px" />}
                </div>

                {/* ROW 2 */}
                <div className="flex flex-col mt-2">
                    <span className="text-[10px] text-[#4B5563] uppercase tracking-[0.08em] mb-0.5">New Highs</span>
                    {newHighs !== undefined ? <span className="text-[20px] font-bold text-[#F0F0F0] leading-none">{newHighs.toLocaleString()}</span> : <Skeleton width="40px" height="20px" />}
                </div>
                <div className="flex flex-col mt-2">
                    <span className="text-[10px] text-[#4B5563] uppercase tracking-[0.08em] mb-0.5">New Lows</span>
                    {newLows !== undefined ? <span className="text-[20px] font-bold text-[#F0F0F0] leading-none">{newLows.toLocaleString()}</span> : <Skeleton width="40px" height="20px" />}
                </div>
                <div className="flex flex-col mt-2">
                    <span className="text-[10px] text-[#4B5563] uppercase tracking-[0.08em] mb-0.5">Above 50 MA</span>
                    {/* Missing from FMP free tier demo often, fallback to N/A */}
                    <span className="text-[20px] font-bold text-[var(--up)] leading-none">N/A</span>
                </div>
            </div>

            <div className="h-[1px] bg-[var(--border)] w-full mx-3 my-[2px] shrink-0" style={{ width: 'calc(100% - 24px)' }}></div>

            {/* BOTTOM ROW (PUT/CALL, VIX) */}
            <div className="flex items-center justify-between p-3 mt-auto mb-1">
                <div className="flex items-baseline gap-2">
                    <span className="text-[11px] text-[#4B5563] uppercase tracking-[0.08em]">Put/Call Ratio</span>
                    <span className="text-[14px] font-semibold text-[#F0F0F0]">--</span>
                </div>
                <div className="flex items-baseline gap-2 mr-2">
                    <span className="text-[11px] text-[#4B5563] uppercase tracking-[0.08em]">VIX Index</span>
                    {vixValue ? <span className="text-[14px] font-semibold text-[var(--down)]">{vixValue.toFixed(2)}</span> : <Skeleton width="40px" height="16px" />}
                </div>
            </div>

        </div>
    );
}
