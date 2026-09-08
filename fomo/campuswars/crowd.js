/* One sprite position per onboarded member; no decorative extra partygoers. */
(function (root) {
  'use strict';
  function positionsForMembers(count, seed = 0) {
    if (!Number.isSafeInteger(count) || count < 0) throw new RangeError('Joined members must be a non-negative integer.');
    if (count === 0) return [];
    const columns = Math.min(12, Math.max(1, Math.ceil(Math.sqrt(count * 1.6))));
    const rows = Math.ceil(count / columns);
    const spacing = Math.min(8.5, 86 / Math.max(1, columns - 1));
    return Array.from({length: count}, (_, index) => {
      const row = Math.floor(index / columns);
      const column = index % columns;
      const rowCount = Math.min(columns, count - row * columns);
      const jitter = (((index * 37 + seed * 13) % 17) - 8) / 10;
      const depth = rows === 1 ? 0.8 : row / (rows - 1);
      return {
        member: index + 1,
        sprite: (index * 5 + seed * 3) % 12,
        x: 50 + (column - (rowCount - 1) / 2) * spacing + (row % 2 ? 1.5 : -1.5) + jitter,
        y: rows === 1 ? 76 + jitter : 38 + depth * 52 + jitter,
        scale: 0.72 + depth * 0.23,
        layer: row + 1,
        delay: -((index * 19 + seed * 7) % 39) / 10,
        duration: 1.35 + ((index * 7) % 13) / 10
      };
    });
  }
  const api = Object.freeze({positionsForMembers});
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.FomoCrowd = api;
})(typeof window === 'object' ? window : globalThis);
