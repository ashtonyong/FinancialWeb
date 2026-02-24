import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const q = request.nextUrl.searchParams.get('q');
    if (!q) return NextResponse.json({ quotes: [] });

    try {
        const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=8&newsCount=0&enableFuzzyQuery=false&quotesQueryId=tss_match_phrase_query`;
        const res = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
        });
        const data = await res.json();
        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ quotes: [] });
    }
}
