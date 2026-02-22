import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const symbols = searchParams.get('symbols');
    const symbol = searchParams.get('symbol');
    const interval = searchParams.get('interval') || '5m';
    const range = searchParams.get('range') || '1d';

    try {
        if (symbols) {
            // Batch quotes
            const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketVolume,regularMarketPreviousClose,shortName,regularMarketOpen,regularMarketDayHigh,regularMarketDayLow`;
            const res = await fetch(url, {
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            const data = await res.json();
            return NextResponse.json(data);
        }

        if (symbol) {
            // Historical chart data
            const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`;
            const res = await fetch(url, {
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            const data = await res.json();
            return NextResponse.json(data);
        }

        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
    }
}
