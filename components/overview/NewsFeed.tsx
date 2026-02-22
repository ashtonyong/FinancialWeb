"use client";

import useSWR from 'swr';
import SectionLabel from '@/components/ui/SectionLabel';
import Skeleton from '@/components/ui/Skeleton';
import { formatTimeAgo } from '@/lib/formatters';

function getSentimentColor(headline: string) {
    const lower = headline.toLowerCase();
    const positive = ['beat', 'surges', 'record', 'gains', 'rises', 'up', 'higher', 'jumps', 'accelerates'];
    const negative = ['miss', 'drops', 'falls', 'cuts', 'declines', 'down', 'lower', 'plunges', 'slides'];
    if (positive.some(w => lower.includes(w))) return 'bg-[var(--up)]';
    if (negative.some(w => lower.includes(w))) return 'bg-[var(--down)]';
    return 'bg-[#4B5563]';
}

function NewsCard({ article }: { article: any }) {
    const color = getSentimentColor(article.headline);
    const tickers = article.related ? article.related.split(',').slice(0, 3) : [];

    return (
        <a href={article.url} target="_blank" rel="noreferrer" className="block p-3 border-b border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer group">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className="px-1.5 py-0.5 rounded-[2px] bg-[var(--bg-elevated)] border border-[var(--border)] text-[10px] text-[#9CA3AF] uppercase tracking-wide">
                        {article.source}
                    </div>
                    <div className={`w-1.5 h-1.5 rounded-full ${color}`}></div>
                </div>
                <div className="text-[11px] text-[#4B5563]">{formatTimeAgo(article.datetime)}</div>
            </div>

            <div className="text-[13px] text-[#F0F0F0] leading-snug line-clamp-2 mb-2 transition-colors">
                {article.headline}
            </div>

            {tickers.length > 0 && (
                <div className="flex gap-1.5">
                    {tickers.map((t: string) => (
                        <span key={t} className="px-1.5 py-0.5 rounded-[2px] bg-[var(--bg-elevated)] text-[10px] text-[#9CA3AF]">
                            {t}
                        </span>
                    ))}
                </div>
            )}
        </a>
    );
}

export default function NewsFeed() {
    const { data: newsItems } = useSWR('/api/finnhub?endpoint=news&category=general', {
        refreshInterval: 120000, // 2 mins
    });

    return (
        <div className="flex flex-col flex-1 border-b border-[var(--border)] overflow-hidden">
            <div className="p-4 pt-4 pb-2 shrink-0">
                <SectionLabel>NEWS FEED</SectionLabel>
            </div>

            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {!newsItems || newsItems.error || !Array.isArray(newsItems) ? (
                    <div className="p-3">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="mb-4 pb-4 border-b border-[var(--border-subtle)]">
                                <div className="flex justify-between mb-2"><Skeleton width="60px" height="16px" /><Skeleton width="40px" height="12px" /></div>
                                <Skeleton width="100%" height="16px" className="mb-1" />
                                <Skeleton width="80%" height="16px" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        {newsItems.slice(0, 10).map((article: any) => (
                            <NewsCard key={article.id} article={article} />
                        ))}
                        <div className="p-3 text-center text-[11px] text-[var(--accent)] hover:text-[#F0F0F0] cursor-pointer transition-colors font-medium">
                            Load more news
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
