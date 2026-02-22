"use client";

import { Home, Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getMarketStatus } from '@/lib/marketStatus';

export default function Header() {
    const [time, setTime] = useState<Date | null>(null);
    const [marketStatus, setMarketStatus] = useState<ReturnType<typeof getMarketStatus>>('closed');

    useEffect(() => {
        // Initial sets
        setTime(new Date());
        setMarketStatus(getMarketStatus());

        // Update time every second
        const timer = setInterval(() => {
            setTime(new Date());
            setMarketStatus(getMarketStatus());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formattedTime = time ? time.toLocaleTimeString('en-US', {
        timeZone: 'America/New_York',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }) : '--:--:--';

    const renderMarketStatus = () => {
        switch (marketStatus) {
            case 'open':
                return <div className="h-6 px-3 flex items-center gap-1.5 rounded bg-[var(--accent-dim)] border border-[#00D4AA40] text-[10px] uppercase text-[var(--accent)] font-medium tracking-wide">● MARKET OPEN</div>;
            case 'pre-market':
                return <div className="h-6 px-3 flex items-center gap-1.5 rounded bg-[var(--warning-dim)] border border-[#F59E0B40] text-[10px] uppercase text-[var(--warning)] font-medium tracking-wide">● PRE-MARKET</div>;
            case 'after-hours':
                return <div className="h-6 px-3 flex items-center gap-1.5 rounded bg-[var(--bg-elevated)] border border-[var(--border)] text-[10px] uppercase text-[#9CA3AF] font-medium tracking-wide">● AFTER-HOURS</div>;
            case 'closed':
            default:
                return <div className="h-6 px-3 flex items-center gap-1.5 rounded bg-[var(--bg-elevated)] border border-[var(--border)] text-[10px] uppercase text-[#4B5563] font-medium tracking-wide">● MARKET CLOSED</div>;
        }
    };

    return (
        <header className="fixed top-0 left-[240px] right-0 h-14 bg-[var(--bg-surface)] border-b border-[var(--border)] flex items-center justify-between px-4 z-40">
            {/* LEFT */}
            <div className="flex items-center gap-2">
                <Home className="w-[14px] h-[14px] text-[#4B5563]" strokeWidth={1.5} />
                <span className="text-[#4B5563] text-[13px]">&gt;</span>
                <span className="text-[13px] text-[#9CA3AF]">Markets</span>
                <span className="text-[#4B5563] text-[13px]">&gt;</span>
                <span className="text-[13px] text-[#F0F0F0]">Overview</span>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-4">
                {renderMarketStatus()}

                <div className="flex flex-col items-end justify-center leading-none">
                    <span className="text-[12px] text-[#4B5563] font-mono">{formattedTime}</span>
                    <span className="text-[10px] text-[#4B5563] mt-0.5">EST</span>
                </div>

                <button className="text-[#9CA3AF] hover:text-[#F0F0F0] transition-colors relative">
                    <Bell className="w-5 h-5" strokeWidth={1.5} />
                </button>

                <div className="w-7 h-7 rounded-full bg-[#1E1E1E] flex items-center justify-center shrink-0 border border-[var(--border-subtle)]">
                    <span className="text-[11px] font-bold text-[var(--accent)]">JD</span>
                </div>
            </div>
        </header>
    );
}
