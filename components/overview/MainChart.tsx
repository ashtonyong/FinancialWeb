"use client";

import { useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import { createChart, ColorType, CrosshairMode, IChartApi, ISeriesApi, CandlestickSeries, HistogramSeries } from 'lightweight-charts';
import { ChevronDown, CandlestickChart, LineChart, AreaChart, Plus } from 'lucide-react';
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
    const price = quote?.regularMarketPrice;
    const change = quote?.regularMarketChange;
    const changePercent = quote?.regularMarketChangePercent;
    const isUp = changePercent >= 0;

    return (
        <div className="flex-1 flex flex-col bg-[var(--bg-base)] h-full w-full overflow-hidden">

            {/* CHART HEADER */}
            <div className="h-11 bg-[var(--bg-surface)] border-b border-[var(--border)] px-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 cursor-pointer group">
                        <span className="text-[13px] font-bold text-[#F0F0F0]">{INDEX_SYMBOLS.find(s => s.symbol === symbol)?.label || symbol}</span>
                        <ChevronDown className="w-4 h-4 text-[#4B5563] group-hover:text-[#F0F0F0] transition-colors" />
                    </div>

                    <div className="flex items-baseline gap-2">
                        <span className="text-[20px] font-bold text-[#F0F0F0] leading-none">{formatPrice(price, symbol)}</span>
                        <span className={`text-[13px] font-medium leading-none ${isUp ? 'text-[var(--up)]' : 'text-[var(--down)]'}`}>
                            {formatChange(change, changePercent)}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button onClick={() => setChartType('candle')} className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${chartType === 'candle' ? 'bg-[var(--accent-dim)] text-[var(--accent)]' : 'text-[#4B5563] hover:text-[#F0F0F0] hover:bg-[var(--bg-elevated)]'}`}>
                        <CandlestickChart className="w-4 h-4" />
                    </button>
                    <button onClick={() => setChartType('line')} className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${chartType === 'line' ? 'bg-[var(--accent-dim)] text-[var(--accent)]' : 'text-[#4B5563] hover:text-[#F0F0F0] hover:bg-[var(--bg-elevated)]'}`}>
                        <LineChart className="w-4 h-4" />
                    </button>
                    <button onClick={() => setChartType('area')} className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${chartType === 'area' ? 'bg-[var(--accent-dim)] text-[var(--accent)]' : 'text-[#4B5563] hover:text-[#F0F0F0] hover:bg-[var(--bg-elevated)]'}`}>
                        <AreaChart className="w-4 h-4" />
                    </button>
                </div>
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
                            <span className="text-[#9CA3AF] ml-3 mr-1">V:</span><span className="text-[#F0F0F0] font-mono">{hoverData.volume ? formatPrice(hoverData.volume) : '--'}</span>
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
