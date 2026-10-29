'use strict';
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const selector = '.button,.service-card,.property-open,.favorite,.tool-button,.menu-toggle,.dialog-option,.dialog-close,.text-link,.reset-link,.navigation a,.room-options label,.favorites-filter,.contact-line,.contact-map,.property-photo,.footer a,[data-close-dialog]';
  function feedback(target, x, y) {
    if (!target || reduced.matches || target.matches(':disabled,[aria-disabled="true"]') || target.closest('fieldset:disabled')) return;
    target.classList.add('tap-surface');
    if (getComputedStyle(target).position === 'static') target.classList.add('tap-static');
    target.querySelectorAll(':scope > .tap-ripple').forEach(node => node.remove());
    const bounds = target.getBoundingClientRect();
    const size = Math.hypot(bounds.width, bounds.height) * 2;
    const ripple = document.createElement('span');
    ripple.className = 'tap-ripple'; ripple.setAttribute('aria-hidden', 'true');
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = ((x ?? bounds.left + bounds.width / 2) - bounds.left - size / 2) + 'px';
    ripple.style.top = ((y ?? bounds.top + bounds.height / 2) - bounds.top - size / 2) + 'px';
    target.append(ripple);
    ripple.addEventListener('animationend', () => ripple.remove(), {once:true});
    setTimeout(() => ripple.remove(), 700);
  }
  document.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    feedback(event.target.closest(selector), event.clientX, event.clientY);
  }, {passive:true});
  document.addEventListener('keydown', event => {
    if (event.repeat || !['Enter',' '].includes(event.key)) return;
    const target = event.target.closest(selector);
    if (event.key === ' ' && target?.tagName === 'A') return;
    feedback(target);
  });
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-favorite]');
    if (!button || reduced.matches) return;
    const id = button.dataset.favorite;
    // The catalogue may render the button again after changing the saved selection.
    requestAnimationFrame(() => {
      document.querySelectorAll('[data-favorite]').forEach(current => {
        if (current.dataset.favorite !== id || current.getAttribute('aria-pressed') !== 'true') return;
        current.querySelector('svg')?.animate([
          {transform:'scale(1)'}, {transform:'scale(1.24)',offset:.42}, {transform:'scale(.96)',offset:.75}, {transform:'scale(1)'}
        ], {duration:330,easing:'cubic-bezier(.2,.7,.3,1)'});
      });
    });
  });
})();
