import IndexStrip from '@/components/overview/IndexStrip';
import WatchlistPanel from '@/components/overview/WatchlistPanel';
import MainChart from '@/components/overview/MainChart';
import SectorPerformance from '@/components/overview/SectorPerformance';
import MarketBreadth from '@/components/overview/MarketBreadth';
import NewsFeed from '@/components/overview/NewsFeed';
import EconomicCalendar from '@/components/overview/EconomicCalendar';

export default function OverviewPage() {
    return (
        <div className="flex flex-col h-full w-full">
            <IndexStrip />

            <div className="flex flex-1 overflow-hidden">
                {/* Left Panel */}
                <WatchlistPanel />

                {/* Center Panel (Chart + Bottom Cards) */}
                <div className="flex flex-col flex-1 min-w-0 bg-[var(--bg-base)] border-r border-[var(--border)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <div className="h-[60%] min-h-[420px] flex flex-col shrink-0 px-4 pt-4">
                        <div className="w-full h-full border border-[var(--border)] rounded-[6px] overflow-hidden">
                            <MainChart />
                        </div>
                    </div>

                    <div className="flex-1 flex gap-4 p-4 min-h-[260px]">
                        <SectorPerformance />
                        <MarketBreadth />
                    </div>
                </div>

                {/* Right Panel */}
                <div className="w-[300px] shrink-0 bg-[var(--bg-surface)] flex flex-col h-full ml-[-1px]">
                    <NewsFeed />
                    <EconomicCalendar />
                </div>
            </div>
        </div>
    );
}
