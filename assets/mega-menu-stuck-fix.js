/**
 * mega-menu-stuck-fix.js
 * Enforces strict hover state for details.msu-mega-menu dropdowns
 * Prevents third party apps from sticking the menu open with open="true" when not hovering.
 */
(function() {
  function forceCloseStuckMenus() {
    const menus = document.querySelectorAll('details.msu-mega-menu');
    menus.forEach(details => {
      // If the menu is open but the mouse is not currently hovering over it, force it closed.
      if (details.hasAttribute('open') && !details.matches(':hover')) {
        details.removeAttribute('open');
        const summary = details.querySelector('summary');
        if (summary) {
          summary.setAttribute('aria-expanded', 'false');
        }
      }
    });
  }

  // 1. Emergency Reset Timers
  // Fire at 0ms, 300ms, and 800ms after load
  [0, 300, 800].forEach(delay => {
    setTimeout(forceCloseStuckMenus, delay);
  });

  // 2. MutationObserver
  // Watches for the 'open' attribute being added and removes it if mouse isn't over the element.
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'open' || mutation.attributeName === 'aria-expanded') {
        const target = mutation.target.closest('details.msu-mega-menu');
        if (!target) return;
        
        const summary = target.querySelector('summary');
        
        if (target.hasAttribute('open') && !target.matches(':hover')) {
          // It was forced open, but we aren't hovering over it! Kill it.
          target.removeAttribute('open');
          if (summary) summary.setAttribute('aria-expanded', 'false');
        } else if (target.hasAttribute('open') && target.matches(':hover')) {
          // Sync aria-expanded to true when properly open
          if (summary) summary.setAttribute('aria-expanded', 'true');
        }
      }
    });
  });

  function initStuckFix() {
    const menus = document.querySelectorAll('details.msu-mega-menu');
    
    // Attach observer
    menus.forEach(menu => {
      observer.observe(menu, { attributes: true, attributeFilter: ['open'] });
      const summary = menu.querySelector('summary');
      if (summary) observer.observe(summary, { attributes: true, attributeFilter: ['aria-expanded'] });
    });

    // Make sure we constantly check if the mouse leaves any stuck areas
    document.addEventListener('mousemove', (e) => {
      // Minor debounce logic inside the mouse move could be added, but calling it directly is fine
      // because querySelectorAll is fast and most times menus aren't stuck open.
      menus.forEach(details => {
         if (details.hasAttribute('open')) {
            const rect = details.getBoundingClientRect();
            // If mouse is definitely outside the details bound
            const isOutside = (
               e.clientX < rect.left || e.clientX > rect.right ||
               e.clientY < rect.top || e.clientY > rect.bottom
            );
            if (isOutside) {
               details.removeAttribute('open');
               const summary = details.querySelector('summary');
               if (summary) summary.setAttribute('aria-expanded', 'false');
            }
         }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStuckFix);
  } else {
    initStuckFix();
  }
})();
