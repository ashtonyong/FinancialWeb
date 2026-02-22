"use client";

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Search, GripVertical, Pencil } from 'lucide-react';
import SectionLabel from '@/components/ui/SectionLabel';
import Badge from '@/components/ui/Badge';
import Sparkline from '@/components/ui/Sparkline';
import Skeleton from '@/components/ui/Skeleton';
import { DEFAULT_WATCHLIST } from '@/lib/constants';
import { formatPrice, formatVolume } from '@/lib/formatters';

function WatchlistRow({ symbol, quote }: { symbol: string, quote?: any }) {
    const { data: chartData } = useSWR(`/api/yahoo?symbol=${encodeURIComponent(symbol)}&interval=1d&range=5d`, {
        refreshInterval: 60000,
    });

    let sparklineData: number[] = [];
    if (chartData?.chart?.result?.[0]?.indicators?.quote?.[0]?.close) {
        sparklineData = chartData.chart.result[0].indicators.quote[0].close.filter((v: number | null) => v !== null);
    }

    if (!quote) {
        return (
            <div className="flex items-center gap-2 h-10 px-4 border-b border-[var(--border-subtle)]">
                <Skeleton width="12px" height="12px" />
                <div className="flex flex-col flex-1 gap-1">
                    <Skeleton width="40px" height="12px" />
                    <Skeleton width="60px" height="10px" />
                </div>
                <Skeleton width="40px" height="14px" />
                <Skeleton width="30px" height="14px" />
                <Skeleton width="40px" height="18px" />
            </div>
        );
    }

    const changePercent = quote.regularMarketChangePercent || 0;

    return (
        <div className="flex items-center gap-2 h-10 px-4 border-b border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)] transition-colors group">
            <GripVertical className="w-3 h-3 text-[#4B5563] cursor-grab opacity-50 group-hover:opacity-100 shrink-0" strokeWidth={2} />

            <div className="flex flex-col flex-1 min-w-0">
                <span className="text-[13px] font-bold text-[#F0F0F0] leading-tight truncate">{symbol}</span>
                <span className="text-[11px] text-[#4B5563] leading-tight truncate">{quote.shortName || '--'}</span>
            </div>

            <div className="text-[13px] text-[#F0F0F0] text-right min-w-[60px] font-medium tracking-tight">
                {formatPrice(quote.regularMarketPrice)}
            </div>

            <Badge
                value={changePercent}
                text={`${changePercent > 0 ? '+' : ''}${changePercent.toFixed(1)}%`}
                className="w-[42px] justify-center"
            />

            <div className="shrink-0 ml-1">
                <Sparkline data={sparklineData} width={40} height={18} />
            </div>
        </div>
    );
}

function TopMoverRow({ mover, index }: { mover: any, index: number }) {
    return (
        <div className="flex items-center h-9 px-4 border-b border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)] transition-colors">
            <span className="text-[11px] text-[#4B5563] min-w-[16px]">{index + 1}</span>
            <span className="text-[13px] font-bold text-[#F0F0F0] flex-1">{mover.symbol}</span>
            <Badge
                value={mover.changesPercentage}
                text={`${mover.changesPercentage > 0 ? '+' : ''}${mover.changesPercentage.toFixed(1)}%`}
                className="w-[50px] justify-center mr-3"
            />
            <span className="text-[11px] text-[#4B5563] w-[30px] text-right">
                {/* Placeholder for volume vs avg as FMP gainers doesn't directly provide multiplier, we show raw volume formatted */}
                {formatVolume(mover.volume)}
            </span>
        </div>
    );
}

export default function WatchlistPanel() {
    const [symbols, setSymbols] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [moverTab, setMoverTab] = useState<'gainers' | 'losers'>('gainers');

    useEffect(() => {
        const saved = localStorage.getItem('flux_watchlist');
        if (saved) {
            setSymbols(JSON.parse(saved));
        } else {
            setSymbols(DEFAULT_WATCHLIST);
            localStorage.setItem('flux_watchlist', JSON.stringify(DEFAULT_WATCHLIST));
        }
    }, []);

    const { data: quotesData } = useSWR(symbols.length > 0 ? `/api/yahoo?symbols=${symbols.join(',')}` : null, {
        refreshInterval: 15000,
    });

    const { data: moversData } = useSWR(`/api/fmp?endpoint=${moverTab}`, {
        refreshInterval: 60000,
    });

    const quotesMap = new Map<string, any>();
    if (quotesData?.quoteResponse?.result) {
        quotesData.quoteResponse.result.forEach((q: any) => {
            quotesMap.set(q.symbol, q);
        });
    }

    const filteredSymbols = symbols.filter(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const displayMovers = moversData?.slice(0, 5) || [];

    return (
        <div className="w-[280px] shrink-0 h-full bg-[var(--bg-surface)] border-r border-[var(--border)] flex flex-col overflow-hidden">

            {/* WATCHLIST SECTION */}
            <div className="flex flex-col flex-1 overflow-hidden">
                <div className="p-4 pb-2">
                    <SectionLabel>WATCHLIST</SectionLabel>
                    <div className="mt-2 relative flex items-center w-full h-8 bg-[var(--bg-elevated)] border border-[var(--border)] rounded px-2">
                        <Search className="w-3.5 h-3.5 text-[#4B5563]" />
                        <input
                            type="text"
                            placeholder="Search ticker..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-transparent border-none outline-none text-[13px] text-[var(--text-primary)] placeholder-[#4B5563] ml-2"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {symbols.length === 0 ? (
                        <div className="p-4">
                            {[...Array(8)].map((_, i) => <WatchlistRow key={i} symbol="" />)}
                        </div>
                    ) : (
                        filteredSymbols.map(sym => (
                            <WatchlistRow key={sym} symbol={sym} quote={quotesMap.get(sym)} />
                        ))
                    )}

                    <div className="flex items-center gap-2 p-4 text-[#4B5563] hover:text-[#F0F0F0] cursor-pointer transition-colors mt-2">
                        <Pencil className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-medium">Edit Watchlist</span>
                    </div>
                </div>
            </div>

            <div className="h-[1px] bg-[var(--border)] w-full block shrink-0"></div>

            {/* TOP MOVERS SECTION */}
            <div className="flex flex-col h-[260px] shrink-0">
                <div className="pt-4 px-4 pb-0">
                    <SectionLabel>TOP MOVERS</SectionLabel>
                    <div className="flex gap-4 mt-3 border-b border-[var(--border)]">
                        <button
                            onClick={() => setMoverTab('gainers')}
                            className={`pb-2 text-[12px] font-medium relative ${moverTab === 'gainers' ? 'text-[#F0F0F0]' : 'text-[#9CA3AF] hover:text-[#F0F0F0]'}`}
                        >
                            Gainers
                            {moverTab === 'gainers' && <div className="absolute bottom-[-1px] left-0 right-0 h-[1px] bg-[var(--accent)]"></div>}
                        </button>
                        <button
                            onClick={() => setMoverTab('losers')}
                            className={`pb-2 text-[12px] font-medium relative ${moverTab === 'losers' ? 'text-[#F0F0F0]' : 'text-[#9CA3AF] hover:text-[#F0F0F0]'}`}
                        >
                            Losers
                            {moverTab === 'losers' && <div className="absolute bottom-[-1px] left-0 right-0 h-[1px] bg-[var(--accent)]"></div>}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col flex-1 py-1">
                    <div className="flex px-4 py-2 text-[10px] text-[#4B5563] uppercase tracking-wide">
                        <span className="min-w-[16px]">#</span>
                        <span className="flex-1">Ticker</span>
                        <span className="w-[50px] text-center mr-3">Change</span>
                        <span className="w-[30px] text-right">Vol</span>
                    </div>

                    {!moversData ? (
                        [...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center h-9 px-4 border-b border-[var(--border-subtle)]">
                                <Skeleton width="10px" height="10px" />
                                <div className="flex-1 ml-2"><Skeleton width="40px" height="12px" /></div>
                                <Skeleton width="40px" height="16px" className="mr-3" />
                                <Skeleton width="30px" height="10px" />
                            </div>
                        ))
                    ) : (
                        displayMovers.map((mover: any, i: number) => (
                            <TopMoverRow key={mover.symbol} mover={mover} index={i} />
                        ))
                    )}
                </div>
            </div>

        </div>
    );
}
