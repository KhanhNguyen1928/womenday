// updated script.js — carousel with wrap-around (infinite loop)
// ---------- Elements ----------
const sidebar = document.getElementById('sidebar');
const openMenu = document.getElementById('openMenu');
const closeMenu = document.getElementById('closeMenu');
const toggleViewBtn = document.getElementById('toggleView');
const toggle3DBtn = document.getElementById('toggle3D');
const messageContainer = document.getElementById('messageContainer');
const navList = document.getElementById('navList');
const navItems = navList ? navList.querySelectorAll('li') : [];
const carouselPrev = document.getElementById('carouselPrev');
const carouselNext = document.getElementById('carouselNext');

function messages() { return Array.from(document.querySelectorAll('.message')); }

// ---------- Sidebar open/close (desktop) ----------
openMenu?.addEventListener('click', () => sidebar.classList.add('active'));
closeMenu?.addEventListener('click', () => sidebar.classList.remove('active'));

// Touch swipe to open/close (desktop sidebar)
let touchStartX = 0;
document.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
});
document.addEventListener('touchend', (e) => {
  const endX = e.changedTouches[0].clientX;
  if (endX - touchStartX > 80) sidebar.classList.add('active');
  if (touchStartX - endX > 80) sidebar.classList.remove('active');
});

// ---------- Compact toggle (thu gọn) ----------
toggleViewBtn?.addEventListener('click', () => {
  messageContainer.classList.toggle('compact');
  if (messageContainer.classList.contains('compact')) {
    disableCarouselMode();
  }
});

// ---------- Carousel (3D) core with wrap-around ----------
let carouselOn = false;
let autoRotateInterval = null;
let centerIndex = 0; // index of the card that is centered
let focusedIndex = -1; // -1 none focused
const spread = 40; // degrees between items (tweakable)

/* ---------- device check ---------- */
function isMobile() {
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/* ---------- Toggle 3D mode (desktop only) ---------- */
function handleToggle3DClick() {
  if (isMobile()) {
    const mobileNotice = document.getElementById('mobileNotice');
    if (mobileNotice) {
      mobileNotice.style.display = 'block';
      mobileNotice.scrollIntoView({ behavior: 'smooth' });
    } else {
      alert("⚠️ Chế độ 3D không khả dụng trên điện thoại. Vui lòng sử dụng máy tính để xem hiệu ứng 3D.");
    }
    return;
  }

  carouselOn = !carouselOn;
  messageContainer.classList.toggle('carousel', carouselOn);
  if (carouselOn) startCarousel();
  else disableCarouselMode();
}

if (toggle3DBtn) {
  toggle3DBtn.removeEventListener('click', handleToggle3DClick);
  toggle3DBtn.addEventListener('click', handleToggle3DClick);
}

/* ---------- carousel functions (unchanged) ---------- */
function startCarousel() {
  const cards = messages();
  if (!cards.length) return;
  focusedIndex = -1;
  cards.forEach(c => c.classList.remove('focused'));
  centerIndex = Math.floor(cards.length / 2);
  renderCarouselTransforms(true);
  if (!autoRotateInterval) {
    autoRotateInterval = setInterval(() => { stepCenterIndex(1); }, 2400);
  }
  bindCarouselButtons();
  addFocusHandlers();
}
function disableCarouselMode() {
  messageContainer.classList.remove('carousel');
  clearInterval(autoRotateInterval);
  autoRotateInterval = null;
  focusedIndex = -1;
  messages().forEach(card => {
    card.style.left = '';
    card.style.top = '';
    card.style.transform = '';
    card.style.opacity = '';
    card.style.zIndex = '';
    card.classList.remove('focused');
  });
  unbindCarouselButtons();
}
function stepCenterIndex(delta, animate = true) {
  const cards = messages();
  if (!cards.length) return;
  centerIndex = mod(centerIndex + delta, cards.length);
  if (animate) animateCenterTo(centerIndex, 260);
  else renderCarouselTransforms();
}
function renderCarouselTransforms(instant = false) {
  const cards = messages();
  const count = cards.length;
  const radius = Math.min(520, 130 * count);
  for (let i = 0; i < count; i++) {
    let offset = shortestIndexDistance(centerIndex, i, count);
    const base = offset * spread;
    const rotateY = base;
    const translateX = (base / (spread * 1.2)) * 260;
    const translateZ = radius - Math.abs(base) * 6;
    const card = cards[i];
    card.style.left = '50%';
    card.style.top = '50%';
    if (card.classList.contains('focused')) {
      card.style.transform = `translate(-50%,-50%) translateX(${translateX}px) rotateY(${rotateY}deg) translateZ(${translateZ}px)`;
      card.style.zIndex = 2000;
      card.style.opacity = 1;
    } else {
      card.style.transform = `translate(-50%,-50%) translateX(${translateX}px) rotateY(${rotateY}deg) translateZ(${translateZ}px)`;
      const opacity = 1 - Math.min(0.85, Math.abs(base) / (spread * (count / 2) + 1));
      card.style.opacity = opacity;
      card.style.zIndex = Math.round(1000 - Math.abs(base));
    }
    if (instant) {
      card.style.transition = 'none';
      void card.offsetWidth;
      card.style.transition = '';
    }
  }
}
function shortestIndexDistance(center, idx, n) {
  let diff = idx - center;
  diff = ((diff + n/2 + n) % n) - n/2;
  if (n % 2 === 0 && diff === -n/2) diff = n/2;
  return diff;
}
function animateCenterTo(targetIndex, ms = 300) {
  const startIndex = centerIndex;
  const count = messages().length;
  let diff = targetIndex - startIndex;
  diff = ((diff + count/2 + count) % count) - count/2;
  const startTime = performance.now();
  function step(now) {
    const t = Math.min(1, (now - startTime) / ms);
    const ease = 1 - Math.pow(1 - t, 3);
    const fracCenter = startIndex + diff * ease;
    renderCarouselWithFractionalCenter(fracCenter);
    if (t < 1) requestAnimationFrame(step);
    else {
      centerIndex = mod(targetIndex, count);
      renderCarouselTransforms();
    }
  }
  requestAnimationFrame(step);
}
function renderCarouselWithFractionalCenter(fracCenter) {
  const cards = messages();
  const count = cards.length;
  const radius = Math.min(520, 130 * count);
  for (let i = 0; i < count; i++) {
    let raw = i - fracCenter;
    raw = ((raw + count/2 + count) % count) - count/2;
    const base = raw * spread;
    const rotateY = base;
    const translateX = (base / (spread * 1.2)) * 260;
    const translateZ = radius - Math.abs(base) * 6;
    const card = cards[i];
    card.style.left = '50%';
    card.style.top = '50%';
    card.style.transform = `translate(-50%,-50%) translateX(${translateX}px) rotateY(${rotateY}deg) translateZ(${translateZ}px)`;
    const opacity = 1 - Math.min(0.85, Math.abs(base) / (spread * (count / 2) + 1));
    card.style.opacity = opacity;
    card.style.zIndex = Math.round(1000 - Math.abs(base));
  }
}
function mod(n, m) { return ((n % m) + m) % m; }

// ---------- Prev/Next handlers ----------
function onPrev() { if (focusedIndex !== -1) { unfocusCard(); return; } stepCenterIndex(-1); }
function onNext() { if (focusedIndex !== -1) { unfocusCard(); return; } stepCenterIndex(1); }
function bindCarouselButtons() {
  if (!carouselPrev || !carouselNext) return;
  carouselPrev.addEventListener('click', onPrev);
  carouselNext.addEventListener('click', onNext);
}
function unbindCarouselButtons() {
  if (!carouselPrev || !carouselNext) return;
  carouselPrev.removeEventListener('click', onPrev);
  carouselNext.removeEventListener('click', onNext);
}

// ---------- Focus / unfocus card logic ----------
function addFocusHandlers() {
  messages().forEach((card, i) => {
    card.dataset._carouselIndex = i;
    card.onclick = (e) => {
      if (!messageContainer.classList.contains('carousel')) return;
      const idx = Number(card.dataset._carouselIndex);
      if (focusedIndex === idx) unfocusCard(); else focusCard(idx);
    };
    card.onkeydown = (e) => {
      if (e.key === 'Enter' && messageContainer.classList.contains('carousel')) {
        const idx = Number(card.dataset._carouselIndex);
        if (focusedIndex === idx) unfocusCard(); else focusCard(idx);
      }
    };
  });
}
function focusCard(index) {
  const cards = messages();
  if (index < 0 || index >= cards.length) return;
  focusedIndex = index;
  animateCenterTo(index, 220);
  cards.forEach((c, i) => c.classList.toggle('focused', i === index));
  clearInterval(autoRotateInterval);
  autoRotateInterval = null;
}
function unfocusCard() {
  const cards = messages();
  focusedIndex = -1;
  cards.forEach(c => c.classList.remove('focused'));
  if (!autoRotateInterval && messageContainer.classList.contains('carousel')) {
    autoRotateInterval = setInterval(() => stepCenterIndex(1), 2400);
  }
}

// ---------- Drag / swipe behavior ----------
let dragging = false, dragStartX = 0, dragAccum = 0;
messageContainer.addEventListener('mousedown', (e) => {
  if (!messageContainer.classList.contains('carousel')) return;
  if (focusedIndex !== -1) return;
  dragging = true; dragStartX = e.clientX; dragAccum = 0;
  clearInterval(autoRotateInterval); autoRotateInterval = null;
});
document.addEventListener('mousemove', (e) => {
  if (!dragging) return;
  const dx = e.clientX - dragStartX;
  dragStartX = e.clientX;
  dragAccum += dx;
  const cards = messages();
  if (cards.length) {
    const sensitivity = 300;
    let frac = -dragAccum / sensitivity;
    renderCarouselWithFractionalCenter(centerIndex + frac);
  }
});
document.addEventListener('mouseup', (e) => {
  if (!dragging) return;
  dragging = false;
  const sensitivity = 120;
  const steps = Math.round(dragAccum / sensitivity) * -1;
  if (steps !== 0) stepCenterIndex(steps);
  else renderCarouselTransforms();
  if (!autoRotateInterval && messageContainer.classList.contains('carousel')) {
    autoRotateInterval = setInterval(() => stepCenterIndex(1), 2400);
  }
});
document.addEventListener('touchstart', (e) => {
  if (!messageContainer.classList.contains('carousel')) return;
  if (focusedIndex !== -1) return;
  dragStartX = e.touches[0].clientX; dragAccum = 0;
  clearInterval(autoRotateInterval); autoRotateInterval = null;
});
document.addEventListener('touchmove', (e) => {
  if (!messageContainer.classList.contains('carousel')) return;
  const dx = e.touches[0].clientX - dragStartX;
  dragStartX = e.touches[0].clientX;
  dragAccum += dx;
  const sensitivity = 300;
  const frac = -dragAccum / sensitivity;
  renderCarouselWithFractionalCenter(centerIndex + frac);
});
document.addEventListener('touchend', (e) => {
  if (!messageContainer.classList.contains('carousel')) return;
  const sensitivity = 120;
  const steps = Math.round(dragAccum / sensitivity) * -1;
  if (steps !== 0) stepCenterIndex(steps);
  else renderCarouselTransforms();
  if (!autoRotateInterval && messageContainer.classList.contains('carousel')) {
    autoRotateInterval = setInterval(() => stepCenterIndex(1), 2400);
  }
});

// ---------- NAV column: click to scroll & highlight ----------
if (navItems.length) {
  navItems.forEach((item, idx) => {
    item.addEventListener('click', () => {
      const id = item.dataset.target;
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      sidebar.classList.remove('active');
    });
  });
}

// observe which message is in view -> highlight nav (desktop grid & mobile)
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      const targetItem = [...navItems].find(n => n.dataset.target === id);
      if (targetItem) {
        navItems.forEach(n => n.classList.remove('active'));
        targetItem.classList.add('active');
      }
    }
  });
}, { threshold: 0.6 });

document.querySelectorAll('.message').forEach(m => observer.observe(m));

/* ---------- MOBILE MENU (in-flow dropdown) ---------- */
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');

if (mobileMenu && mobileMenuBtn) {
  mobileMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = mobileMenu.classList.toggle('open');
    mobileMenu.setAttribute('aria-hidden', String(!isOpen));
    mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
    // scroll menu into view so user sees it
    if (isOpen) {
      mobileMenu.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  // close menu when clicking a link inside
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      mobileMenu.setAttribute('aria-hidden', 'true');
      mobileMenuBtn.setAttribute('aria-expanded', 'false');
    });
  });

  // close menu when tapping outside (optional helpful behavior)
  document.addEventListener('click', (ev) => {
    if (!mobileMenu.contains(ev.target) && ev.target !== mobileMenuBtn) {
      if (mobileMenu.classList.contains('open')) {
        mobileMenu.classList.remove('open');
        mobileMenu.setAttribute('aria-hidden', 'true');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      }
    }
  }, { passive: true });
}
