"use client";

import IndexStrip from '@/components/overview/IndexStrip';
import WatchlistPanel from '@/components/overview/WatchlistPanel';
import MainChart from '@/components/overview/MainChart';
import SectorPerformance from '@/components/overview/SectorPerformance';
import MarketBreadth from '@/components/overview/MarketBreadth';
import NewsFeed from '@/components/overview/NewsFeed';
import EconomicCalendar from '@/components/overview/EconomicCalendar';

export default function OverviewPage() {
    return (
        <div style={{
            position: 'fixed',
            top: '56px',       /* header height — adjust to match your actual header */
            left: '240px',     /* sidebar width — our sidebar is 240px */
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            background: '#0A0A0A',
        }}>

            {/* INDEX STRIP — 48px horizontal pill row */}
            <div style={{ flexShrink: 0, height: '48px', overflowX: 'auto' }} className="hide-scrollbar">
                <IndexStrip />
            </div>

            {/* MAIN BODY — 3-column layout */}
            <div style={{
                flex: 1,
                display: 'flex',
                overflow: 'hidden',
                minHeight: 0,
            }}>

                {/* LEFT PANEL — Watchlist + Top Movers */}
                <div style={{
                    width: '280px',
                    flexShrink: 0,
                    background: '#111111',
                    borderRight: '1px solid #1E1E1E',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                    <WatchlistPanel />
                </div>

                {/* CENTER COLUMN — Chart + Bottom Cards */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    minWidth: 0,
                }}>
                    {/* Chart area — takes all remaining vertical space */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
                        <MainChart />
                    </div>

                    {/* Bottom cards — fixed height */}
                    <div style={{
                        height: '280px',
                        flexShrink: 0,
                        display: 'flex',
                        borderTop: '1px solid #1E1E1E',
                    }}>
                        <div style={{ flex: 1, borderRight: '1px solid #1E1E1E', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <SectorPerformance />
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <MarketBreadth />
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL — News + Calendar */}
                <div style={{
                    width: '280px',
                    flexShrink: 0,
                    background: '#111111',
                    borderLeft: '1px solid #1E1E1E',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                }}>
                    {/* News feed — takes remaining space */}
                    <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }} className="hide-scrollbar">
                        <NewsFeed />
                    </div>
                    {/* Economic calendar — fixed bottom */}
                    <div style={{ height: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
                        <EconomicCalendar />
                    </div>
                </div>

            </div>
        </div>
    );
}
