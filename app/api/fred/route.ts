import { NextRequest, NextResponse } from 'next/server';

const FRED_BASE = 'https://api.stlouisfed.org/fred/series/observations';
const KEY = process.env.FRED_API_KEY;

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const series_id = searchParams.get('series_id');

    if (!series_id) {
        return NextResponse.json({ error: 'Missing series_id' }, { status: 400 });
    }

    const url = `${FRED_BASE}?series_id=${series_id}&api_key=${KEY}&file_type=json&limit=5&sort_order=desc`;

    try {
        const res = await fetch(url, { next: { revalidate: 3600 } });
        const data = await res.json();
        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
    }
}
