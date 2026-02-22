import { NextRequest, NextResponse } from 'next/server';

const FINNHUB_BASE = 'https://finnhub.io/api/v1';
const KEY = process.env.FINNHUB_API_KEY;

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');
    const category = searchParams.get('category') || 'general';
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    let url = '';
    if (endpoint === 'news') {
        url = `${FINNHUB_BASE}/news?category=${category}&token=${KEY}`;
    } else if (endpoint === 'calendar') {
        url = `${FINNHUB_BASE}/calendar/economic?from=${from}&to=${to}&token=${KEY}`;
    } else {
        return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 });
    }

    try {
        const res = await fetch(url, { next: { revalidate: 120 } });
        const data = await res.json();
        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
    }
}
