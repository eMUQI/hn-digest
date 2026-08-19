const INTERACTIVE_SELECTOR = 'a, button, input, textarea, select, summary, [contenteditable="true"], [role="button"]';

export function classifyTap({ startX, endX, startY, endY, width, edgeRatio = 0.25, maxMovement = 18 }) {
  if (!Number.isFinite(width) || width <= 0) return null;

  const dx = Math.abs(endX - startX);
  const dy = Math.abs(endY - startY);
  if (dx > maxMovement || dy > maxMovement) return null;

  if (startX <= width * edgeRatio) return 'previous';
  if (startX >= width * (1 - edgeRatio)) return 'next';
  return null;
}

export function shouldIgnoreTarget(target) {
  if (!target || typeof target.closest !== 'function') return false;
  return Boolean(target.closest(INTERACTIVE_SELECTOR));
}

export function resolveMode({ search = '', stored = '' } = {}) {
  const params = new URLSearchParams(search);
  const explicit = params.get('mode');
  if (explicit === 'palma2') return true;
  if (explicit === 'standard') return false;
  return stored === 'palma2';
}
