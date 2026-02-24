"use client";

import { useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import { createChart, ColorType, CrosshairMode, IChartApi, ISeriesApi, CandlestickSeries, HistogramSeries } from 'lightweight-charts';
import { ChevronDown, CandlestickChart, LineChart, AreaChart, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { INDEX_SYMBOLS } from '@/lib/constants';
import { formatPrice, formatChange } from '@/lib/formatters';

const TIMEFRAMES = [
    { label: '1D', interval: '5m', range: '1d' },
    { label: '5D', interval: '15m', range: '5d' },
    { label: '1M', interval: '1d', range: '1mo' },
    { label: '3M', interval: '1d', range: '3mo' },
    { label: '1Y', interval: '1wk', range: '1y' },
    { label: '5Y', interval: '1mo', range: '5y' },
];

export default function MainChart() {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
    const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

    const [symbol, setSymbol] = useState('^GSPC');
    const [timeframe, setTimeframe] = useState(TIMEFRAMES[0]);
    const [chartType, setChartType] = useState<'candle' | 'line' | 'area'>('candle');
    const [hoverData, setHoverData] = useState<{ time?: string, open?: number, high?: number, low?: number, close?: number, volume?: number }>({});

    const { data: quoteData } = useSWR(`/api/yahoo?symbols=${encodeURIComponent(symbol)}`, {
        refreshInterval: 15000,
    });

    const { data: chartData } = useSWR(`/api/yahoo?symbol=${encodeURIComponent(symbol)}&interval=${timeframe.interval}&range=${timeframe.range}`, {
        refreshInterval: timeframe.label === '1D' ? 30000 : 300000,
    });

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
                textColor: '#4B5563',
            },
            timeScale: {
                borderColor: '#1E1E1E',
                timeVisible: true,
                secondsVisible: false,
            },
            handleScroll: { mouseWheel: true, pressedMouseMove: true },
            handleScale: { axisPressedMouseMove: true, mouseWheel: true, pinch: true },
        });

        const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#00D4AA',
            downColor: '#FF4D4D',
            borderUpColor: '#00D4AA',
            borderDownColor: '#FF4D4D',
            wickUpColor: '#00D4AA',
            wickDownColor: '#FF4D4D',
        });

        const volumeSeries = chart.addSeries(HistogramSeries, {
            color: '#00D4AA',
            priceFormat: { type: 'volume' },
            priceScaleId: '', // set as overlay
        });
        chart.priceScale('').applyOptions({
            scaleMargins: { top: 0.8, bottom: 0 }
        });

        chartRef.current = chart;
        seriesRef.current = candlestickSeries;
        volumeSeriesRef.current = volumeSeries;

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth, height: chartContainerRef.current.clientHeight });
            }
        };

        window.addEventListener('resize', handleResize);

        chart.subscribeCrosshairMove((param) => {
            if (param.time && param.seriesData.get(candlestickSeries)) {
                const data = param.seriesData.get(candlestickSeries) as any;
                const volData = param.seriesData.get(volumeSeries) as any;
                setHoverData({
                    time: String(param.time),
                    open: data.open,
                    high: data.high,
                    low: data.low,
                    close: data.close,
                    volume: volData?.value
                });
            } else {
                setHoverData({});
            }
        });

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, []);

    useEffect(() => {
        if (!chartData || !chartData.chart || !chartData.chart.result) return;
        const result = chartData.chart.result[0];
        const timestamps = result.timestamp;
        const quotes = result.indicators.quote[0];

        if (!timestamps || !seriesRef.current || !volumeSeriesRef.current) return;

        const candleData: any[] = [];
        const volData: any[] = [];

        for (let i = 0; i < timestamps.length; i++) {
            if (quotes.close[i] !== null) {
                const time = timestamps[i];
                const isUp = quotes.close[i] >= quotes.open[i];

                candleData.push({
                    time,
                    open: quotes.open[i],
                    high: quotes.high[i],
                    low: quotes.low[i],
                    close: quotes.close[i],
                });

                volData.push({
                    time,
                    value: quotes.volume[i],
                    color: isUp ? '#00D4AA80' : '#FF4D4D80'
                });
            }
        }

        // Sort by time just in case
        candleData.sort((a, b) => a.time - b.time);
        volData.sort((a, b) => a.time - b.time);

        seriesRef.current.setData(candleData);
        volumeSeriesRef.current.setData(volData);
        chartRef.current?.timeScale().fitContent();

    }, [chartData]);

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
                {/* Index selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#F0F0F0' }}>
                        {INDEX_SYMBOLS.find(s => s.symbol === symbol)?.label || symbol}
                    </span>
                    <ChevronDown size={14} color="#9CA3AF" />
                </div>

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
                    <div style={{ width: '160px', height: '20px', background: '#161616', borderRadius: '4px', animation: 'shimmer 1.5s infinite' }} />
                )}

                {/* Spacer */}
                <div style={{ flex: 1 }} />

                {/* Chart type icons */}
                {[
                    { icon: <CandlestickChart size={16} />, type: 'candle' },
                    { icon: <LineChart size={16} />, type: 'line' },
                    { icon: <AreaChart size={16} />, type: 'area' },
                ].map(({ icon, type }) => (
                    <button
                        key={type}
                        onClick={() => setChartType(type as any)}
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

            {/* CHART CONTAINER AREA */}
            <div className="flex-1 relative w-full h-full min-h-[300px]">
                {/* TOOLTIP OVERLAY */}
                <div className="absolute top-3 left-4 z-10 pointer-events-none flex items-center gap-3">
                    {hoverData.open !== undefined && (
                        <div className="flex items-center text-[12px] whitespace-nowrap">
                            <span className="text-[#9CA3AF] mr-1">O:</span><span className="text-[#F0F0F0] font-mono">{hoverData.open?.toFixed(2)}</span>
                            <span className="text-[#9CA3AF] ml-3 mr-1">H:</span><span className="text-[#F0F0F0] font-mono">{hoverData.high?.toFixed(2)}</span>
                            <span className="text-[#9CA3AF] ml-3 mr-1">L:</span><span className="text-[#F0F0F0] font-mono">{hoverData.low?.toFixed(2)}</span>
                            <span className="text-[#9CA3AF] ml-3 mr-1">C:</span><span className="text-[#F0F0F0] font-mono">{hoverData.close?.toFixed(2)}</span>
                            <span className="text-[#9CA3AF] ml-3 mr-1">V:</span><span className="text-[#F0F0F0] font-mono">{hoverData.volume ? formatPrice(hoverData.volume, symbol) : '--'}</span>
                        </div>
                    )}
                </div>

                {/* ACTUAL CHART */}
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
