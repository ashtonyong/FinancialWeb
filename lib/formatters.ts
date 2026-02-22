// lib/formatters.ts

export function formatPrice(value: number, symbol?: string): string {
    if (value == null) return '--';

    if (symbol === '^TNX') {
        return `${value.toFixed(2)}%`;
    }

    // High value items like BTC or Dow Jones
    if (value > 1000) {
        return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatChange(change: number, changePercent: number): string {
    if (change == null || changePercent == null) return '--';
    const prefix = change >= 0 ? '+' : '';
    const numPrefix = change >= 0 ? '+' : ''; // To be safe
    const formattedChange = Math.abs(change).toFixed(2);
    const formattedPercent = Math.abs(changePercent).toFixed(2);

    return `${prefix}${formattedChange} (${numPrefix}${formattedPercent}%)`;
}

export function formatVolume(volume: number): string {
    if (volume == null) return '--';
    if (volume >= 1e9) {
        return (volume / 1e9).toFixed(1) + 'B';
    }
    if (volume >= 1e6) {
        return (volume / 1e6).toFixed(1) + 'M';
    }
    if (volume >= 1e3) {
        return (volume / 1e3).toFixed(1) + 'K';
    }
    return volume.toString();
}

export function formatTimeAgo(unixTimestamp: number): string {
    if (!unixTimestamp) return '';
    const seconds = Math.floor((Date.now() - unixTimestamp * 1000) / 1000);

    if (seconds < 60) return 'Just now';

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

export function formatMarketCap(value: number): string {
    if (value == null) return '--';
    if (value >= 1e12) {
        return '$' + (value / 1e12).toFixed(2) + 'T';
    }
    if (value >= 1e9) {
        return '$' + (value / 1e9).toFixed(0) + 'B';
    }
    if (value >= 1e6) {
        return '$' + (value / 1e6).toFixed(1) + 'M';
    }
    return '$' + value.toLocaleString();
}
