"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Eye,
    Grid3X3,
    CandlestickChart,
    Filter,
    Activity,
    Briefcase,
    TrendingUp,
    Shield,
    Globe,
    Newspaper,
    Calendar,
    Bot,
    Cpu,
    FlaskConical,
    Settings,
    CircleDot,
    ChevronLeft,
    Search
} from 'lucide-react';

export default function Sidebar() {
    const pathname = usePathname();

    const navGroups = [
        {
            label: 'MARKETS',
            items: [
                { name: 'Overview', icon: LayoutDashboard, href: '/overview' },
                { name: 'Watchlist', icon: Eye, href: '/watchlist' },
                { name: 'Market Map', icon: Grid3X3, href: '/market-map' },
            ]
        },
        {
            label: 'ANALYSIS',
            items: [
                { name: 'Charts', icon: CandlestickChart, href: '/charts' },
                { name: 'Screener', icon: Filter, href: '/screener' },
                { name: 'Options Flow', icon: Activity, href: '/options-flow' },
            ]
        },
        {
            label: 'PORTFOLIO',
            items: [
                { name: 'Holdings', icon: Briefcase, href: '/holdings' },
                { name: 'Performance', icon: TrendingUp, href: '/performance' },
                { name: 'Risk Analysis', icon: Shield, href: '/risk' },
            ]
        },
        {
            label: 'RESEARCH',
            items: [
                { name: 'Macro', icon: Globe, href: '/macro' },
                { name: 'News & Sentiment', icon: Newspaper, href: '/news' },
                { name: 'Earnings Calendar', icon: Calendar, href: '/earnings' },
            ]
        },
        {
            label: 'AI TOOLS',
            items: [
                { name: 'AI Analyst', icon: Bot, href: '/ai-analyst' },
                { name: 'Backtester', icon: Cpu, href: '/backtester' },
                { name: 'Quant Lab', icon: FlaskConical, href: '/quant-lab' },
            ]
        }
    ];

    return (
        <aside className="w-[240px] fixed top-0 left-0 h-screen bg-[var(--bg-surface)] border-r border-[var(--border)] overflow-y-auto flex flex-col justify-between z-50">
            <div className="flex flex-col">
                {/* TOP SECTION */}
                <div className="p-4 pt-4">
                    <div className="flex items-center gap-2">
                        <span className="text-[20px] font-bold text-[var(--accent)] leading-none inline-block">∞</span>
                        <span className="text-[18px] font-bold text-[var(--accent)] tracking-tight">FLUX</span>
                    </div>

                    <div className="mt-3 relative flex items-center w-full h-8 bg-[var(--bg-elevated)] border border-[var(--border)] rounded px-2">
                        <Search className="w-3.5 h-3.5 text-[#4B5563]" strokeWidth={1.5} />
                        <input
                            type="text"
                            placeholder="Jump to..."
                            className="w-full bg-transparent border-none outline-none text-[13px] text-[var(--text-primary)] placeholder-[#4B5563] ml-2"
                        />
                        <span className="text-[10px] text-[#4B5563] shrink-0 ml-1">Ctrl K</span>
                    </div>
                </div>

                {/* NAVIGATION */}
                <nav className="flex flex-col pb-4">
                    {navGroups.map((group, i) => (
                        <div key={i} className="mt-6 mb-1">
                            <div className="text-[10px] uppercase tracking-[0.08em] text-[#4B5563] pl-3 mb-1 font-medium">{group.label}</div>
                            <div className="flex flex-col">
                                {group.items.map((item, j) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={j}
                                            href={item.href}
                                            className={`h-9 flex items-center px-3 gap-2 transition-colors duration-150 ${isActive
                                                    ? 'text-[#F0F0F0] bg-[var(--accent-dim)] border-l-2 border-[var(--accent)]'
                                                    : 'text-[#9CA3AF] bg-transparent hover:text-[#F0F0F0] hover:bg-[var(--bg-elevated)] border-l-2 border-transparent'
                                                }`}
                                        >
                                            <item.icon className="w-4 h-4" strokeWidth={1.5} />
                                            <span className="text-[13px]">{item.name}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    <div className="my-2 border-t border-[var(--border)] mx-3"></div>

                    <div className="flex flex-col mb-4">
                        <div className="h-9 flex items-center px-3 gap-2 text-[#9CA3AF] hover:text-[#F0F0F0] hover:bg-[var(--bg-elevated)] border-l-2 border-transparent transition-colors duration-150 cursor-pointer">
                            <Settings className="w-4 h-4" strokeWidth={1.5} />
                            <span className="text-[13px]">Settings</span>
                        </div>
                        <div className="h-9 flex items-center px-3 gap-2 text-[#9CA3AF] hover:bg-[var(--bg-elevated)] border-l-2 border-transparent transition-colors duration-150 cursor-pointer">
                            <CircleDot className="w-4 h-4 text-[var(--accent)]" strokeWidth={1.5} />
                            <span className="text-[10px] text-[var(--accent)] font-medium uppercase tracking-wide">API Connected</span>
                        </div>
                    </div>
                </nav>
            </div>

            {/* BOTTOM */}
            <div className="border-t border-[var(--border)] p-3 sticky bottom-0 bg-[var(--bg-surface)] mt-auto z-10 w-full flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#1E1E1E] flex items-center justify-center shrink-0">
                            <span className="text-[11px] font-bold text-[var(--accent)]">JD</span>
                        </div>
                        <div className="flex flex-col justify-center">
                            <div className="flex items-center gap-2">
                                <span className="text-[13px] text-[#F0F0F0] leading-none">John Doe</span>
                                <span className="text-[10px] uppercase bg-[var(--accent-dim)] border border-[#00D4AA40] text-[#00D4AA] px-1 rounded h-3.5 flex items-center leading-none">PRO</span>
                            </div>
                            <span className="text-[11px] text-[#4B5563] leading-none mt-1">john@flux.fi</span>
                        </div>
                    </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                    <div className="flex gap-2">
                        <span className="text-[11px] text-[#4B5563]">● Settings</span>
                        <span className="text-[11px] text-[#4B5563]">◉ API Connected</span>
                    </div>
                    <button className="text-[#4B5563] hover:text-[#F0F0F0] transition-colors">
                        <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                </div>
            </div>
        </aside>
    );
}
