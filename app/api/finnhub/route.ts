import { NextRequest, NextResponse } from 'next/server';

const FINNHUB_BASE = 'https://finnhub.io/api/v1';
const KEY = process.env.FINNHUB_API_KEY;

export async function GET(request: NextRequest) {
    if (!KEY) {
        console.error('FINNHUB_API_KEY is not set in environment variables');
        return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');
    const category = searchParams.get('category') || 'general';
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    let url = '';
    if (endpoint === 'news') {
        url = `${FINNHUB_BASE}/news?category=${category}&token=${KEY}`;
    } else if (endpoint === 'calendar') {
        if (!from || !to) {
            return NextResponse.json({ error: 'Missing from/to params' }, { status: 400 });
        }
        url = `${FINNHUB_BASE}/calendar/economic?from=${from}&to=${to}&token=${KEY}`;
    } else {
        return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 });
    }

    try {
        const res = await fetch(url, { cache: 'no-store' });
        const data = await res.json();
        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
    }
}
