// =====================================================
// script.js
// =====================================================

// =====================================================
// 0) 공통 요소 선택
// =====================================================
const mainPage = document.getElementById('main-page');
const portfolioPage = document.getElementById('portfolio-page');
const detailPage = document.getElementById('detail-page');
const cvPage = document.getElementById('cv-page');

const mainTitle = document.getElementById('main-title');

const topBar = document.getElementById('top-bar');
const topLogo = document.getElementById('top-logo');
const aboutBtn = document.getElementById('about-btn');
const cvBtn = document.getElementById('cv-btn');
const contactBtn = document.getElementById('contact-btn');

const thumbnailsContainer = document.getElementById('thumbnails-container');

const detailPrev = document.getElementById('detail-prev');
const detailNext = document.getElementById('detail-next');

const detailTitleEl = document.getElementById('detail-title');
const detailSubtitleEl = document.getElementById('detail-subtitle');
const detailYearEl = document.getElementById('detail-year');
const detailSpecsEl = document.getElementById('detail-specs');
const detailSizeEl = document.getElementById('detail-size');
const detailClientEl = document.getElementById('detail-client');
const detailDescriptionEl = document.getElementById('detail-description');

const detailMainImageEl = document.getElementById('detail-main-image');
const detailImagesEl = document.getElementById('detail-images');

const detailSpecsContainer = document.getElementById('detail-specs-container');
const detailSizeContainer = document.getElementById('detail-size-container');
const detailClientContainer = document.getElementById('detail-client-container');

const detailStripTrack = document.getElementById('detail-strip-track');
const detailStripLeft = document.getElementById('detail-strip-left');
const detailStripRight = document.getElementById('detail-strip-right');

let currentProjectIndex = -1;

// =====================================================
// ✅ 유틸
// =====================================================
function getImageSrc(item) {
  if (!item) return '';
  if (typeof item === 'string') return item;
  if (typeof item === 'object' && item.src) return item.src;
  return '';
}

function buildFallbackCandidates(src) {
  if (!src) return [];
  const [path, query] = src.split('?');
  const q = query ? `?${query}` : '';
  const m = path.match(/^(.*)\.([^.\/]+)$/);
  if (!m) return [src];
  const base = m[1];
  const ext = (m[2] || '').toLowerCase();

  const map = { jpg: ['gif', 'png'], jpeg: ['gif', 'png'], gif: ['jpg', 'png'], png: ['gif', 'jpg'], webp: ['gif', 'jpg'] };
  const alts = map[ext] || ['gif', 'jpg'];
  const candidates = [`${base}.${ext}${q}`, ...alts.map(e => `${base}.${e}${q}`)];
  return [...new Set(candidates)].slice(0, 3);
}

function setImageSrcWithFallback(imgEl, src) {
  if (!imgEl) return;
  const attempts = buildFallbackCandidates(src);
  if (!attempts.length) { imgEl.removeAttribute('src'); return; }

  imgEl.dataset.srcAttempts = JSON.stringify(attempts);
  imgEl.dataset.srcAttemptIndex = '0';
  imgEl.src = attempts[0];

  imgEl.onerror = () => {
    const list = JSON.parse(imgEl.dataset.srcAttempts || '[]');
    let i = parseInt(imgEl.dataset.srcAttemptIndex || '0', 10);
    i += 1;
    if (i < list.length) {
      imgEl.dataset.srcAttemptIndex = String(i);
      imgEl.src = list[i];
      return;
    }
    imgEl.onerror = null;
  };
}

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

// =====================================================
// 1) 페이지 전환
// =====================================================
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  page.classList.add('active');

  // ✅ [변경] 포트폴리오 페이지 진입 시 "랜덤 셔플"하지 않고,
  // projects-data.js에 정의된 원래 순서대로 렌더링
  if (page === portfolioPage) createThumbnails({ shuffle: false });

  if (page === mainPage) topBar?.classList.add('hidden');
  else topBar?.classList.remove('hidden');
}
showPage(mainPage);

mainTitle?.addEventListener('click', () => showPage(portfolioPage));
topLogo?.addEventListener('click', () => showPage(portfolioPage));
aboutBtn?.addEventListener('click', () => showPage(mainPage));
cvBtn?.addEventListener('click', () => showPage(cvPage));
contactBtn?.addEventListener('click', () => window.open('https://www.instagram.com/chales9/', '_blank', 'noopener'));

// =====================================================
// 2) 상세 prev/next
// =====================================================
function updateDetailNavButtons() {
  if (!detailPrev || !detailNext || !Array.isArray(projects)) return;
  if (currentProjectIndex <= 0) detailPrev.classList.add('disabled');
  else detailPrev.classList.remove('disabled');

  if (currentProjectIndex >= projects.length - 1) detailNext.classList.add('disabled');
  else detailNext.classList.remove('disabled');
}

detailPrev?.addEventListener('click', () => {
  if (currentProjectIndex <= 0) return;
  const prev = projects[currentProjectIndex - 1];
  if (prev) showProjectDetail(prev.id);
});

detailNext?.addEventListener('click', () => {
  if (!Array.isArray(projects)) return;
  if (currentProjectIndex >= projects.length - 1) return;
  const next = projects[currentProjectIndex + 1];
  if (next) showProjectDetail(next.id);
});

// =====================================================
// 3) 캔버스 + 마퀴바(패들)
// =====================================================
const canvas = document.getElementById('canvas');
const ctx = canvas?.getContext('2d');
const marqueeBar = document.getElementById('marquee-bar');
const marqueeInner = document.getElementById('marquee-inner');
const marqueeText1 = document.getElementById('marquee-text-1');

let paddleWidth = 0;
let paddleHeight = 0;
let paddleX = 0;
let paddleTop = 0;
let paddleBottom = 0;
let paddleVX = 0;

// -----------------------------------------------------
// ✅ 텍스트 잉크 박스
// -----------------------------------------------------
function getTextInkRect(el) {
  if (!el) return null;
  const range = document.createRange();
  range.selectNodeContents(el);
  const rect = range.getBoundingClientRect();
  range.detach?.();
  return rect;
}

// -----------------------------------------------------
// ✅ 모바일 기준값을 화면폭 비율로 스케일링
// -----------------------------------------------------
function getMarqueeTuningByViewport() {
  const BASE_W = 390;

  const isMobile = window.innerWidth <= 768;

  const BASE_GAP = isMobile ? -24 : -15;        // ✅ 모바일만 더 붙이기
  const BASE_LEFT_NUDGE = isMobile ? 2.8 : 2.8; // 필요하면 같이

  const scale = clamp(window.innerWidth / BASE_W, 0.7, 3.2);

  return {
    GAP: BASE_GAP * scale,
    LEFT_NUDGE: BASE_LEFT_NUDGE * scale,
    RIGHT_NUDGE: 0
  };
}

// -----------------------------------------------------
// ✅ 타이틀 아래 마퀴바 정렬
// -----------------------------------------------------
function alignMarqueeToTitleUnderline() {
  if (!mainTitle || !marqueeBar) return;

  const rect = getTextInkRect(mainTitle);
  if (!rect || !rect.width) return;

  const { GAP, LEFT_NUDGE, RIGHT_NUDGE } = getMarqueeTuningByViewport();

  const left = rect.left + LEFT_NUDGE;
  const width = Math.max(0, rect.width - LEFT_NUDGE - RIGHT_NUDGE);
  const top = rect.bottom + GAP;

  marqueeBar.style.left = `${left.toFixed(2)}px`;
  marqueeBar.style.width = `${width.toFixed(2)}px`;
  marqueeBar.style.top = `${top.toFixed(2)}px`;
  marqueeBar.style.bottom = 'auto';

  syncPaddleFromDom();
}

function syncPaddleFromDom() {
  if (!marqueeBar) return;
  const rect = marqueeBar.getBoundingClientRect();
  paddleWidth = rect.width;
  paddleHeight = rect.height;
  paddleX = rect.left;
  paddleTop = rect.top;
  paddleBottom = rect.bottom;
}

function updatePaddleDomLeftOnly() {
  marqueeBar.style.left = `${paddleX.toFixed(2)}px`;
}

function clampPaddleX() {
  if (!canvas) return;
  const maxX = canvas.width - paddleWidth;
  if (paddleX < 0) paddleX = 0;
  if (paddleX > maxX) paddleX = maxX;
}

function resizeCanvas() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function setupMarqueeIntroOnce() {
  if (!marqueeBar || !marqueeInner || !marqueeText1) return;

  const barWidth = marqueeBar.getBoundingClientRect().width;
  const copyWidth = marqueeText1.getBoundingClientRect().width;
  if (!barWidth || !copyWidth) return;

  const START_VISIBLE_RATIO = 4 / 5;
  const introFromPx = Math.max(0, barWidth * (1 - START_VISIBLE_RATIO));

  const LOOP_SECONDS = 30;
  const pxPerSec = copyWidth / LOOP_SECONDS;
  const introSeconds = introFromPx / pxPerSec;

  marqueeInner.style.setProperty('--marquee-intro-from', `${introFromPx}px`);
  marqueeInner.style.setProperty('--marquee-intro-duration', `${introSeconds.toFixed(3)}s`);
  marqueeInner.style.setProperty('--marquee-loop-duration', `${LOOP_SECONDS}s`);
}

resizeCanvas();

function initAfterFontsReady() {
  alignMarqueeToTitleUnderline();
  setupMarqueeIntroOnce();
  syncPaddleFromDom();
}

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(initAfterFontsReady);
} else {
  window.addEventListener('load', initAfterFontsReady);
}

window.addEventListener('resize', () => {
  resizeCanvas();
  alignMarqueeToTitleUnderline();
  setupMarqueeIntroOnce();
  syncPaddleFromDom();
});

if (mainTitle && 'ResizeObserver' in window) {
  const ro = new ResizeObserver(() => {
    alignMarqueeToTitleUnderline();
    setupMarqueeIntroOnce();
  });
  ro.observe(mainTitle);
}

// -----------------------------------------------------
// ✅ 패들 드래그(좌우만)
// -----------------------------------------------------
let isDraggingPaddle = false;
let lastPointerX = 0;
let lastPointerTime = 0;

marqueeBar?.addEventListener('mousedown', (e) => {
  isDraggingPaddle = true;
  lastPointerX = e.clientX;
  lastPointerTime = performance.now();
  e.preventDefault();
});

window.addEventListener('mousemove', (e) => {
  if (!isDraggingPaddle) return;
  const now = performance.now();
  const dx = e.clientX - lastPointerX;
  const dt = now - lastPointerTime || 16;

  paddleVX = (dx / dt) * 16;

  syncPaddleFromDom();
  paddleX += dx;
  clampPaddleX();
  updatePaddleDomLeftOnly();

  lastPointerX = e.clientX;
  lastPointerTime = now;
  syncPaddleFromDom();
});

window.addEventListener('mouseup', () => { isDraggingPaddle = false; paddleVX = 0; });

marqueeBar?.addEventListener('touchstart', (e) => {
  if (e.touches.length === 0) return;
  const t = e.touches[0];
  isDraggingPaddle = true;
  lastPointerX = t.clientX;
  lastPointerTime = performance.now();
  e.preventDefault();
}, { passive: false });

window.addEventListener('touchmove', (e) => {
  if (!isDraggingPaddle || e.touches.length === 0) return;
  const t = e.touches[0];
  const now = performance.now();
  const dx = t.clientX - lastPointerX;
  const dt = now - lastPointerTime || 16;

  paddleVX = (dx / dt) * 16;

  syncPaddleFromDom();
  paddleX += dx;
  clampPaddleX();
  updatePaddleDomLeftOnly();

  lastPointerX = t.clientX;
  lastPointerTime = now;
  syncPaddleFromDom();

  e.preventDefault();
}, { passive: false });

const endTouch = () => { isDraggingPaddle = false; paddleVX = 0; };
window.addEventListener('touchend', endTouch);
window.addEventListener('touchcancel', endTouch);

// =====================================================
// 4) 스마일 볼
// =====================================================
class Ball {
  constructor(x, y, radius, color) {
    this.x = x; this.y = y;
    this.radius = radius;
    this.color = color;

    this.vx = (Math.random() - 0.5) * 25;
    this.vy = (Math.random() - 0.5) * 25;

    this.rotation = Math.random() * Math.PI * 3;
    this.rotationSpeed = (Math.random() - 0.5) * 0.6;
  }

  draw() {
    if (!ctx) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.lineWidth = 1;
    ctx.strokeStyle = this.color;
    ctx.stroke();

    ctx.strokeStyle = '#ffffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, this.radius * 0.1, this.radius * 0.5, 0, Math.PI);
    ctx.stroke();

    ctx.restore();
  }

  update() {
    if (!canvas) return;

    const prevY = this.y;
    this.x += this.vx;
    this.y += this.vy;

    if (this.x + this.radius > canvas.width) { this.x = canvas.width - this.radius; this.vx = -Math.abs(this.vx); }
    else if (this.x - this.radius < 0) { this.x = this.radius; this.vx = Math.abs(this.vx); }

    // 패들 충돌
    if (paddleHeight > 0) {
      const withinPaddleX =
        this.x >= (paddleX - this.radius) &&
        this.x <= (paddleX + paddleWidth + this.radius);

      if (this.vy < 0 && withinPaddleX) {
        const prevTop = (prevY - this.radius);
        const currTop = (this.y - this.radius);
        const crossedBottom = (prevTop > paddleBottom) && (currTop <= paddleBottom);

        if (crossedBottom) {
          this.y = paddleBottom + this.radius;
          this.vy = Math.abs(this.vy);
          this.vx += paddleVX * 0.8;
        }
      }

      if (this.vy > 0 && withinPaddleX) {
        const prevBottom = (prevY + this.radius);
        const currBottom = (this.y + this.radius);
        const crossedTop = (prevBottom < paddleTop) && (currBottom >= paddleTop);

        if (crossedTop) {
          this.y = paddleTop - this.radius;
          this.vy = -Math.abs(this.vy);
          this.vx += paddleVX * 0.2;
        }
      }
    }

    if (this.y + this.radius > canvas.height) { this.y = canvas.height - this.radius; this.vy = -Math.abs(this.vy); }
    if (this.y + this.radius < 0) this.recycleBall();

    this.rotation += this.rotationSpeed;
    this.draw();
  }

  recycleBall() {
    if (!canvas) return;
    this.x = this.radius + Math.random() * (canvas.width - this.radius * 2);
    this.y = canvas.height - this.radius - 5;
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = -(Math.random() * 2 + 1);
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.15;
  }
}

const balls = [];
const numBalls = 7;
const ballColor = '#ffffffff';
const MAX_BALLS = 80;
let lastSpawnTime = 0;

const COLLISION_CONFIG = {
  overlapCorrectionPercent: 0.9,
  overlapSlop: 0.1,
  restitution: 1.0,
};

function checkCollision(ball1, ball2) {
  if (!canvas) return;

  const dx = ball2.x - ball1.x;
  const dy = ball2.y - ball1.y;

  let dist = Math.hypot(dx, dy);
  if (dist === 0) dist = 0.0001;

  const minDist = ball1.radius + ball2.radius;
  if (dist >= minDist) return;

  const nx = dx / dist;
  const ny = dy / dist;

  const overlap = minDist - dist;

  const slop = COLLISION_CONFIG.overlapSlop;
  const percent = COLLISION_CONFIG.overlapCorrectionPercent;

  const correctionMag = Math.max(overlap - slop, 0) * percent;
  const correctionX = nx * (correctionMag / 2);
  const correctionY = ny * (correctionMag / 2);

  ball1.x -= correctionX;
  ball1.y -= correctionY;
  ball2.x += correctionX;
  ball2.y += correctionY;

  ball1.x = Math.min(canvas.width - ball1.radius, Math.max(ball1.radius, ball1.x));
  ball2.x = Math.min(canvas.width - ball2.radius, Math.max(ball2.radius, ball2.x));

  const rvx = ball2.vx - ball1.vx;
  const rvy = ball2.vy - ball1.vy;

  const velAlongNormal = rvx * nx + rvy * ny;
  if (velAlongNormal > 0) return;

  const e = COLLISION_CONFIG.restitution;
  const invMass1 = 1;
  const invMass2 = 1;

  const j = -(1 + e) * velAlongNormal / (invMass1 + invMass2);

  const impulseX = j * nx;
  const impulseY = j * ny;

  ball1.vx -= impulseX * invMass1;
  ball1.vy -= impulseY * invMass1;

  ball2.vx += impulseX * invMass2;
  ball2.vy += impulseY * invMass2;

  const now = performance.now();
  if (balls.length < MAX_BALLS && now - lastSpawnTime > 200) {
    balls.push(new Ball((ball1.x + ball2.x) / 2, (ball1.y + ball2.y) / 2, ball1.radius, ballColor));
    lastSpawnTime = now;
  }
}

if (canvas && ctx) {
  for (let i = 0; i < numBalls; i++) {
    const radius = 10;
    const x = radius + Math.random() * (canvas.width - radius * 2);
    const y = radius + Math.random() * (canvas.height - radius * 2);
    balls.push(new Ball(x, y, radius, ballColor));
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    syncPaddleFromDom();

    balls.forEach(b => b.update());

    for (let i = 0; i < balls.length; i++) {
      for (let j = i + 1; j < balls.length; j++) checkCollision(balls[i], balls[j]);
    }

    requestAnimationFrame(animate);
  }
  animate();
}

// =====================================================
// 5) 썸네일/상세
// =====================================================

// (유지) 셔플 함수는 나중에 "정렬 토글" 만들 때 다시 쓰려고 남겨둠
function shuffleArray(inputArray) {
  const arr = inputArray.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function createThumbnails(options = {}) {
  if (!thumbnailsContainer || !Array.isArray(projects)) return;
  thumbnailsContainer.innerHTML = '';

  // ✅ [변경] 기본값을 "셔플 안 함(false)"으로 변경
  // - 이전: (options.shuffle ?? true)  → 기본이 true라서 항상 랜덤
  // - 변경: (options.shuffle ?? false) → 기본이 false라서 원래 순서
  const list = (options.shuffle ?? false) ? shuffleArray(projects) : projects;

  list.forEach(project => {
    const thumbnail = document.createElement('div');
    thumbnail.className = 'thumbnail';

    const img = document.createElement('img');
    const first = (project.images && project.images[0]) ? project.images[0] : '';
    setImageSrcWithFallback(img, getImageSrc(first));
    img.alt = project.title || '';

    thumbnail.appendChild(img);
    thumbnail.addEventListener('click', () => showProjectDetail(project.id));
    thumbnailsContainer.appendChild(thumbnail);
  });
}

// ✅ [변경] 최초 렌더도 셔플 없이
createThumbnails({ shuffle: false });

function normalizeMainImageSize(value) {
  const v = String(value || '').toLowerCase();
  if (v === 's' || v === 'small') return 's';
  if (v === 'l' || v === 'large') return 'l';
  return 'm';
}
function normalizeText(value) {
  if (Array.isArray(value)) return value.filter(Boolean).join(' / ');
  if (typeof value === 'string') return value;
  return '';
}

// ✅ 스트립 클릭 가드(드래그 중 클릭 방지)
let stripIsPointerDown = false;
let stripMoved = false;
let stripStartX = 0;
let stripStartY = 0;
let stripStartScrollLeft = 0;
let stripSuppressClickUntil = 0;
const STRIP_MOVE_THRESHOLD = 10;

function shouldSuppressStripClick() {
  return stripMoved || Date.now() < stripSuppressClickUntil;
}

function initStripDragGuard() {
  if (!detailStripTrack) return;

  detailStripTrack.addEventListener('touchstart', (e) => {
    if (e.touches.length === 0) return;
    const t = e.touches[0];
    stripIsPointerDown = true;
    stripMoved = false;
    stripStartX = t.clientX;
    stripStartY = t.clientY;
    stripStartScrollLeft = detailStripTrack.scrollLeft;
  }, { passive: true });

  detailStripTrack.addEventListener('touchmove', (e) => {
    if (!stripIsPointerDown || e.touches.length === 0) return;
    const t = e.touches[0];
    const dx = Math.abs(t.clientX - stripStartX);
    const dy = Math.abs(t.clientY - stripStartY);
    const scrolled = Math.abs(detailStripTrack.scrollLeft - stripStartScrollLeft) > 2;

    if (dx > STRIP_MOVE_THRESHOLD || dy > STRIP_MOVE_THRESHOLD || scrolled) {
      stripMoved = true;
      stripSuppressClickUntil = Date.now() + 350;
    }
  }, { passive: true });

  detailStripTrack.addEventListener('touchend', () => { stripIsPointerDown = false; }, { passive: true });
  detailStripTrack.addEventListener('touchcancel', () => { stripIsPointerDown = false; stripMoved = false; }, { passive: true });

  detailStripTrack.addEventListener('scroll', () => { stripSuppressClickUntil = Date.now() + 250; }, { passive: true });

  detailStripTrack.addEventListener('click', (e) => {
    if (!shouldSuppressStripClick()) return;
    e.preventDefault();
    e.stopPropagation();
  }, true);
}
initStripDragGuard();

function buildDetailBottomStrip() {
  if (!detailStripTrack || !Array.isArray(projects)) return;
  detailStripTrack.innerHTML = '';

  projects.forEach(p => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'detail-strip-thumb';
    btn.dataset.projectId = String(p.id);

    const img = document.createElement('img');
    const first = (p.images && p.images[0]) ? p.images[0] : '';
    setImageSrcWithFallback(img, getImageSrc(first));
    img.alt = p.title || '';
    btn.appendChild(img);

    btn.addEventListener('click', (e) => {
      if (shouldSuppressStripClick()) { e.preventDefault(); e.stopPropagation(); return; }
      showProjectDetail(p.id);
    });

    detailStripTrack.appendChild(btn);
  });
}

function setActiveStrip(projectId) {
  if (!detailStripTrack) return;
  const id = String(projectId);
  detailStripTrack.querySelectorAll('.detail-strip-thumb').forEach(t => {
    if (t.dataset.projectId === id) t.classList.add('is-active');
    else t.classList.remove('is-active');
  });

  const active = detailStripTrack.querySelector('.detail-strip-thumb.is-active');
  active?.scrollIntoView?.({ behavior: 'smooth', inline: 'center', block: 'nearest' });
}

function scrollStripBy(direction) {
  if (!detailStripTrack) return;
  const amount = Math.max(240, Math.floor(window.innerWidth * 0.65));
  detailStripTrack.scrollBy({ left: direction * amount, behavior: 'smooth' });
  stripSuppressClickUntil = Date.now() + 250;
}

detailStripLeft?.addEventListener('click', () => scrollStripBy(-1));
detailStripRight?.addEventListener('click', () => scrollStripBy(1));

buildDetailBottomStrip();

function showProjectDetail(projectId) {
  if (!Array.isArray(projects)) return;
  const index = projects.findIndex(p => p.id === projectId);
  if (index === -1) return;

  currentProjectIndex = index;
  const project = projects[index];

  detailTitleEl && (detailTitleEl.textContent = project.title || '');
  detailSubtitleEl && (detailSubtitleEl.textContent = normalizeText(project.subtitle));
  detailYearEl && (detailYearEl.textContent = project.year || '');

  const specsText = normalizeText(project.specs);
  if (detailSpecsEl && detailSpecsContainer) {
    if (specsText) { detailSpecsEl.textContent = specsText; detailSpecsContainer.style.display = 'flex'; }
    else { detailSpecsEl.textContent = ''; detailSpecsContainer.style.display = 'none'; }
  }

  const sizeText = normalizeText(project.size);
  if (detailSizeEl && detailSizeContainer) {
    if (sizeText) { detailSizeEl.textContent = sizeText; detailSizeContainer.style.display = 'flex'; }
    else { detailSizeEl.textContent = ''; detailSizeContainer.style.display = 'none'; }
  }

  const clientText = normalizeText(project.client);
  if (detailClientEl && detailClientContainer) {
    if (clientText) { detailClientEl.textContent = clientText; detailClientContainer.style.display = 'flex'; }
    else { detailClientEl.textContent = ''; detailClientContainer.style.display = 'none'; }
  }

  detailDescriptionEl && (detailDescriptionEl.innerHTML = project.description || '');

  const images = project.images || [];
  detailMainImageEl && (detailMainImageEl.innerHTML = '');
  detailImagesEl && (detailImagesEl.innerHTML = '');

  const mainSize = normalizeMainImageSize(project.mainImageSize);

  if (images.length > 0 && detailMainImageEl) {
    const src = getImageSrc(images[0]);
    if (src) {
      const img = document.createElement('img');
      setImageSrcWithFallback(img, src);
      img.alt = project.title || '';
      img.classList.add(`main-img-${mainSize}`);
      detailMainImageEl.appendChild(img);
    }
  }

  if (detailImagesEl && images.length > 1) {
    for (let i = 1; i < images.length; i++) {
      const item = images[i];
      const src = getImageSrc(item);
      if (!src) continue;

      const img = document.createElement('img');
      setImageSrcWithFallback(img, src);
      img.alt = project.title || '';

      if (item && typeof item === 'object' && item.span === 2) {
        img.style.gridColumn = '1 / -1';
        img.classList.add('span-2');
      }
      detailImagesEl.appendChild(img);
    }
  }

  setActiveStrip(project.id);
  showPage(detailPage);
  detailPage && (detailPage.scrollTop = 0);
  updateDetailNavButtons();
}

// =====================================================
// 6) 모바일: 상세 스와이프(prev/next)
// =====================================================
if (detailPage) {
  let touchStartX = 0;
  let touchStartY = 0;

  const SWIPE_THRESHOLD = 50;
  const VERTICAL_LIMIT = 40;

  detailPage.addEventListener('touchstart', (e) => {
    if (e.touches.length === 0) return;
    const t = e.touches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
  }, { passive: true });

  detailPage.addEventListener('touchend', (e) => {
    if (e.changedTouches.length === 0) return;
    const t = e.changedTouches[0];

    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;

    if (Math.abs(dy) > VERTICAL_LIMIT) return;
    if (Math.abs(dx) < SWIPE_THRESHOLD) return;

    if (!Array.isArray(projects)) return;

    if (dx > 0) {
      if (currentProjectIndex > 0) showProjectDetail(projects[currentProjectIndex - 1].id);
    } else {
      if (currentProjectIndex < projects.length - 1) showProjectDetail(projects[currentProjectIndex + 1].id);
    }
  }, { passive: true });
}
