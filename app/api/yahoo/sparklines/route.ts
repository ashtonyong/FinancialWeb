import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const symbols = request.nextUrl.searchParams.get('symbols')?.split(',') ?? [];
    const results: Record<string, number[]> = {};

    await Promise.all(symbols.map(async (symbol) => {
        try {
            const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`;
            const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
            const data = await res.json();
            const closes = data?.chart?.result?.[0]?.indicators?.quote?.[0]?.close ?? [];
            results[symbol] = closes.filter(Boolean);
        } catch {
            results[symbol] = [];
        }
    }));

    return NextResponse.json(results);
}
