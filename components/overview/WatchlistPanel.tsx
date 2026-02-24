"use client";

import useSWR from 'swr';
import { GripVertical, Search, Pencil, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import Sparkline from '@/components/ui/Sparkline';

const DEFAULT_WATCHLIST = ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'TSLA', 'META', 'JPM'];

interface WatchlistPanelProps {
    onSelectSymbol: (symbol: string) => void;
    selectedSymbol: string;
}

export default function WatchlistPanel({ onSelectSymbol, selectedSymbol }: WatchlistPanelProps) {
    const [symbols, setSymbols] = useState<string[]>(DEFAULT_WATCHLIST);
    const [companyNames, setCompanyNames] = useState<Record<string, string>>({
        AAPL: 'Apple Inc.', MSFT: 'Microsoft', NVDA: 'NVIDIA',
        GOOGL: 'Alphabet', AMZN: 'Amazon', TSLA: 'Tesla',
        META: 'Meta', JPM: 'JPMorgan',
    });
    const [gainersActive, setGainersActive] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('flux_watchlist');
        if (saved) setSymbols(JSON.parse(saved));
        const savedNames = localStorage.getItem('flux_watchlist_names');
        if (savedNames) setCompanyNames(prev => ({ ...prev, ...JSON.parse(savedNames) }));
    }, []);

    const symbolsParam = symbols.join(',');

    const { data: quotesData } = useSWR(
        symbolsParam ? `/api/yahoo?symbols=${encodeURIComponent(symbolsParam)}` : null,
        { refreshInterval: 15000 }
    );

    const { data: sparkData } = useSWR(
        symbolsParam ? `/api/yahoo/sparklines?symbols=${encodeURIComponent(symbolsParam)}` : null,
        { refreshInterval: 60000 }
    );

    const { data: gainersData } = useSWR('/api/fmp?endpoint=gainers', { refreshInterval: 60000 });
    const { data: losersData } = useSWR('/api/fmp?endpoint=losers', { refreshInterval: 60000 });

    const quotes: Record<string, any> = {};
    (quotesData?.quoteResponse?.result ?? []).forEach((q: any) => {
        quotes[q.symbol] = q;
    });

    const moversArray = gainersActive ? gainersData : losersData;
    const movers = Array.isArray(moversArray) ? moversArray : [];
    const topMovers = movers.slice(0, 5);

    // Search for new tickers
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.length < 2) {
                setSearchResults([]);
                return;
            }
            try {
                const res = await fetch(`/api/yahoo/search?q=${encodeURIComponent(searchQuery)}`);
                const data = await res.json();
                setSearchResults(data.quotes?.slice(0, 6) ?? []);
            } catch {
                setSearchResults([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const addToWatchlist = (sym: string, name: string) => {
        if (!symbols.includes(sym)) {
            const updated = [...symbols, sym];
            setSymbols(updated);
            localStorage.setItem('flux_watchlist', JSON.stringify(updated));
            const names = { ...companyNames, [sym]: name };
            setCompanyNames(names);
            localStorage.setItem('flux_watchlist_names', JSON.stringify(names));
        }
        setSearchQuery('');
        setSearchResults([]);
    };

    const removeFromWatchlist = (sym: string) => {
        const updated = symbols.filter(s => s !== sym);
        setSymbols(updated);
        localStorage.setItem('flux_watchlist', JSON.stringify(updated));
    };

    // Filter existing list when typing but not searching yet
    const filteredSymbols = searchQuery.length > 0 && searchResults.length === 0
        ? symbols.filter(s =>
            s.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (companyNames[s] ?? '').toLowerCase().includes(searchQuery.toLowerCase())
        )
        : symbols;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

            {/* ── WATCHLIST ── */}
            <div style={{ padding: '16px 16px 0', flexShrink: 0 }}>
                <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4B5563', marginBottom: '8px' }}>
                    WATCHLIST
                </p>
                {/* Search input container */}
                <div style={{ position: 'relative', marginBottom: '4px' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={12} color="#4B5563" style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
                        <input
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search or add ticker..."
                            style={{
                                width: '100%', height: '32px', background: '#161616',
                                border: '1px solid #1E1E1E', borderRadius: '4px',
                                paddingLeft: '28px', paddingRight: '8px',
                                fontSize: '12px', color: '#F0F0F0', outline: 'none',
                            }}
                            onFocus={e => (e.target.style.borderColor = '#00D4AA')}
                            onBlur={e => {
                                e.target.style.borderColor = '#1E1E1E';
                                setTimeout(() => setSearchResults([]), 200);
                            }}
                        />
                    </div>

                    {/* Search results dropdown */}
                    {searchResults.length > 0 && (
                        <div style={{
                            position: 'absolute', top: '36px', left: 0, right: 0,
                            background: '#161616', border: '1px solid #1E1E1E', borderRadius: '4px',
                            zIndex: 50, overflow: 'hidden',
                        }}>
                            {searchResults.map((result: any) => (
                                <div
                                    key={result.symbol}
                                    onMouseDown={() => addToWatchlist(result.symbol, result.shortname ?? result.symbol)}
                                    style={{
                                        padding: '8px 12px', cursor: 'pointer', display: 'flex',
                                        alignItems: 'center', gap: '8px', borderBottom: '1px solid #1E1E1E',
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.background = '#1E1E1E')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#F0F0F0', width: '60px', flexShrink: 0 }}>
                                        {result.symbol}
                                    </span>
                                    <span style={{ fontSize: '11px', color: '#9CA3AF', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {result.shortname ?? ''}
                                    </span>
                                    <span style={{ fontSize: '10px', color: '#4B5563', flexShrink: 0 }}>
                                        {result.exchDisp ?? ''}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Watchlist rows */}
            <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }} className="hide-scrollbar">
                {filteredSymbols.map(sym => {
                    const q = quotes[sym];
                    const price = q?.regularMarketPrice;
                    const changePct = q?.regularMarketChangePercent;
                    const isUp = (changePct ?? 0) >= 0;
                    const sparks = sparkData?.[sym] ?? [];
                    const isSelected = selectedSymbol === sym;

                    return (
                        <div
                            key={sym}
                            onClick={() => onSelectSymbol(sym)}
                            style={{
                                height: '40px', display: 'flex', alignItems: 'center',
                                padding: '0 16px', gap: '6px',
                                borderBottom: '1px solid #151515',
                                cursor: 'pointer',
                                background: isSelected ? 'rgba(0,212,170,0.08)' : 'transparent',
                                borderLeft: isSelected ? '2px solid #00D4AA' : '2px solid transparent',
                            }}
                            onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#161616'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = isSelected ? 'rgba(0,212,170,0.08)' : 'transparent'; }}
                        >
                            <div style={{ flexShrink: 0 }}>
                                <GripVertical size={12} color="#4B5563" style={{ cursor: 'grab' }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '13px', fontWeight: 600, color: '#F0F0F0' }}>{sym}</div>
                                <div style={{ fontSize: '11px', color: '#4B5563', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {companyNames[sym] ?? q?.shortName ?? sym}
                                </div>
                            </div>
                            <span style={{ fontSize: '13px', color: '#F0F0F0', flexShrink: 0, minWidth: '55px', textAlign: 'right', fontWeight: 500 }}>
                                {price != null ? price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}
                            </span>
                            <span style={{
                                fontSize: '10px', padding: '2px 4px', borderRadius: '2px', flexShrink: 0,
                                background: isUp ? 'rgba(0,212,170,0.12)' : 'rgba(255,77,77,0.12)',
                                color: isUp ? '#00D4AA' : '#FF4D4D',
                                width: '50px', textAlign: 'center',
                            }}>
                                {changePct != null ? `${isUp ? '+' : ''}${changePct.toFixed(2)}%` : '—'}
                            </span>
                            <div style={{ flexShrink: 0 }}>
                                <Sparkline data={sparks} width={40} height={18} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Edit Watchlist */}
            <div style={{ padding: '8px 16px', borderBottom: '1px solid #1E1E1E', flexShrink: 0 }}>
                <button style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#4B5563', fontSize: '11px', padding: 0 }}>
                    <Pencil size={11} />
                    Edit Watchlist
                </button>
            </div>

            {/* ── TOP MOVERS ── */}
            <div style={{ flexShrink: 0, padding: '12px 16px 0' }}>
                <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4B5563', marginBottom: '8px' }}>
                    TOP MOVERS
                </p>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '4px' }}>
                    {['Gainers', 'Losers'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setGainersActive(tab === 'Gainers')}
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                fontSize: '12px', padding: '0 0 4px 0',
                                color: (tab === 'Gainers') === gainersActive ? '#F0F0F0' : '#9CA3AF',
                                borderBottom: (tab === 'Gainers') === gainersActive ? '1px solid #00D4AA' : '1px solid transparent',
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ flexShrink: 0, paddingBottom: '8px' }}>
                <div style={{ display: 'flex', padding: '0 16px', height: '28px', alignItems: 'center', borderBottom: '1px solid #151515' }}>
                    <span style={{ fontSize: '10px', color: '#4B5563', width: '20px' }}>#</span>
                    <span style={{ fontSize: '10px', color: '#4B5563', flex: 1 }}>Ticker</span>
                    <span style={{ fontSize: '10px', color: '#4B5563', width: '60px', textAlign: 'right' }}>Change</span>
                    <span style={{ fontSize: '10px', color: '#4B5563', width: '36px', textAlign: 'right' }}>Vol</span>
                </div>

                {topMovers.map((mover: any, i: number) => {
                    const changePct = mover.changesPercentage ?? mover.change ?? 0;
                    const isGainer = gainersActive;
                    return (
                        <div
                            key={mover.symbol ?? i}
                            onClick={() => onSelectSymbol(mover.symbol)}
                            style={{
                                height: '36px', display: 'flex', alignItems: 'center',
                                padding: '0 16px', gap: '4px',
                                borderBottom: '1px solid #151515',
                                cursor: 'pointer',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#161616')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                            <span style={{ fontSize: '11px', color: '#4B5563', width: '20px', flexShrink: 0 }}>{i + 1}</span>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#F0F0F0', flex: 1 }}>{mover.symbol}</span>
                            <span style={{
                                fontSize: '10px', padding: '2px 4px', borderRadius: '2px',
                                background: isGainer ? 'rgba(0,212,170,0.12)' : 'rgba(255,77,77,0.12)',
                                color: isGainer ? '#00D4AA' : '#FF4D4D',
                                width: '60px', textAlign: 'center',
                            }}>
                                {isGainer ? '+' : ''}{typeof changePct === 'number' ? changePct.toFixed(2) : changePct}%
                            </span>
                            <span style={{ fontSize: '11px', color: '#4B5563', width: '36px', textAlign: 'right' }}>
                                {mover.volume ? `${(mover.volume / 1000000).toFixed(1)}M` : '—'}
                            </span>
                        </div>
                    );
                })}

                {topMovers.length === 0 && (
                    <div style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: '#4B5563' }}>
                        Loading movers...
                    </div>
                )}
            </div>
        </div>
    );
}
