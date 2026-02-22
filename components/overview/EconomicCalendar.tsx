"use client";

import useSWR from 'swr';
import SectionLabel from '@/components/ui/SectionLabel';
import Skeleton from '@/components/ui/Skeleton';

function getImpactColor(impact: string) {
    if (impact === 'High') return 'bg-[var(--down)] border-l-2 border-[var(--down)] pl-[-2px]';
    if (impact === 'Medium') return 'bg-[var(--warning)] border-l-2 border-[var(--warning)] pl-[-2px]';
    return 'bg-[#4B5563] border-l-2 border-transparent';
}

function CalendarRow({ event }: { event: any }) {
    const actualStr = event.actual !== null && event.actual !== undefined ? event.actual : null;
    const isBeat = event.actual > event.estimate;
    const isMiss = event.actual < event.estimate;

    return (
        <div className={`flex items-center justify-between py-2 border-b border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)] transition-colors pr-2 pl-3 relative`}>
            {/* Decorative left border for impact */}
            <div className="absolute left-0 top-0 bottom-0 w-[2px]" style={{ backgroundColor: event.impact === 'High' ? 'var(--down)' : event.impact === 'Medium' ? 'var(--warning)' : 'transparent' }}></div>

            <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${event.impact === 'High' ? 'bg-[var(--down)]' : event.impact === 'Medium' ? 'bg-[var(--warning)]' : 'bg-[#4B5563]'}`}></div>
                <div className="flex flex-col">
                    <span className="text-[12px] text-[#F0F0F0] leading-tight line-clamp-1 break-words pb-0.5 pr-2">{event.event}</span>
                    <span className="text-[11px] text-[#4B5563]">{event.time ? event.time.substring(0, 5) + ' AM EST' /* mock time map */ : '10:00 AM EST'}</span>
                </div>
            </div>

            <div className="flex flex-col items-end shrink-0 gap-0.5 mt-1">
                {actualStr ? (
                    <span className={`text-[13px] font-bold ${isBeat ? 'text-[var(--up)]' : isMiss ? 'text-[var(--down)]' : 'text-[#F0F0F0]'}`}>{actualStr}</span>
                ) : (
                    <span className="text-[11px] text-[#4B5563]">Exp: {event.estimate ?? '--'}</span>
                )}
                <span className="text-[10px] text-[#4B5563]">Prev: {event.previous ?? '--'}</span>
            </div>
        </div>
    );
}

export default function EconomicCalendar() {
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

    const { data: events } = useSWR(`/api/finnhub?endpoint=calendar&from=${today}&to=${nextWeek}`, {
        refreshInterval: 600000, // 10 mins
    });

    return (
        <div className="flex flex-col h-[280px] shrink-0 overflow-hidden pb-4">
            <div className="p-4 pt-4 pb-2 shrink-0">
                <SectionLabel>ECONOMIC CALENDAR</SectionLabel>
            </div>

            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {!events || events.error || !Array.isArray(events?.economicCalendar) ? (
                    <div className="px-4">
                        <span className="text-[10px] text-[#4B5563] mb-2 block">Today</span>
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex justify-between items-center py-2 border-b border-[var(--border-subtle)]">
                                <div className="flex items-center gap-2">
                                    <Skeleton width="6px" height="6px" radius="50%" />
                                    <div className="flex flex-col gap-1">
                                        <Skeleton width="100px" height="12px" />
                                        <Skeleton width="50px" height="10px" />
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <Skeleton width="40px" height="10px" />
                                    <Skeleton width="40px" height="10px" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="px-1">
                        <div className="px-3 mb-1 mt-1"><span className="text-[10px] text-[#4B5563]">Today</span></div>
                        {events.economicCalendar.slice(0, 4).map((event: any, i: number) => (
                            <CalendarRow key={i} event={event} />
                        ))}

                        <div className="px-3 mb-1 mt-4"><span className="text-[10px] text-[#4B5563]">Tomorrow</span></div>
                        {events.economicCalendar.slice(4, 6).map((event: any, i: number) => (
                            <CalendarRow key={i + 10} event={event} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
