"use client";

import useSWR from 'swr';
import SectionLabel from '@/components/ui/SectionLabel';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function MarketBreadth() {
    const { data: breadthData } = useSWR('/api/fmp?endpoint=breadth', fetcher, { refreshInterval: 60000 });

    // FMP returns array — take first element
    const breadth = Array.isArray(breadthData) ? breadthData[0] : breadthData;

    const advancing = breadth?.advancing ?? breadth?.advancingStocks ?? null;
    const declining = breadth?.declining ?? breadth?.decliningStocks ?? null;
    const unchanged = breadth?.unchanged ?? null;
    const newHighs = breadth?.new52WeekHigh ?? breadth?.newHigh ?? null;
    const newLows = breadth?.new52WeekLow ?? breadth?.newLow ?? null;
    const aboveMA50 = breadth?.stocksAboveMA50 ?? breadth?.aboveMA50 ?? null;

    // Get VIX from the shared index strip quotes (pass as prop or use SWR key)
    const { data: vixData } = useSWR('/api/yahoo?symbols=^VIX', fetcher, { refreshInterval: 15000 });
    const vixQuote = vixData?.quoteResponse?.result?.[0];
    const vix = vixQuote?.regularMarketPrice;
    const vixChange = vixQuote?.regularMarketChangePercent;

    const stats = [
        { label: 'ADVANCING', value: advancing, color: advancing ? '#00D4AA' : '#F0F0F0' },
        { label: 'DECLINING', value: declining, color: declining ? '#FF4D4D' : '#F0F0F0' },
        { label: 'UNCHANGED', value: unchanged, color: '#F0F0F0' },
        { label: 'NEW 52W HI', value: newHighs, color: '#F0F0F0' },
        { label: 'NEW 52W LO', value: newLows, color: '#F0F0F0' },
        { label: 'ABOVE MA50', value: aboveMA50 != null ? `${aboveMA50.toFixed(1)}%` : null, color: '#F0F0F0' },
    ];

    return (
        <div className="flex flex-col h-full bg-[var(--bg-surface)]">
            <div className="pt-4 px-4 pb-0 shrink-0">
                <SectionLabel>MARKET BREADTH</SectionLabel>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', padding: '12px' }}>
                {stats.map(({ label, value, color }) => (
                    <div key={label}>
                        <div style={{ fontSize: '18px', fontWeight: 700, color: value != null ? color : '#4B5563' }}>
                            {value != null ? value.toLocaleString?.() ?? value : '—'}
                        </div>
                        <div style={{ fontSize: '10px', color: '#4B5563', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {label}
                        </div>
                    </div>
                ))}
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: '#1E1E1E', margin: '0 12px' }} />

            {/* Bottom row: Put/Call + VIX */}
            <div style={{ display: 'flex', padding: '12px', gap: '16px' }}>
                <div>
                    <span style={{ fontSize: '11px', color: '#4B5563' }}>PUT/CALL RATIO  </span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#F0F0F0' }}>—</span>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                    <span style={{ fontSize: '11px', color: '#4B5563' }}>VIX INDEX  </span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#F0F0F0' }}>
                        {vix != null ? vix.toFixed(2) : '—'}
                    </span>
                    {vixChange != null && (
                        <span style={{ fontSize: '11px', color: vixChange >= 0 ? '#FF4D4D' : '#00D4AA', marginLeft: '4px' }}>
                            {vixChange >= 0 ? '+' : ''}{vixChange.toFixed(2)}%
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
