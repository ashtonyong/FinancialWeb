function getEasternTime(): Date {
    const now = new Date();
    const easternStr = now.toLocaleString('en-US', { timeZone: 'America/New_York' });
    return new Date(easternStr);
}

export function getMarketStatus(): 'pre-market' | 'open' | 'after-hours' | 'closed' {
    const et = getEasternTime();
    const day = et.getDay();
    const hours = et.getHours();
    const minutes = et.getMinutes();
    const totalMinutes = hours * 60 + minutes;

    if (day === 0 || day === 6) return 'closed';
    if (totalMinutes >= 240 && totalMinutes < 570) return 'pre-market';
    if (totalMinutes >= 570 && totalMinutes < 960) return 'open';
    if (totalMinutes >= 960 && totalMinutes < 1200) return 'after-hours';
    return 'closed';
}

export function getEasternTimeString(): string {
    return new Date().toLocaleTimeString('en-US', {
        timeZone: 'America/New_York',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });
}

export function getEasternTimezone(): string {
    const abbr = new Date().toLocaleTimeString('en-US', {
        timeZone: 'America/New_York',
        timeZoneName: 'short',
    }).split(' ').pop();
    return abbr ?? 'ET';
}
