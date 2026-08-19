import { classifyTap, resolveMode, shouldIgnoreTarget } from './palma2-core.js';

(function () {
  const STORAGE_KEY = 'hn-digest-display-mode';
  const root = document.documentElement;
  const toggle = document.querySelector('[data-palma-toggle]');
  const pager = document.querySelector('.pager');
  if (!toggle || !pager) return;

  const previous = pager.querySelector('[data-palma-nav="previous"]');
  const next = pager.querySelector('[data-palma-nav="next"]');

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
    toggle.textContent = enabled ? '退出 Palma 2' : 'Palma 2 模式';
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
      startY: event.clientY,
      target: event.target
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

    const destination = direction === 'previous' ? previous : direction === 'next' ? next : null;
    if (destination && destination.href) window.location.assign(destination.href);
  }, { passive: true });

  document.addEventListener('pointercancel', function () {
    pointer = null;
  }, { passive: true });
})();
