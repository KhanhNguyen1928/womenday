// ✅ script.js — phiên bản ổn định, sửa lỗi xoay sai thứ tự & chồng chéo

// ---------- Elements ----------
const sidebar = document.getElementById("sidebar");
const openMenu = document.getElementById("openMenu");
const closeMenu = document.getElementById("closeMenu");
const toggleViewBtn = document.getElementById("toggleView");
const toggle3DBtn = document.getElementById("toggle3D");
const messageContainer = document.getElementById("messageContainer");
const navList = document.getElementById("navList");
const navItems = navList ? navList.querySelectorAll("li") : [];
const carouselPrev = document.getElementById("carouselPrev");
const carouselNext = document.getElementById("carouselNext");

function messages() {
  return Array.from(document.querySelectorAll(".message"));
}

// ---------- Sidebar ----------
openMenu?.addEventListener("click", () => sidebar.classList.add("active"));
closeMenu?.addEventListener("click", () => sidebar.classList.remove("active"));

// ---------- Toggle view ----------
toggleViewBtn?.addEventListener("click", () => {
  messageContainer.classList.toggle("compact");
  if (messageContainer.classList.contains("compact")) {
    disableCarouselMode();
  }
});

// ---------- 3D Carousel ----------
let carouselOn = false;
let autoRotateInterval = null;
let centerIndex = 0;
let focusedIndex = -1;

const spread = 36; // độ cách đều giữa các thẻ
const radiusBase = 550; // khoảng cách ra trước

function isMobile() {
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function handleToggle3DClick() {
  if (isMobile()) {
    const notice = document.getElementById("mobileNotice");
    notice.style.display = "block";
    notice.scrollIntoView({ behavior: "smooth" });
    return;
  }
  carouselOn = !carouselOn;
  messageContainer.classList.toggle("carousel", carouselOn);
  if (carouselOn) startCarousel();
  else disableCarouselMode();
}
toggle3DBtn?.addEventListener("click", handleToggle3DClick);

function startCarousel() {
  const cards = messages();
  if (!cards.length) return;
  focusedIndex = -1;
  cards.forEach(c => c.classList.remove("focused"));
  centerIndex = Math.floor(cards.length / 2);
  renderCarouselTransforms();
  if (!autoRotateInterval)
    autoRotateInterval = setInterval(() => stepCenterIndex(1), 2500);
  bindCarouselButtons();
  addFocusHandlers();
}

function disableCarouselMode() {
  clearInterval(autoRotateInterval);
  autoRotateInterval = null;
  focusedIndex = -1;
  messageContainer.classList.remove("carousel");
  messages().forEach(c => {
    c.style.transform = "";
    c.style.zIndex = "";
    c.style.opacity = "";
    c.classList.remove("focused");
  });
  unbindCarouselButtons();
}

function stepCenterIndex(delta) {
  const cards = messages();
  if (!cards.length) return;
  centerIndex = mod(centerIndex + delta, cards.length);
  renderCarouselTransforms();
}

function mod(n, m) {
  return ((n % m) + m) % m;
}

function renderCarouselTransforms() {
  const cards = messages();
  const count = cards.length;
  const radius = radiusBase;
  const angleStep = 360 / count; // góc giữa các thẻ (chia đều trên vòng tròn)

  cards.forEach((card, i) => {
    const angle = (i - centerIndex) * angleStep;
    const rotateY = angle;
    const translateZ = radius;
    const opacity = 1 - Math.min(0.8, Math.abs(angle) / 180);

    card.style.left = "50%";
    card.style.top = "50%";
    card.style.transform = `translate(-50%, -50%) rotateY(${rotateY}deg) translateZ(${translateZ}px)`;
    card.style.opacity = opacity;
    card.style.zIndex = Math.round(1000 - Math.abs(angle));
  });

  // làm nổi bật thẻ trung tâm
  if (cards[centerIndex]) {
    cards.forEach(c => c.classList.remove("focused"));
    cards[centerIndex].classList.add("focused");
  }
}

// ---------- Buttons ----------
function bindCarouselButtons() {
  carouselPrev?.addEventListener("click", onPrev);
  carouselNext?.addEventListener("click", onNext);
}
function unbindCarouselButtons() {
  carouselPrev?.removeEventListener("click", onPrev);
  carouselNext?.removeEventListener("click", onNext);
}
function onPrev() {
  if (focusedIndex !== -1) {
    unfocusCard();
    return;
  }
  stepCenterIndex(-1);
}
function onNext() {
  if (focusedIndex !== -1) {
    unfocusCard();
    return;
  }
  stepCenterIndex(1);
}

// ---------- Focus cards ----------
function addFocusHandlers() {
  messages().forEach((card, i) => {
    card.onclick = () => {
      if (!messageContainer.classList.contains("carousel")) return;
      if (focusedIndex === i) unfocusCard();
      else focusCard(i);
    };
  });
}

function focusCard(index) {
  focusedIndex = index;
  clearInterval(autoRotateInterval);
  autoRotateInterval = null;
  const cards = messages();
  cards.forEach((c, i) =>
    c.classList.toggle("focused", i === focusedIndex)
  );
  centerIndex = index;
  renderCarouselTransforms();
}

function unfocusCard() {
  focusedIndex = -1;
  messages().forEach(c => c.classList.remove("focused"));
  if (!autoRotateInterval)
    autoRotateInterval = setInterval(() => stepCenterIndex(1), 2500);
}

// ---------- Drag swipe ----------
let dragging = false,
  dragStartX = 0,
  dragAccum = 0;

messageContainer.addEventListener("mousedown", e => {
  if (!messageContainer.classList.contains("carousel")) return;
  if (focusedIndex !== -1) return;
  dragging = true;
  dragStartX = e.clientX;
  dragAccum = 0;
  clearInterval(autoRotateInterval);
});
document.addEventListener("mousemove", e => {
  if (!dragging) return;
  const dx = e.clientX - dragStartX;
  dragStartX = e.clientX;
  dragAccum += dx;
});
document.addEventListener("mouseup", e => {
  if (!dragging) return;
  dragging = false;
  const steps = Math.round(dragAccum / 120) * -1;
  if (steps !== 0) stepCenterIndex(steps);
  if (!autoRotateInterval)
    autoRotateInterval = setInterval(() => stepCenterIndex(1), 2500);
});

// ---------- Nav highlight ----------
if (navItems.length) {
  navItems.forEach((item, idx) => {
    item.addEventListener("click", () => {
      navItems.forEach(n => n.classList.remove("active"));
      item.classList.add("active");
      const id = item.dataset.target;
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: "smooth" });
    });
  });
}
