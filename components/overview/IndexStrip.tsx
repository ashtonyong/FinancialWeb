"use client";

import useSWR from 'swr';
import Sparkline from '@/components/ui/Sparkline';
import { formatPrice } from '@/lib/formatters';

const INDEX_SYMBOLS = [
    { symbol: '^GSPC', label: 'S&P 500' },
    { symbol: '^IXIC', label: 'NASDAQ' },
    { symbol: '^DJI', label: 'DOW' },
    { symbol: '^RUT', label: 'RUSSELL' },
    { symbol: '^VIX', label: 'VIX' },
    { symbol: '^TNX', label: '10Y YLD' },
    { symbol: 'DX-Y.NYB', label: 'DXY' },
    { symbol: 'BTC-USD', label: 'BTC' },
    { symbol: 'GC=F', label: 'GOLD' },
    { symbol: 'CL=F', label: 'OIL' },
];

const symbolsQuery = INDEX_SYMBOLS.map(s => s.symbol).join(',');

export default function IndexStrip() {
    const { data: quoteData } = useSWR(`/api/yahoo?symbols=${encodeURIComponent(symbolsQuery)}`, {
        refreshInterval: 15000,
    });

    const { data: sparkData } = useSWR(`/api/yahoo/sparklines?symbols=${encodeURIComponent(symbolsQuery)}`, {
        refreshInterval: 60000,
    });

    const quotes = quoteData?.quoteResponse?.result ?? [];

    return (
        <div style={{ display: 'flex', height: '100%' }}>
            {INDEX_SYMBOLS.map(({ symbol, label }) => {
                const quote = quotes.find((q: any) => q.symbol === symbol);
                const price = quote?.regularMarketPrice;
                const changePercent = quote?.regularMarketChangePercent;

                return (
                    <div key={symbol} style={{
                        minWidth: '164px',
                        height: '100%',
                        padding: '0 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        borderRight: '1px solid #1E1E1E',
                        flexShrink: 0,
                    }}>
                        {/* Left: stacked label + price */}
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#4B5563', letterSpacing: '0.05em' }}>
                                {label}
                            </span>
                            <span style={{ fontSize: '15px', fontWeight: 600, color: '#F0F0F0', lineHeight: 1.2 }}>
                                {price != null ? formatPrice(price, symbol) : '—'}
                            </span>
                        </div>

                        {/* Center: change badge */}
                        {changePercent != null && (
                            <span style={{
                                fontSize: '10px',
                                padding: '2px 4px',
                                borderRadius: '2px',
                                background: changePercent >= 0 ? 'rgba(0,212,170,0.12)' : 'rgba(255,77,77,0.12)',
                                color: changePercent >= 0 ? '#00D4AA' : '#FF4D4D',
                                whiteSpace: 'nowrap',
                            }}>
                                {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
                            </span>
                        )}

                        {/* Right: sparkline */}
                        <Sparkline data={sparkData?.[symbol] ?? []} width={48} height={18} />
                    </div>
                );
            })}
        </div>
    );
}
