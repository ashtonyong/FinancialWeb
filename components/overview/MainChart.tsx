"use client";

import { useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import { createChart, ColorType, CrosshairMode, IChartApi, CandlestickSeries, HistogramSeries } from 'lightweight-charts';
import { ChevronDown, CandlestickChart, LineChart, AreaChart, Plus, ArrowUpRight, ArrowDownRight, Search } from 'lucide-react';
import { INDEX_SYMBOLS } from '@/lib/constants';

const TIMEFRAMES = [
    { label: '1D', interval: '5m', range: '1d' },
    { label: '5D', interval: '15m', range: '5d' },
    { label: '1M', interval: '1d', range: '1mo' },
    { label: '3M', interval: '1d', range: '3mo' },
    { label: '1Y', interval: '1wk', range: '1y' },
    { label: '5Y', interval: '1mo', range: '5y' },
];

const INDEX_LABELS: Record<string, string> = {};
INDEX_SYMBOLS.forEach(s => { INDEX_LABELS[s.symbol] = s.label; });

const QUICK_INDICES = [
    { symbol: '^GSPC', label: 'S&P 500' },
    { symbol: '^IXIC', label: 'NASDAQ' },
    { symbol: '^DJI', label: 'DOW' },
    { symbol: '^RUT', label: 'Russell 2000' },
    { symbol: '^VIX', label: 'VIX' },
    { symbol: 'BTC-USD', label: 'BTC/USD' },
    { symbol: 'GC=F', label: 'Gold' },
    { symbol: 'CL=F', label: 'WTI Oil' },
];

function formatTimeForChart(unixSeconds: number, interval: string): number | string {
    const isIntraday = ['5m', '15m', '30m', '1h'].includes(interval);
    if (isIntraday) {
        return unixSeconds;
    }
    const d = new Date(unixSeconds * 1000);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

interface MainChartProps {
    symbol: string;
    onSymbolChange: (symbol: string) => void;
}

export default function MainChart({ symbol, onSymbolChange }: MainChartProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const candleSeriesRef = useRef<any>(null);
    const volumeSeriesRef = useRef<any>(null);

    const [timeframe, setTimeframe] = useState(TIMEFRAMES[0]);
    const [chartType, setChartType] = useState<'candle' | 'line' | 'area'>('candle');
    const [hoverData, setHoverData] = useState<{ time?: string, open?: number, high?: number, low?: number, close?: number, volume?: number }>({});

    // Symbol search state
    const [showSymbolSearch, setShowSymbolSearch] = useState(false);
    const [symbolQuery, setSymbolQuery] = useState('');
    const [symbolResults, setSymbolResults] = useState<any[]>([]);

    // Fetch quote for header
    const { data: quoteData } = useSWR(`/api/yahoo?symbols=${encodeURIComponent(symbol)}`, {
        refreshInterval: 15000,
    });

    // Fetch chart data
    const { data: chartData } = useSWR(`/api/yahoo?symbol=${encodeURIComponent(symbol)}&interval=${timeframe.interval}&range=${timeframe.range}`, {
        refreshInterval: timeframe.label === '1D' ? 30000 : 300000,
    });

    // Symbol search debounce
    useEffect(() => {
        if (symbolQuery.length < 1) {
            setSymbolResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(`/api/yahoo/search?q=${encodeURIComponent(symbolQuery)}`);
                const data = await res.json();
                setSymbolResults(data.quotes?.slice(0, 8) ?? []);
            } catch {
                setSymbolResults([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [symbolQuery]);

    // Create chart once
    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: '#0A0A0A' },
                textColor: '#4B5563',
                fontSize: 11,
                fontFamily: 'Inter',
            },
            grid: {
                vertLines: { color: '#1E1E1E', style: 1 },
                horzLines: { color: '#1E1E1E', style: 1 },
            },
            crosshair: {
                mode: CrosshairMode.Normal,
                vertLine: { color: '#4B5563', labelBackgroundColor: '#161616' },
                horzLine: { color: '#4B5563', labelBackgroundColor: '#161616' },
            },
            rightPriceScale: {
                borderColor: '#1E1E1E',
            },
            timeScale: {
                borderColor: '#1E1E1E',
                timeVisible: true,
                secondsVisible: false,
            },
            handleScroll: { mouseWheel: true, pressedMouseMove: true },
            handleScale: { axisPressedMouseMove: true, mouseWheel: true, pinch: true },
        });

        chartRef.current = chart;

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth, height: chartContainerRef.current.clientHeight });
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, []);

    // Update chart data when chartData or timeframe changes
    useEffect(() => {
        if (!chartRef.current || !chartData?.chart?.result?.[0]) return;

        const chart = chartRef.current;
        const result = chartData.chart.result[0];
        const timestamps: number[] = result.timestamp ?? [];
        const quote = result.indicators?.quote?.[0] ?? {};
        const opens: number[] = quote.open ?? [];
        const highs: number[] = quote.high ?? [];
        const lows: number[] = quote.low ?? [];
        const closes: number[] = quote.close ?? [];
        const volumes: number[] = quote.volume ?? [];

        // Remove old series
        if (candleSeriesRef.current) {
            try { chart.removeSeries(candleSeriesRef.current); } catch { /* ignore */ }
            candleSeriesRef.current = null;
        }
        if (volumeSeriesRef.current) {
            try { chart.removeSeries(volumeSeriesRef.current); } catch { /* ignore */ }
            volumeSeriesRef.current = null;
        }

        // Build candle data
        const candleData = timestamps
            .map((t, i) => ({
                time: formatTimeForChart(t, timeframe.interval) as any,
                open: opens[i],
                high: highs[i],
                low: lows[i],
                close: closes[i],
            }))
            .filter(c => c.open != null && c.high != null && c.low != null && c.close != null);

        // Build volume data
        const volData = timestamps
            .map((t, i) => ({
                time: formatTimeForChart(t, timeframe.interval) as any,
                value: volumes[i] ?? 0,
                color: (closes[i] ?? 0) >= (opens[i] ?? 0) ? 'rgba(0,212,170,0.4)' : 'rgba(255,77,77,0.4)',
            }))
            .filter(v => v.value > 0);

        // Add new series
        const candleSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#00D4AA',
            downColor: '#FF4D4D',
            borderUpColor: '#00D4AA',
            borderDownColor: '#FF4D4D',
            wickUpColor: '#00D4AA',
            wickDownColor: '#FF4D4D',
        });
        candleSeries.setData(candleData);
        candleSeriesRef.current = candleSeries;

        const volumeSeries = chart.addSeries(HistogramSeries, {
            color: '#00D4AA',
            priceFormat: { type: 'volume' },
            priceScaleId: '',
        });
        chart.priceScale('').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
        volumeSeries.setData(volData);
        volumeSeriesRef.current = volumeSeries;

        // Subscribe crosshair
        chart.subscribeCrosshairMove((param) => {
            if (param.time && param.seriesData.get(candleSeries)) {
                const data = param.seriesData.get(candleSeries) as any;
                const vData = param.seriesData.get(volumeSeries) as any;
                setHoverData({
                    time: String(param.time),
                    open: data.open,
                    high: data.high,
                    low: data.low,
                    close: data.close,
                    volume: vData?.value,
                });
            } else {
                setHoverData({});
            }
        });

        chart.timeScale().fitContent();

    }, [chartData, timeframe.interval]);

    const quote = quoteData?.quoteResponse?.result?.[0];
    const currentPrice = quote?.regularMarketPrice;
    const priceChange = quote?.regularMarketChange;
    const priceChangePct = quote?.regularMarketChangePercent;
    const isUp = (priceChange ?? 0) >= 0;

    return (
        <div className="flex-1 flex flex-col bg-[var(--bg-base)] h-full w-full overflow-hidden">

            {/* CHART HEADER */}
            <div style={{
                height: '44px', background: '#111111', borderBottom: '1px solid #1E1E1E',
                padding: '0 16px', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0,
            }}>
                {/* Symbol selector with dropdown */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowSymbolSearch(v => !v)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            background: 'none', border: 'none', cursor: 'pointer',
                            padding: '4px 8px', borderRadius: '4px', color: '#F0F0F0',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#161616')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                        <span style={{ fontSize: '14px', fontWeight: 600 }}>
                            {INDEX_LABELS[symbol] ?? symbol}
                        </span>
                        <ChevronDown size={14} color="#9CA3AF" />
                    </button>

                    {showSymbolSearch && (
                        <div style={{
                            position: 'absolute', top: '36px', left: 0,
                            width: '280px', background: '#161616',
                            border: '1px solid #1E1E1E', borderRadius: '6px',
                            zIndex: 100, overflow: 'hidden',
                        }}>
                            <div style={{ padding: '8px', borderBottom: '1px solid #1E1E1E' }}>
                                <div style={{ position: 'relative' }}>
                                    <Search size={12} color="#4B5563" style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)' }} />
                                    <input
                                        autoFocus
                                        value={symbolQuery}
                                        onChange={e => setSymbolQuery(e.target.value)}
                                        placeholder="Search any symbol..."
                                        style={{
                                            width: '100%', height: '32px', background: '#0A0A0A',
                                            border: '1px solid #1E1E1E', borderRadius: '4px',
                                            paddingLeft: '28px', paddingRight: '10px', fontSize: '13px', color: '#F0F0F0', outline: 'none',
                                        }}
                                        onFocus={e => (e.target.style.borderColor = '#00D4AA')}
                                        onBlur={e => (e.target.style.borderColor = '#1E1E1E')}
                                    />
                                </div>
                            </div>

                            {/* Quick indices when empty */}
                            {symbolQuery.length === 0 && (
                                <div>
                                    <div style={{ padding: '6px 12px 4px', fontSize: '10px', color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                        INDICES
                                    </div>
                                    {QUICK_INDICES.map(item => (
                                        <div
                                            key={item.symbol}
                                            onClick={() => {
                                                onSymbolChange(item.symbol);
                                                setShowSymbolSearch(false);
                                                setSymbolQuery('');
                                            }}
                                            style={{
                                                padding: '8px 12px', cursor: 'pointer', display: 'flex',
                                                alignItems: 'center', gap: '8px',
                                                background: symbol === item.symbol ? 'rgba(0,212,170,0.08)' : 'transparent',
                                            }}
                                            onMouseEnter={e => (e.currentTarget.style.background = '#1E1E1E')}
                                            onMouseLeave={e => (e.currentTarget.style.background = symbol === item.symbol ? 'rgba(0,212,170,0.08)' : 'transparent')}
                                        >
                                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#F0F0F0', width: '72px' }}>{item.label}</span>
                                            <span style={{ fontSize: '11px', color: '#4B5563' }}>{item.symbol}</span>
                                            {symbol === item.symbol && <span style={{ marginLeft: 'auto', fontSize: '10px', color: '#00D4AA' }}>✓</span>}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Search results */}
                            {symbolResults.length > 0 && (
                                <div>
                                    {symbolResults.map((r: any) => (
                                        <div
                                            key={r.symbol}
                                            onClick={() => {
                                                onSymbolChange(r.symbol);
                                                setShowSymbolSearch(false);
                                                setSymbolQuery('');
                                            }}
                                            style={{ padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                            onMouseEnter={e => (e.currentTarget.style.background = '#1E1E1E')}
                                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                        >
                                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#F0F0F0', width: '72px' }}>{r.symbol}</span>
                                            <span style={{ fontSize: '11px', color: '#9CA3AF', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.shortname}</span>
                                            <span style={{ fontSize: '10px', color: '#4B5563' }}>{r.exchDisp}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {symbolQuery.length > 0 && symbolResults.length === 0 && (
                                <div style={{ padding: '16px 12px', fontSize: '12px', color: '#4B5563', textAlign: 'center' }}>
                                    No results for &ldquo;{symbolQuery}&rdquo;
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Close backdrop */}
                {showSymbolSearch && (
                    <div
                        style={{ position: 'fixed', inset: 0, zIndex: 99 }}
                        onClick={() => { setShowSymbolSearch(false); setSymbolQuery(''); }}
                    />
                )}

                {/* Live price */}
                {currentPrice != null ? (
                    <>
                        <span style={{ fontSize: '20px', fontWeight: 700, color: '#F0F0F0' }}>
                            {currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span style={{ fontSize: '13px', color: isUp ? '#00D4AA' : '#FF4D4D', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                            {isUp ? '+' : ''}{priceChange?.toFixed(2)} ({isUp ? '+' : ''}{priceChangePct?.toFixed(2)}%)
                        </span>
                    </>
                ) : (
                    <div className="skeleton" style={{ width: '160px', height: '20px' }} />
                )}

                <div style={{ flex: 1 }} />

                {/* Chart type icons */}
                {[
                    { icon: <CandlestickChart size={16} />, type: 'candle' as const },
                    { icon: <LineChart size={16} />, type: 'line' as const },
                    { icon: <AreaChart size={16} />, type: 'area' as const },
                ].map(({ icon, type }) => (
                    <button
                        key={type}
                        onClick={() => setChartType(type)}
                        style={{
                            width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: chartType === type ? 'rgba(0,212,170,0.08)' : 'transparent',
                            border: '1px solid', borderColor: chartType === type ? '#00D4AA' : 'transparent',
                            borderRadius: '4px', cursor: 'pointer',
                            color: chartType === type ? '#00D4AA' : '#9CA3AF',
                        }}
                    >
                        {icon}
                    </button>
                ))}
            </div>

            {/* TIMEFRAME TABS */}
            <div className="h-9 px-4 border-b border-[var(--border)] flex items-center gap-4 shrink-0">
                {TIMEFRAMES.map((tf) => (
                    <button
                        key={tf.label}
                        onClick={() => setTimeframe(tf)}
                        className={`h-full text-[12px] font-medium relative transition-colors ${timeframe.label === tf.label ? 'text-[#F0F0F0]' : 'text-[#9CA3AF] hover:text-[#F0F0F0]'}`}
                    >
                        {tf.label}
                        {timeframe.label === tf.label && <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-[var(--accent)]"></div>}
                    </button>
                ))}
            </div>

            {/* CHART CONTAINER */}
            <div className="flex-1 relative w-full h-full min-h-[300px]">
                {/* OHLCV overlay */}
                <div className="absolute top-3 left-4 z-10 pointer-events-none flex items-center gap-3">
                    {hoverData.open !== undefined && (
                        <div className="flex items-center text-[12px] whitespace-nowrap">
                            <span className="text-[#9CA3AF] mr-1">O:</span><span className="text-[#F0F0F0] font-mono">{hoverData.open?.toFixed(2)}</span>
                            <span className="text-[#9CA3AF] ml-3 mr-1">H:</span><span className="text-[#F0F0F0] font-mono">{hoverData.high?.toFixed(2)}</span>
                            <span className="text-[#9CA3AF] ml-3 mr-1">L:</span><span className="text-[#F0F0F0] font-mono">{hoverData.low?.toFixed(2)}</span>
                            <span className="text-[#9CA3AF] ml-3 mr-1">C:</span><span className="text-[#F0F0F0] font-mono">{hoverData.close?.toFixed(2)}</span>
                            <span className="text-[#9CA3AF] ml-3 mr-1">V:</span><span className="text-[#F0F0F0] font-mono">{hoverData.volume ? (hoverData.volume / 1e6).toFixed(1) + 'M' : '--'}</span>
                        </div>
                    )}
                </div>
                <div ref={chartContainerRef} className="absolute inset-0 w-full h-full" />
            </div>

            {/* CHART FOOTER */}
            <div className="h-8 border-t border-[var(--border)] px-3 flex items-center justify-between shrink-0">
                <button className="flex items-center gap-1.5 text-[11px] text-[#4B5563] hover:text-[#F0F0F0] transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Indicator</span>
                </button>
                <span className="text-[10px] text-[#4B5563]">Data: Yahoo Finance</span>
            </div>

        </div>
    );
}
