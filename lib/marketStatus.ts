export function getMarketStatus(): 'pre-market' | 'open' | 'after-hours' | 'closed' {
    const now = new Date();
    const estOffset = -5; // UTC-5 (EST)
    const estHour = (now.getUTCHours() + 24 + estOffset) % 24;
    const estMinutes = now.getUTCMinutes();
    const dayOfWeek = now.getUTCDay(); // 0=Sun, 6=Sat

    if (dayOfWeek === 0 || dayOfWeek === 6) return 'closed';
    const timeInMinutes = estHour * 60 + estMinutes;
    if (timeInMinutes >= 240 && timeInMinutes < 570) return 'pre-market';  // 4AM-9:30AM
    if (timeInMinutes >= 570 && timeInMinutes < 960) return 'open';         // 9:30AM-4PM
    if (timeInMinutes >= 960 && timeInMinutes < 1200) return 'after-hours'; // 4PM-8PM
    return 'closed';
}
