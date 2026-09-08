/* One partygoer per onboarded member, arranged in small social groups. */
(function (root) {
  'use strict';
  function positionsForMembers(count, seed = 0) {
    if (!Number.isSafeInteger(count) || count < 0) throw new RangeError('Joined members must be a non-negative integer.');
    if (count === 0) return [];
    const groupCount = Math.ceil(count / 4);
    const columns = Math.min(5, Math.ceil(Math.sqrt(groupCount * 1.5)));
    const rows = Math.ceil(groupCount / columns);
    const offsets = [[-4, -4], [4, -2], [-3, 4], [5, 7]];
    const motions = ['cheer', 'bounce', 'sway', 'shuffle', 'bounce', 'shuffle', 'sway', 'dip', 'cheer', 'shuffle', 'sway', 'bounce'];
    return Array.from({length: count}, (_, index) => {
      const group = Math.floor(index / 4);
      const row = Math.floor(group / columns);
      const column = group % columns;
      const rowCount = Math.min(columns, groupCount - row * columns);
      const centerX = 50 + (column - (rowCount - 1) / 2) * Math.min(28, 76 / Math.max(1, columns - 1));
      const centerY = rows === 1 ? 70 : 40 + row / (rows - 1) * 40;
      const groupShift = ((group * 13 + seed * 7) % 7) - 3;
      const jitter = (((index * 37 + seed * 13) % 17) - 8) / 8;
      const [offsetX, offsetY] = offsets[index % 4];
      const y = centerY + offsetY + groupShift + jitter;
      const depth = Math.max(0, Math.min(1, (y - 32) / 60));
      const sprite = (index * 5 + seed * 3) % 12;
      return {
        member: index + 1,
        sprite,
        x: centerX + offsetX + groupShift * 0.4 + jitter,
        y,
        scale: 0.76 + depth * 0.21,
        layer: Math.round(y * 100),
        facing: index % 4 < 2 ? 1 : -1,
        motion: motions[sprite],
        delay: -((index * 19 + seed * 7) % 39) / 10,
        duration: 0.85 + ((index * 7) % 8) / 10
      };
    });
  }
  const api = Object.freeze({positionsForMembers});
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.FomoCrowd = api;
})(typeof window === 'object' ? window : globalThis);
