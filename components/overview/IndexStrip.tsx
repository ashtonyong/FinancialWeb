"use client";

import useSWR from 'swr';
import Badge from '@/components/ui/Badge';
import Sparkline from '@/components/ui/Sparkline';
import Skeleton from '@/components/ui/Skeleton';
import { INDEX_SYMBOLS } from '@/lib/constants';
import { formatPrice } from '@/lib/formatters';

const symbolsQuery = INDEX_SYMBOLS.map(s => s.symbol).join(',');

function IndexPill({ symbol, label, quote }: { symbol: string, label: string, quote?: any }) {
    // Fetch sparkline data independently
    const { data: chartData } = useSWR(`/api/yahoo?symbol=${encodeURIComponent(symbol)}&interval=1d&range=5d`, {
        refreshInterval: 60000,
    });

    let sparklineData: number[] = [];
    if (chartData && chartData.chart && chartData.chart.result && chartData.chart.result[0]) {
        const result = chartData.chart.result[0];
        if (result.indicators.quote[0].close) {
            sparklineData = result.indicators.quote[0].close.filter((v: number | null) => v !== null);
        }
    }

    if (!quote) {
        return (
            <div className="flex items-center min-w-[164px] h-full px-3 border-r border-[var(--border)] shrink-0 justify-between">
                <div className="flex flex-col gap-1 w-[60px]">
                    <Skeleton width="40px" height="10px" />
                    <Skeleton width="50px" height="14px" />
                </div>
                <Skeleton width="30px" height="16px" radius="2px" />
                <Skeleton width="48px" height="18px" />
            </div>
        );
    }

    const price = quote.regularMarketPrice;
    const changePercent = quote.regularMarketChangePercent;

    return (
        <div className="flex items-center gap-2 min-w-[164px] h-full px-3 border-r border-[var(--border)] shrink-0">
            <div className="flex flex-col justify-center w-[60px]">
                <div className="text-[11px] uppercase text-[#4B5563] leading-none mb-1.5 truncate">{label}</div>
                <div className="text-[15px] font-semibold text-[#F0F0F0] leading-none tracking-tight">
                    {formatPrice(price, symbol)}
                </div>
            </div>
            <Badge value={changePercent} text={`${changePercent > 0 ? '+' : ''}${changePercent?.toFixed(2)}%`} className="shrink-0 ml-1" />
            <div className="ml-auto flex items-center shrink-0">
                <Sparkline data={sparklineData} width={48} height={18} />
            </div>
        </div>
    );
}

export default function IndexStrip() {
    const { data } = useSWR(`/api/yahoo?symbols=${encodeURIComponent(symbolsQuery)}`, {
        refreshInterval: 15000,
    });

    const quotesMap = new Map<string, any>();
    if (data?.quoteResponse?.result) {
        data.quoteResponse.result.forEach((q: any) => {
            quotesMap.set(q.symbol, q);
        });
    }

    return (
        <div className="h-12 bg-[var(--bg-surface)] border-b border-[var(--border)] overflow-x-auto flex shrink-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {INDEX_SYMBOLS.map((item) => (
                <IndexPill
                    key={item.symbol}
                    symbol={item.symbol}
                    label={item.label}
                    quote={quotesMap.get(item.symbol)}
                />
            ))}
        </div>
    );
}
