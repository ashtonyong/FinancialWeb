"use client";

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

function getTodayStr() {
    return new Date().toISOString().split('T')[0];
}

function getDatePlusDays(days: number) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
}

export default function EconomicCalendar() {
    const today = getTodayStr();
    const nextWeek = getDatePlusDays(7);

    const { data } = useSWR(
        `/api/finnhub?endpoint=calendar&from=${today}&to=${nextWeek}`,
        fetcher,
        { refreshInterval: 600000 }
    );

    const events: any[] = data?.economicCalendar ?? [];

    // Group by date
    const todayEvents = events.filter(e => e.time?.startsWith(today));
    const tomorrowStr = getDatePlusDays(1);
    const tomorrowEvents = events.filter(e => e.time?.startsWith(tomorrowStr));
    const upcomingEvents = events.filter(e => !e.time?.startsWith(today) && !e.time?.startsWith(tomorrowStr)).slice(0, 5);

    const impactColor = (impact: string) => {
        if (impact === 'high' || impact === '3') return '#FF4D4D';
        if (impact === 'medium' || impact === '2') return '#F59E0B';
        return '#4B5563';
    };

    const formatTime = (timeStr: string) => {
        if (!timeStr) return '';
        const parts = timeStr.split(' ');
        return parts[1] ?? timeStr;
    };

    const renderGroup = (label: string, groupEvents: any[]) => {
        if (groupEvents.length === 0) return null;
        return (
            <div key={label}>
                <div style={{ padding: '8px 16px 4px', fontSize: '10px', color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {label}
                </div>
                {groupEvents.map((event, i) => {
                    const impact = String(event.impact ?? '').toLowerCase();
                    const borderColor = impactColor(impact);
                    const hasHighImpact = impact === 'high' || impact === '3';
                    const hasMedImpact = impact === 'medium' || impact === '2';

                    return (
                        <div
                            key={i}
                            style={{
                                height: '36px', display: 'flex', alignItems: 'center',
                                padding: '0 16px', gap: '8px',
                                borderBottom: '1px solid #151515',
                                borderLeft: hasHighImpact ? '2px solid #FF4D4D' : hasMedImpact ? '2px solid #F59E0B' : '2px solid transparent',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#161616')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                            {/* Impact dot */}
                            <div style={{
                                width: 6, height: 6, borderRadius: '50%',
                                background: borderColor, flexShrink: 0,
                            }} />

                            {/* Event name */}
                            <span style={{
                                fontSize: '12px', color: '#F0F0F0', flex: 1,
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                                {event.event}
                            </span>

                            {/* Time */}
                            <span style={{ fontSize: '11px', color: '#4B5563', flexShrink: 0 }}>
                                {formatTime(event.time)}
                            </span>

                            {/* Estimate / Prev */}
                            <span style={{ fontSize: '10px', color: '#4B5563', flexShrink: 0, textAlign: 'right' }}>
                                {event.estimate ? `Est: ${event.estimate}` : event.prev ? `Prev: ${event.prev}` : ''}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div style={{ borderTop: '1px solid #1E1E1E', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ padding: '10px 16px 6px', flexShrink: 0 }}>
                <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4B5563' }}>
                    ECONOMIC CALENDAR
                </p>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }} className="hide-scrollbar">
                {events.length === 0 ? (
                    <div style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: '#4B5563' }}>
                        Loading calendar...
                    </div>
                ) : (
                    <>
                        {renderGroup('Today', todayEvents)}
                        {renderGroup('Tomorrow', tomorrowEvents)}
                        {renderGroup('Upcoming', upcomingEvents)}
                    </>
                )}
            </div>
        </div>
    );
}
