"use client";

import useSWR from 'swr';
import { useState } from 'react';
import Skeleton from '@/components/ui/Skeleton';

function getSentiment(headline: string): 'up' | 'down' | 'neutral' {
    const lower = headline.toLowerCase();
    const positive = ['beat', 'surge', 'soar', 'record', 'gain', 'rise', 'rally', 'jump', 'boost', 'up', 'grow', 'profit', 'strong', 'exceed'];
    const negative = ['miss', 'drop', 'fall', 'cut', 'decline', 'loss', 'down', 'weak', 'below', 'concern', 'fear', 'risk', 'slide', 'plunge', 'halt'];
    if (positive.some(w => lower.includes(w))) return 'up';
    if (negative.some(w => lower.includes(w))) return 'down';
    return 'neutral';
}

function timeAgo(unixTimestamp: number): string {
    const seconds = Math.floor(Date.now() / 1000) - unixTimestamp;
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

export default function NewsFeed() {
    const [limit, setLimit] = useState(10);
    const { data: newsItems } = useSWR('/api/finnhub?endpoint=news&category=general', {
        refreshInterval: 120000,
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Section label */}
            <div style={{ padding: '12px 16px 8px', flexShrink: 0 }}>
                <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4B5563' }}>
                    NEWS FEED
                </p>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }} className="hide-scrollbar">
                {!newsItems || newsItems.error || !Array.isArray(newsItems) ? (
                    <div style={{ padding: '12px 16px' }}>
                        {[...Array(5)].map((_, i) => (
                            <div key={i} style={{ marginBottom: '16px', borderBottom: '1px solid #151515', paddingBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <Skeleton width="60px" height="16px" />
                                    <Skeleton width="40px" height="12px" />
                                </div>
                                <Skeleton width="100%" height="16px" className="mb-1" />
                                <Skeleton width="80%" height="16px" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        {newsItems.slice(0, limit).map((item: any) => {
                            const sentiment = getSentiment(item.headline ?? '');
                            const sentimentColor = sentiment === 'up' ? '#00D4AA' : sentiment === 'down' ? '#FF4D4D' : '#4B5563';
                            const relatedTickers = item.related
                                ? item.related.split(',').map((t: string) => t.trim()).filter(Boolean).slice(0, 3)
                                : [];

                            return (
                                <div
                                    key={item.id}
                                    onClick={() => window.open(item.url, '_blank')}
                                    style={{
                                        borderBottom: '1px solid #151515',
                                        padding: '10px 16px',
                                        cursor: 'pointer',
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.background = '#161616')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                >
                                    {/* Row 1: source + sentiment dot + time */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                        <span style={{
                                            fontSize: '10px', color: '#9CA3AF', padding: '1px 5px', borderRadius: '2px',
                                            background: '#161616', border: '1px solid #1E1E1E', flexShrink: 0,
                                        }}>
                                            {item.source?.toUpperCase() ?? 'NEWS'}
                                        </span>
                                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: sentimentColor, flexShrink: 0 }} />
                                        <span style={{ fontSize: '11px', color: '#4B5563', marginLeft: 'auto', flexShrink: 0 }}>
                                            {timeAgo(item.datetime)}
                                        </span>
                                    </div>

                                    {/* Row 2: Headline */}
                                    <p style={{
                                        fontSize: '13px', color: '#F0F0F0', lineHeight: 1.4, marginBottom: '6px',
                                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                    }}>
                                        {item.headline}
                                    </p>

                                    {/* Row 3: Ticker pills */}
                                    {relatedTickers.length > 0 && (
                                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                            {relatedTickers.map((ticker: string) => (
                                                <span
                                                    key={ticker}
                                                    style={{
                                                        fontSize: '10px', color: '#9CA3AF', padding: '1px 5px', borderRadius: '2px',
                                                        background: '#161616', border: '1px solid #1E1E1E',
                                                    }}
                                                >
                                                    {ticker}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Load more */}
                        {limit < newsItems.length && (
                            <button
                                onClick={() => setLimit(l => l + 10)}
                                style={{
                                    width: '100%', padding: '12px', textAlign: 'center',
                                    fontSize: '11px', color: '#4B5563', background: 'none', border: 'none', cursor: 'pointer',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.color = '#9CA3AF')}
                                onMouseLeave={e => (e.currentTarget.style.color = '#4B5563')}
                            >
                                Load more news
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
