import { NextRequest, NextResponse } from 'next/server';

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json',
    'Accept-Language': 'en-US,en;q=0.9',
};

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const symbols = searchParams.get('symbols');
    const symbol = searchParams.get('symbol');
    const interval = searchParams.get('interval') || '5m';
    const range = searchParams.get('range') || '1d';

    try {
        if (symbols) {
            const fields = [
                'regularMarketPrice',
                'regularMarketChange',
                'regularMarketChangePercent',
                'regularMarketVolume',
                'regularMarketPreviousClose',
                'regularMarketOpen',
                'regularMarketDayHigh',
                'regularMarketDayLow',
                'shortName',
            ].join(',');
            const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}&fields=${fields}`;
            const res = await fetch(url, { headers: HEADERS, cache: 'no-store' });
            const data = await res.json();
            return NextResponse.json(data);
        }

        if (symbol) {
            const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}`;
            const res = await fetch(url, { headers: HEADERS, cache: 'no-store' });
            const data = await res.json();
            return NextResponse.json(data);
        }

        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    } catch {
        return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
    }
}
