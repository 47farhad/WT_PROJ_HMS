export const formatTimeAgo = (dateString: string | Date): string => {
    // Handle invalid/undefined dates
    if (!dateString) return 'Never';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';

    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Handle future dates (edge case)
    if (seconds < 0) return 'Just now';

    // Time intervals in seconds
    const minute = 60;
    const hour = minute * 60;
    const day = hour * 24;
    const week = day * 7;
    const month = day * 30; // Approximation
    const year = day * 365; // Approximation

    // Precision formatting
    if (seconds < minute) return 'Just now';
    if (seconds < hour) {
        const mins = Math.floor(seconds / minute);
        return `${mins}m ago`;
    }
    if (seconds < day) {
        const hrs = Math.floor(seconds / hour);
        return `${hrs}h ago`;
    }
    if (seconds < week) {
        const days = Math.floor(seconds / day);
        return `${days}d ago`;
    }
    if (seconds < month) {
        const weeks = Math.floor(seconds / week);
        return `${weeks}w ago`;
    }
    if (seconds < year) {
        const months = Math.floor(seconds / month);
        return `${months}mo ago`;
    }

    const years = Math.floor(seconds / year);
    return `${years}y ago`;
};