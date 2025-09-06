const normalize = (s) => (s ?? '').toString().trim().toLowerCase().replace(/\s+/g, ' ');

export function annotateSessionsWithRevisit(sessions = []) {
    const byDate = [...sessions].sort((a, b) => new Date(a.date) - new Date(b.date));
    const seen = new Set();

    return byDate.map((s) => {
        const unique = [...new Set((s.participants || []).map(normalize).filter(Boolean))];

        const revisitCount = unique.filter((n) => seen.has(n)).length;
        unique.forEach((n) => seen.add(n));

        const revisitRate = unique.length ? +((revisitCount / unique.length) * 100).toFixed(1) : 0;

        return { ...s, uniqueCount: unique.length, revisitCount, revisitRate };
    });
}
