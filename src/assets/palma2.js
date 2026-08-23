import { classifyTap, pageTurnDistance, resolveMode, shouldIgnoreTarget } from './palma2-core.js?v=20260819-v2';

(function () {
  const STORAGE_KEY = 'hn-digest-display-mode';
  const root = document.documentElement;
  const toggle = document.querySelector('[data-palma-toggle]');
  if (!toggle) return;

  function readStoredMode() {
    try { return window.localStorage.getItem(STORAGE_KEY) || ''; }
    catch (error) { return ''; }
  }

  function storeMode(enabled) {
    try { window.localStorage.setItem(STORAGE_KEY, enabled ? 'palma2' : 'standard'); }
    catch (error) { /* Storage may be unavailable in private browsing. */ }
  }

  let enabled = resolveMode({ search: window.location.search, stored: readStoredMode() });

  function renderMode() {
    root.dataset.displayMode = enabled ? 'palma2' : 'standard';
    toggle.setAttribute('aria-pressed', String(enabled));
    toggle.textContent = enabled ? '退出墨水屏模式' : '墨水屏模式';
  }

  renderMode();

  const explicitMode = new URLSearchParams(window.location.search).get('mode');
  if (explicitMode === 'palma2' || explicitMode === 'standard') storeMode(enabled);

  toggle.addEventListener('click', function () {
    enabled = !enabled;
    storeMode(enabled);
    renderMode();
  });

  let pointer = null;

  document.addEventListener('pointerdown', function (event) {
    if (!enabled || (event.button !== undefined && event.button !== 0) || shouldIgnoreTarget(event.target)) {
      pointer = null;
      return;
    }

    pointer = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY
    };
  }, { passive: true });

  document.addEventListener('pointerup', function (event) {
    if (!enabled || !pointer || pointer.id !== event.pointerId || shouldIgnoreTarget(event.target)) {
      pointer = null;
      return;
    }

    const direction = classifyTap({
      startX: pointer.startX,
      endX: event.clientX,
      startY: pointer.startY,
      endY: event.clientY,
      width: window.innerWidth
    });
    pointer = null;

    const step = pageTurnDistance(window.innerHeight);
    if (!step) return;

    if (direction === 'screen-up') {
      window.scrollBy({ top: -step, left: 0, behavior: 'auto' });
    } else if (direction === 'screen-down') {
      window.scrollBy({ top: step, left: 0, behavior: 'auto' });
    }
  }, { passive: true });

  document.addEventListener('pointercancel', function () {
    pointer = null;
  }, { passive: true });
})();
