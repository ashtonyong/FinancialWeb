import { NextRequest, NextResponse } from 'next/server';

const FMP_BASE = 'https://financialmodelingprep.com/api/v3';
const FMP_KEY = 'demo'; // Free demo key works for these endpoints

const ENDPOINTS: Record<string, string> = {
    gainers: `${FMP_BASE}/stock_market/gainers?apikey=${FMP_KEY}`,
    losers: `${FMP_BASE}/stock_market/losers?apikey=${FMP_KEY}`,
    breadth: `${FMP_BASE}/market-breadth?apikey=${FMP_KEY}`,
};

export async function GET(request: NextRequest) {
    const endpoint = new URL(request.url).searchParams.get('endpoint');
    if (!endpoint || !ENDPOINTS[endpoint]) {
        return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 });
    }
    try {
        const res = await fetch(ENDPOINTS[endpoint], { next: { revalidate: 60 } });
        const data = await res.json();
        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
    }
}
