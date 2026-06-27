/* ═══════════════════════════════════════════════════════════════
   Brew & Bloom — Core JS
   Pages: index, menu, checkout, payment, confirmation
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── Constants ────────────────────────────────────────────────────
  const TAX_GST_RATE  = 0.05;   // 5 % GST
  const PLATFORM_FEE  = 25;     // ₹ per order
  const PACKAGING_FEE = 18;     // ₹ per order
  const DELIVERY_FEE  = 35;     // ₹ home-delivery

  const STORAGE_KEYS = {
    cart      : 'bb_cart_v1',
    favorites : 'bb_favs_v1',
    orderDraft: 'bb_orderDraft_v1'
  };

  const COUPONS_DEFAULT = [
    { code: 'GOLD10',    type: 'pct',  pct: 0.10, max: 100,  active: true, description: '10% off (max ₹100)' },
    { code: 'BLOOM20',   type: 'pct',  pct: 0.20, max: 180,  active: true, description: '20% off (max ₹180)' },
    { code: 'WELCOME50', type: 'flat', flat: 50,             active: true, description: '₹50 flat off'        }
  ];

  // Load coupons — admin can override via localStorage
  function getCoupons() {
    try {
      const stored = JSON.parse(localStorage.getItem('bb_coupons_v1') || 'null');
      return Array.isArray(stored) ? stored : COUPONS_DEFAULT;
    } catch { return COUPONS_DEFAULT; }
  }

  // ── Small helpers ────────────────────────────────────────────────
  const qs  = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function formatINR(n) {
    return '₹ ' + (Number(n) || 0).toLocaleString('en-IN');
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, m => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    }[m]));
  }

  // ── Data helpers ─────────────────────────────────────────────────
  function getDishById(id) {
    return (window.BREWBLOOM_DISHES || []).find(d => d.id === id) || null;
  }

  function getCategoryById(id) {
    return (window.BREWBLOOM_CATEGORIES || []).find(c => c.id === id) || null;
  }

  // ── Cart ─────────────────────────────────────────────────────────
  function loadCart() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.cart) || '[]'); }
    catch { return []; }
  }

  function saveCart(cart) {
    localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
  }

  function getCartCount(cart) {
    return cart.reduce((s, it) => s + (it.qty || 0), 0);
  }

  function calcLinePrice(item) {
    const dish = getDishById(item.dishId);
    if (!dish) return 0;
    const unitPrice = dish.price - (dish.discountPct ? dish.price * dish.discountPct / 100 : 0);
    return Math.round(unitPrice * (item.qty || 0));
  }

  function calcCouponDiscount(subtotal, couponCode) {
    const code = (couponCode || '').trim().toUpperCase();
    if (!code) return 0;
    const found = getCoupons().find(c => c.code === code && c.active !== false);
    if (!found) return 0;
    const raw = found.type === 'pct' ? subtotal * found.pct : (found.flat || 0);
    return Math.round(Math.min(subtotal, raw));
  }

  // Validate a coupon code and return status message
  function validateCoupon(code) {
    const c = (code || '').trim().toUpperCase();
    if (!c) return { ok: false, msg: '' };
    const all   = getCoupons();
    const found = all.find(x => x.code === c);
    if (!found)                  return { ok: false, msg: '✕ Invalid coupon code' };
    if (found.active === false)  return { ok: false, msg: '✕ This coupon is no longer active' };
    return { ok: true,  msg: `✓ ${found.description || found.code} applied!`, coupon: found };
  }

  function getDeliveryFee() {
    const draft = safeLoadOrderDraft();
    const mode  = draft?.deliveryMode || 'homeDelivery';
    return (mode === 'dineIn' || mode === 'takeAway') ? 0 : DELIVERY_FEE;
  }

  function calcTotals(cart, couponCode) {
    const subtotal    = cart.reduce((s, it) => s + calcLinePrice(it), 0);
    const gst         = Math.round(subtotal * TAX_GST_RATE);
    const delivery    = getDeliveryFee();
    const platformFee = cart.length ? PLATFORM_FEE  : 0;
    const packaging   = cart.length ? PACKAGING_FEE : 0;
    const discount    = calcCouponDiscount(subtotal, couponCode);
    const grandTotal  = Math.max(0, Math.round(subtotal + gst + delivery + platformFee + packaging - discount));
    return { subtotal, gst, delivery, platformFee, packaging, discount, grandTotal };
  }

  // ── Favorites ────────────────────────────────────────────────────
  function loadFavorites() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.favorites) || '[]'); }
    catch { return []; }
  }

  function saveFavorites(ids) {
    localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(ids));
  }

  function toggleFavorite(dishId) {
    const favs = loadFavorites();
    const idx  = favs.indexOf(dishId);
    if (idx >= 0) favs.splice(idx, 1); else favs.push(dishId);
    saveFavorites(favs);
    return favs;
  }

  function isFav(dishId) {
    return loadFavorites().includes(dishId);
  }

  // ── Order draft ──────────────────────────────────────────────────
  function safeLoadOrderDraft() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.orderDraft) || 'null'); }
    catch { return null; }
  }

  // ── Cart count badge ─────────────────────────────────────────────
  function updateCartCountUI() {
    const badge = qs('[data-cart-count]');
    if (badge) badge.textContent = String(getCartCount(loadCart()));
  }

  // ── Drawer ───────────────────────────────────────────────────────
  function openDrawerIfExists() {
    const overlay = qs('.drawer-overlay');
    const drawer  = qs('.drawer');
    if (!overlay || !drawer) return;
    overlay.classList.add('open');
    drawer.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawerIfExists() {
    const overlay = qs('.drawer-overlay');
    const drawer  = qs('.drawer');
    if (!overlay || !drawer) return;
    overlay.classList.remove('open');
    drawer.classList.remove('open');
    document.body.style.overflow = '';
  }

  // ── Totals writer (shared by cart drawer + sidebar panels) ───────
  function writeTotals(totals) {
    const map = {
      '[data-t-subtotal]'  : formatINR(totals.subtotal),
      '[data-t-gst]'       : formatINR(totals.gst),
      '[data-t-delivery]'  : formatINR(totals.delivery),
      '[data-t-platform]'  : formatINR(totals.platformFee),
      '[data-t-packaging]' : formatINR(totals.packaging),
      '[data-t-discount]'  : totals.discount ? '-' + formatINR(totals.discount) : formatINR(0),
      '[data-t-grand]'     : formatINR(totals.grandTotal)
    };
    for (const [sel, val] of Object.entries(map)) {
      qsa(sel).forEach(el => el.textContent = val);
    }
  }

  // ── Cart drawer renderer ─────────────────────────────────────────
  function renderCartDrawer() {
    const container = qs('[data-cart-items]');
    if (!container) return;

    const cart        = loadCart();
    const couponInput = qs('[data-coupon]');
    const couponCode  = couponInput ? couponInput.value : '';

    container.innerHTML = '';

    if (!cart.length) {
      container.innerHTML = `
        <div style="padding:16px 0; opacity:.85; text-align:center;">
          <div>🛒 Cart is empty</div>
          <div class="small muted" style="margin-top:6px;">Add something premium ✨</div>
        </div>`;
      writeTotals(calcTotals([], couponCode));
      return;
    }

    cart.forEach(item => {
      const dish = getDishById(item.dishId);
      if (!dish) return;

      const linePrice = calcLinePrice(item);
      const el        = document.createElement('div');
      el.className    = 'cart-item';
      el.style.marginBottom = '10px';

      el.innerHTML = `
        <img alt="${escapeHtml(dish.name)}" src="${dish.image}" />
        <div>
          <div class="name">${escapeHtml(dish.name)}</div>
          <div class="meta">${escapeHtml(getCategoryById(dish.categoryId)?.name || dish.categoryId)} • ${dish.veg ? 'Veg' : 'Non-Veg'} • ⭐ ${dish.rating}</div>
          <div class="small muted" style="margin-top:4px;">Line: <b style="color:var(--white)">${formatINR(linePrice)}</b></div>
        </div>
        <div style="display:flex; flex-direction:column; align-items:flex-end; gap:8px;">
          <div class="qty" aria-label="Quantity controls">
            <button data-dec="${dish.id}" aria-label="Decrease quantity">−</button>
            <span>${item.qty || 1}</span>
            <button data-inc="${dish.id}" aria-label="Increase quantity">+</button>
          </div>
          <button class="btn btn-ghost" style="padding:6px 12px; border-radius:12px; font-size:.85rem;" data-remove="${dish.id}">Remove</button>
        </div>
      `;

      el.querySelector(`[data-inc="${dish.id}"]`).addEventListener('click', () => updateQty(dish.id, (item.qty || 1) + 1));
      el.querySelector(`[data-dec="${dish.id}"]`).addEventListener('click', () => updateQty(dish.id, Math.max(1, (item.qty || 1) - 1)));
      el.querySelector(`[data-remove="${dish.id}"]`).addEventListener('click', () => removeItem(dish.id));

      container.appendChild(el);
    });

    writeTotals(calcTotals(cart, couponCode));
  }

  function updateQty(dishId, newQty) {
    const cart = loadCart();
    const it   = cart.find(x => x.dishId === dishId);
    if (!it) return;
    it.qty = newQty;
    saveCart(cart);
    updateCartCountUI();
    renderCartDrawer();
  }

  function removeItem(dishId) {
    saveCart(loadCart().filter(x => x.dishId !== dishId));
    updateCartCountUI();
    renderCartDrawer();
  }

  function addToCart(dishId, qty = 1) {
    const dish = getDishById(dishId);
    if (!dish) return;
    const cart = loadCart();
    const it   = cart.find(x => x.dishId === dishId);
    if (it) it.qty = (it.qty || 0) + qty;
    else cart.push({ dishId, qty });
    saveCart(cart);
    updateCartCountUI();
    renderCartDrawer();
    openDrawerIfExists();
  }

  // ── Menu cards ───────────────────────────────────────────────────
  function renderMenuCards() {
    const grid = qs('[data-menu-grid]');
    if (!grid) return;

    const searchInput   = qs('[data-menu-search]');
    const activeCatEl   = qs('[data-active-cat]');
    const query         = (searchInput?.value || '').trim().toLowerCase();
    const selectedCatId = activeCatEl?.value || 'all';

    let dishes = (window.BREWBLOOM_DISHES || []).slice();
    if (selectedCatId !== 'all') dishes = dishes.filter(d => d.categoryId === selectedCatId);
    if (query) dishes = dishes.filter(d => d.name.toLowerCase().includes(query));

    const favorites = new Set(loadFavorites());
    grid.innerHTML   = '';

    if (!dishes.length) {
      grid.innerHTML = `<div class="small muted" style="grid-column:1/-1; padding:24px 0; text-align:center;">No dishes found.</div>`;
      return;
    }

    dishes.forEach(d => {
      const discounted  = d.discountPct ? Math.round(d.price - d.price * d.discountPct / 100) : d.price;
      const hasDiscount = !!d.discountPct && d.discountPct > 0;
      const catName     = escapeHtml(getCategoryById(d.categoryId)?.name || d.categoryId);

      const card = document.createElement('div');
      card.className       = 'dish-card reveal';
      card.style.willChange = 'transform';

      card.innerHTML = `
        <div class="dish-img">
          <img loading="lazy" alt="${escapeHtml(d.name)}" src="${d.image}" />
          ${hasDiscount ? `<div style="position:absolute; top:10px; left:10px;" class="badge badge-discount">${d.discountPct}% OFF</div>` : ''}
        </div>
        <div class="dish-body">
          <div class="dish-title">
            <div>
              <h3>${escapeHtml(d.name)}</h3>
              <div class="small muted">${catName} • ${d.timeMin} min</div>
            </div>
            <button class="icon-btn" data-fav="${d.id}" aria-label="Toggle wishlist" style="flex-shrink:0;">
              ${favorites.has(d.id) ? '♥' : '♡'}
            </button>
          </div>

          <div class="badges">
            <span class="badge badge-gold">⭐ ${d.rating.toFixed(1)}</span>
            <span class="badge">${d.veg ? '🥦 Veg' : '🍗 Non-Veg'}</span>
            ${d.bestseller ? `<span class="badge badge-green">Bestseller</span>` : ''}
          </div>

          <div class="line" style="margin:8px 0 0; align-items:center;">
            <div>
              <b style="color:var(--white); font-size:1rem;">₹${discounted}</b>
              ${hasDiscount ? `<s class="small muted" style="margin-left:6px;">₹${d.price}</s>` : ''}
              <div class="small muted">Prep • ${d.timeMin} mins</div>
            </div>
          </div>

          <div class="dish-actions" style="margin-top:10px;">
            <button class="btn btn-primary ripple" data-add="${d.id}" style="flex:1;">Add to Cart</button>
            <button class="btn btn-ghost ripple" data-quick="${d.id}" style="width:110px; justify-content:center;">Quick View</button>
          </div>
        </div>
      `;

      card.querySelector(`[data-add="${d.id}"]`).addEventListener('click', () => addToCart(d.id, 1));
      card.querySelector(`[data-quick="${d.id}"]`).addEventListener('click', () => openQuickView(d.id));
      card.querySelector(`[data-fav="${d.id}"]`).addEventListener('click', () => {
        toggleFavorite(d.id);
        renderMenuCards();
      });

      grid.appendChild(card);
    });

    applyRevealAnimation();
  }

  // ── Quick-view modal ─────────────────────────────────────────────
  function openQuickView(dishId) {
    const dish    = getDishById(dishId);
    const overlay = qs('.modal-overlay');
    const modal   = qs('.modal');
    if (!dish || !overlay || !modal) return;

    document.body.style.overflow = 'hidden';
    overlay.classList.add('open');
    modal.classList.add('open');

    const discounted  = dish.discountPct ? Math.round(dish.price - dish.price * dish.discountPct / 100) : dish.price;
    const catName     = escapeHtml(getCategoryById(dish.categoryId)?.name || dish.categoryId);

    modal.innerHTML = `
      <div style="padding:18px; display:flex; align-items:flex-start; justify-content:space-between; gap:12px;">
        <div>
          <div class="small muted">${catName} • ${dish.timeMin} min</div>
          <div class="h2" style="margin-top:6px;">${escapeHtml(dish.name)}</div>
          <div class="badges" style="margin-top:8px;">
            <span class="badge badge-gold">⭐ ${dish.rating.toFixed(1)}</span>
            <span class="badge">${dish.veg ? '🥦 Veg' : '🍗 Non-Veg'}</span>
            ${dish.bestseller ? `<span class="badge badge-green">Bestseller</span>` : ''}
            ${dish.discountPct ? `<span class="badge badge-discount">${dish.discountPct}% OFF</span>` : ''}
          </div>
        </div>
        <button class="btn btn-ghost ripple" style="padding:10px 14px; flex-shrink:0;" data-close-modal>✕ Close</button>
      </div>

      <div class="hr"></div>

      <div style="padding:18px; display:grid; grid-template-columns:1fr 1fr; gap:16px; align-items:start;">
        <div class="card" style="border-radius:18px; overflow:hidden; border:1px solid rgba(212,165,116,.25);">
          <div style="height:240px; position:relative;">
            <img alt="${escapeHtml(dish.name)}" loading="lazy" src="${dish.image}"
                 style="width:100%; height:100%; object-fit:cover;" />
            <div style="position:absolute; top:10px; left:10px;" class="badge badge-gold">Premium Pick</div>
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:14px;">
          <div>
            <div style="font-size:1.3rem; font-weight:800;">₹${discounted}
              ${dish.discountPct ? `<s class="small muted" style="margin-left:8px; font-weight:400;">₹${dish.price}</s>` : ''}
            </div>
            <div class="small muted" style="margin-top:6px;">Crafted fresh • Premium packaging • Est. ${dish.timeMin} mins</div>
          </div>

          <div class="field">
            <div class="label">Quantity</div>
            <div class="qty">
              <button type="button" data-qty-dec>−</button>
              <span data-qty-val style="min-width:28px; text-align:center; font-weight:800;">1</span>
              <button type="button" data-qty-inc>+</button>
            </div>
          </div>

          <div style="display:flex; gap:10px; flex-wrap:wrap;">
            <button class="btn btn-primary ripple" style="flex:1; justify-content:center;" data-add-modal>Add to Cart</button>
            <button class="btn btn-ghost ripple" data-fav-modal>${isFav(dish.id) ? '♥ Remove' : '♡ Wishlist'}</button>
          </div>
        </div>
      </div>
    `;

    let qty = 1;
    const qtyVal = modal.querySelector('[data-qty-val]');

    modal.querySelector('[data-qty-inc]').addEventListener('click', () => { qty++; qtyVal.textContent = qty; });
    modal.querySelector('[data-qty-dec]').addEventListener('click', () => { qty = Math.max(1, qty - 1); qtyVal.textContent = qty; });
    modal.querySelector('[data-add-modal]').addEventListener('click', () => { addToCart(dish.id, qty); closeQuickView(); });
    modal.querySelector('[data-fav-modal]').addEventListener('click', () => {
      toggleFavorite(dish.id);
      modal.querySelector('[data-fav-modal]').textContent = isFav(dish.id) ? '♥ Remove' : '♡ Wishlist';
      renderMenuCards();
    });
    modal.querySelector('[data-close-modal]').addEventListener('click', closeQuickView);
    overlay.addEventListener('click', closeQuickView, { once: true });
  }

  function closeQuickView() {
    const overlay = qs('.modal-overlay');
    const modal   = qs('.modal');
    if (overlay) overlay.classList.remove('open');
    if (modal)   modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  // ── Reveal animation ─────────────────────────────────────────────
  function applyRevealAnimation() {
    const els = qsa('.reveal');
    if (!els.length) return;
    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); } });
      }, { threshold: 0.10 });
      els.forEach(el => obs.observe(el));
    } else {
      els.forEach(el => el.classList.add('in'));
    }
  }

  // ── Button ripple ────────────────────────────────────────────────
  function bindRipples() {
    document.addEventListener('pointerdown', e => {
      const btn = e.target.closest?.('.ripple');
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      btn.style.setProperty('--x', ((e.clientX - r.left) / r.width  * 100) + '%');
      btn.style.setProperty('--y', ((e.clientY - r.top)  / r.height * 100) + '%');
    }, { passive: true });
  }

  // ── Nav init (runs on every page) ────────────────────────────────
  function initNav() {
    // Cart open buttons
    qsa('[data-cart-open]').forEach(btn => btn.addEventListener('click', () => {
      openDrawerIfExists();
      renderCartDrawer();
    }));

    // Close drawer on overlay click
    qs('.drawer-overlay')?.addEventListener('click', closeDrawerIfExists);

    // Escape key closes drawer + modal
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') { closeDrawerIfExists(); closeQuickView(); }
    });
  }

  // ── Sidebar totals (checkout / payment pages) ────────────────────
  function initSidebarTotals() {
    if (!qs('[data-t-grand]')) return;
    const cart = loadCart();
    writeTotals(calcTotals(cart, ''));
  }

  // ── Menu page category select ────────────────────────────────────
  function initMenuPage() {
    // Coupon apply button
    qs('[data-apply-coupon]')?.addEventListener('click', renderCartDrawer);
    // renderMenuCards() is called by menu.html after category pills are built
  }

  // ── Init ─────────────────────────────────────────────────────────
  function init() {
    bindRipples();
    updateCartCountUI();
    initNav();
    renderCartDrawer();
    initMenuPage();
    initSidebarTotals();
    applyRevealAnimation();

    // Coupon apply with live feedback
    document.addEventListener('click', e => {
      if (!e.target.closest('[data-apply-coupon]')) return;
      const input  = qs('[data-coupon]');
      if (!input) return;
      const result = validateCoupon(input.value);
      // Show feedback
      let msgEl = qs('[data-coupon-msg]');
      if (!msgEl) {
        msgEl = document.createElement('div');
        msgEl.setAttribute('data-coupon-msg', '');
        msgEl.style.cssText = 'font-size:.82rem;margin-top:6px;min-height:18px;font-weight:600;';
        input.parentNode.parentNode.appendChild(msgEl);
      }
      msgEl.textContent  = result.msg;
      msgEl.style.color  = result.ok ? 'rgba(34,197,94,.9)' : 'rgba(244,63,94,.85)';
      // Re-render totals
      renderCartDrawer();
    });

    // Show available coupons hint below coupon input
    const couponField = qs('[data-coupon]');
    if (couponField) {
      const coupons   = getCoupons().filter(c => c.active !== false);
      const hint      = document.createElement('div');
      hint.style.cssText = 'margin-top:8px;display:flex;gap:6px;flex-wrap:wrap;';
      coupons.forEach(c => {
        const pill = document.createElement('button');
        pill.type  = 'button';
        pill.style.cssText = `padding:4px 10px;border-radius:999px;font-size:.75rem;font-weight:700;
          border:1px solid rgba(212,165,116,.3);background:rgba(212,165,116,.1);
          color:rgba(250,245,237,.85);cursor:pointer;font:inherit;font-size:.75rem;`;
        pill.textContent = c.code;
        pill.title       = c.description || '';
        pill.addEventListener('click', () => {
          couponField.value = c.code;
          qs('[data-apply-coupon]')?.click();
        });
        hint.appendChild(pill);
      });
      couponField.parentNode.parentNode.appendChild(hint);
    }
  }

  // ── Public API ───────────────────────────────────────────────────
  window.BB = { addToCart, toggleFavorite, loadCart, saveCart, calcTotals, renderMenuCards, renderCartDrawer, getCoupons, validateCoupon };

  document.addEventListener('DOMContentLoaded', init);

})();
