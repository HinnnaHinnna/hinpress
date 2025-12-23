// =====================================================
// script.js
// projects-data.js가 먼저 로드되어야 함!
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

// ✅ 하단 썸네일 스트립 요소
const detailStripTrack = document.getElementById('detail-strip-track');
const detailStripLeft = document.getElementById('detail-strip-left');
const detailStripRight = document.getElementById('detail-strip-right');

let currentProjectIndex = -1;

// =====================================================
// ✅ 유틸: images 아이템이 문자열이든 객체든 src 꺼내기
// =====================================================
function getImageSrc(item) {
  if (!item) return '';
  if (typeof item === 'string') return item;
  if (typeof item === 'object' && item.src) return item.src;
  return '';
}

// =====================================================
// 1) 페이지 전환
// =====================================================
function showPage(page) {
  const pages = document.querySelectorAll('.page');
  pages.forEach((p) => p.classList.remove('active'));
  page.classList.add('active');

  // 포트폴리오 페이지 열릴 때마다 썸네일 랜덤
  if (page === portfolioPage) {
    createThumbnails({ shuffle: true });
  }

  // 메인에서는 상단바 숨김
  if (page === mainPage) topBar?.classList.add('hidden');
  else topBar?.classList.remove('hidden');
}

// 최초 메인
showPage(mainPage);

// 네비게이션
if (mainTitle) mainTitle.addEventListener('click', () => showPage(portfolioPage));
if (topLogo) topLogo.addEventListener('click', () => showPage(portfolioPage));
if (aboutBtn) aboutBtn.addEventListener('click', () => showPage(mainPage));
if (cvBtn) cvBtn.addEventListener('click', () => showPage(cvPage));
if (contactBtn) {
  contactBtn.addEventListener('click', () => {
    window.open('https://www.instagram.com/chales9/', '_blank', 'noopener');
  });
}

// =====================================================
// 2) 상세 페이지 prev/next
// =====================================================
function updateDetailNavButtons() {
  if (!detailPrev || !detailNext) return;
  if (!Array.isArray(projects)) return;

  if (currentProjectIndex <= 0) detailPrev.classList.add('disabled');
  else detailPrev.classList.remove('disabled');

  if (currentProjectIndex >= projects.length - 1) detailNext.classList.add('disabled');
  else detailNext.classList.remove('disabled');
}

if (detailPrev) {
  detailPrev.addEventListener('click', () => {
    if (currentProjectIndex <= 0) return;
    const prev = projects[currentProjectIndex - 1];
    if (prev) showProjectDetail(prev.id);
  });
}

if (detailNext) {
  detailNext.addEventListener('click', () => {
    if (!Array.isArray(projects)) return;
    if (currentProjectIndex >= projects.length - 1) return;
    const next = projects[currentProjectIndex + 1];
    if (next) showProjectDetail(next.id);
  });
}

// =====================================================
// 3) 캔버스 + 마퀴바(패들) 연동
// =====================================================
const canvas = document.getElementById('canvas');
const ctx = canvas?.getContext('2d');
const marqueeBar = document.querySelector('.marquee-bar');
const marqueeInner = document.getElementById('marquee-inner');
const marqueeText1 = document.getElementById('marquee-text-1');

let paddleWidth = 0;
let paddleHeight = 0;
let paddleX = 0;
let paddleTop = 0;
let paddleBottom = 0;
let paddleVX = 0;

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
  if (!marqueeBar) return;
  marqueeBar.style.left = `${paddleX}px`;
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

function initPaddle() {
  if (!marqueeBar) return;

  const viewportWidth = window.innerWidth;

  let initialWidth = 0;
  if (viewportWidth <= 768) initialWidth = Math.min(viewportWidth * 0.4, viewportWidth);
  else initialWidth = Math.min(viewportWidth * 0.2, viewportWidth);

  marqueeBar.style.width = `${initialWidth}px`;

  syncPaddleFromDom();
  paddleX = (viewportWidth - paddleWidth) / 2;
  clampPaddleX();
  updatePaddleDomLeftOnly();
  syncPaddleFromDom();
}

function setupMarqueeIntroOnce() {
  if (!marqueeBar || !marqueeInner || !marqueeText1) return;

  const barWidth = marqueeBar.getBoundingClientRect().width;
  const copyWidth = marqueeText1.getBoundingClientRect().width;
  if (!barWidth || !copyWidth) return;

  const START_VISIBLE_RATIO = 1 / 3;
  const introFromPx = Math.max(0, barWidth * (1 - START_VISIBLE_RATIO));

  const LOOP_SECONDS = 30;
  const pxPerSec = copyWidth / LOOP_SECONDS;
  const introSeconds = introFromPx / pxPerSec;

  marqueeInner.style.setProperty('--marquee-intro-from', `${introFromPx}px`);
  marqueeInner.style.setProperty('--marquee-intro-duration', `${introSeconds.toFixed(3)}s`);
  marqueeInner.style.setProperty('--marquee-loop-duration', `${LOOP_SECONDS}s`);
}

resizeCanvas();
initPaddle();

function initAfterFontsReady() {
  setupMarqueeIntroOnce();
}

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(initAfterFontsReady);
} else {
  window.addEventListener('load', initAfterFontsReady);
}

if (marqueeBar && 'ResizeObserver' in window) {
  let isAdjusting = false;
  const ro = new ResizeObserver(() => {
    if (isAdjusting) return;
    isAdjusting = true;

    syncPaddleFromDom();
    clampPaddleX();
    updatePaddleDomLeftOnly();
    syncPaddleFromDom();

    isAdjusting = false;
  });
  ro.observe(marqueeBar);
}

window.addEventListener('resize', () => {
  resizeCanvas();
  syncPaddleFromDom();
  clampPaddleX();
  updatePaddleDomLeftOnly();
  syncPaddleFromDom();
  setupMarqueeIntroOnce();
});

// 패들 드래그
let isDraggingPaddle = false;
let lastPointerX = 0;
let lastPointerTime = 0;

function isOnResizeHandle(clientX, clientY) {
  if (!marqueeBar) return false;
  const rect = marqueeBar.getBoundingClientRect();
  const EDGE = 20;
  const nearRight = (rect.right - clientX) < EDGE;
  const nearBottom = (rect.bottom - clientY) < EDGE;
  return nearRight || (nearRight && nearBottom);
}

if (marqueeBar) {
  marqueeBar.addEventListener('mousedown', (e) => {
    if (isOnResizeHandle(e.clientX, e.clientY)) return;
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

  window.addEventListener('mouseup', () => {
    isDraggingPaddle = false;
    paddleVX = 0;
  });

  marqueeBar.addEventListener('touchstart', (e) => {
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

  const endTouch = () => {
    isDraggingPaddle = false;
    paddleVX = 0;
  };
  window.addEventListener('touchend', endTouch);
  window.addEventListener('touchcancel', endTouch);
}

// =====================================================
// 4) 스마일 볼
// =====================================================
class Ball {
  constructor(x, y, radius, color) {
    this.x = x; this.y = y;
    this.radius = radius;
    this.color = color;

    this.vx = (Math.random() - 0.5) * 10;
    this.vy = (Math.random() - 0.5) * 10;

    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.05;
  }

  draw() {
    if (!ctx) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = this.color;
    ctx.stroke();

    ctx.strokeStyle = '#fcff54';
    ctx.lineWidth = 2;
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

    if (this.x + this.radius > canvas.width) {
      this.x = canvas.width - this.radius;
      this.vx = -Math.abs(this.vx);
    } else if (this.x - this.radius < 0) {
      this.x = this.radius;
      this.vx = Math.abs(this.vx);
    }

    if (paddleHeight > 0) {
      const withinPaddleX =
        this.x >= (paddleX - this.radius) &&
        this.x <= (paddleX + paddleWidth + this.radius);

      if (this.vy < 0 && withinPaddleX) {
        const prevTop = (prevY - this.radius);
        const currTop = (this.y - this.radius);
        const crossedBottomSurface = (prevTop > paddleBottom) && (currTop <= paddleBottom);

        if (crossedBottomSurface) {
          this.y = paddleBottom + this.radius;
          this.vy = Math.abs(this.vy);
          this.vx += paddleVX * 0.8;
        }
      }

      if (this.vy > 0 && withinPaddleX) {
        const prevBottom = (prevY + this.radius);
        const currBottom = (this.y + this.radius);
        const crossedTopSurface = (prevBottom < paddleTop) && (currBottom >= paddleTop);

        if (crossedTopSurface) {
          this.y = paddleTop - this.radius;
          this.vy = -Math.abs(this.vy);
          this.vx += paddleVX * 0.8;
        }
      }
    }

    if (this.y + this.radius > canvas.height) {
      this.y = canvas.height - this.radius;
      this.vy = -Math.abs(this.vy);
    }

    if (this.y + this.radius < 0) {
      this.recycleBall();
    }

    this.rotation += this.rotationSpeed;
    this.draw();
  }

  recycleBall() {
    if (!canvas) return;

    this.x = this.radius + Math.random() * (canvas.width - this.radius * 2);
    this.y = canvas.height - this.radius - 5;

    this.vx = (Math.random() - 0.5) * 10;
    this.vy = -(Math.random() * 8 + 3);

    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.05;
  }
}

const balls = [];
const numBalls = 12;
const ballColor = '#fcff54';
const MAX_BALLS = 410;
let lastSpawnTime = 0;

function checkCollision(ball1, ball2) {
  const dx = ball2.x - ball1.x;
  const dy = ball2.y - ball1.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance < ball1.radius + ball2.radius) {
    const angle = Math.atan2(dy, dx);
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);

    const vx1 = ball1.vx * cos + ball1.vy * sin;
    const vy1 = ball1.vy * cos - ball1.vx * sin;
    const vx2 = ball2.vx * cos + ball2.vy * sin;
    const vy2 = ball2.vy * cos - ball2.vx * sin;

    ball1.vx = vx2 * cos - vy1 * sin;
    ball1.vy = vy1 * cos + vx2 * sin;
    ball2.vx = vx1 * cos - vy2 * sin;
    ball2.vy = vy2 * cos + vx1 * sin;

    const now = performance.now();
    if (balls.length < MAX_BALLS && now - lastSpawnTime > 200) {
      const newBall = new Ball(
        (ball1.x + ball2.x) / 2,
        (ball1.y + ball2.y) / 2,
        ball1.radius,
        ballColor
      );
      balls.push(newBall);
      lastSpawnTime = now;
    }
  }
}

if (canvas && ctx) {
  for (let i = 0; i < numBalls; i++) {
    const radius = 16;
    const x = radius + Math.random() * (canvas.width - radius * 2);
    const y = radius + Math.random() * (canvas.height - radius * 2);
    balls.push(new Ball(x, y, radius, ballColor));
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    syncPaddleFromDom();

    balls.forEach((b) => b.update());

    for (let i = 0; i < balls.length; i++) {
      for (let j = i + 1; j < balls.length; j++) {
        checkCollision(balls[i], balls[j]);
      }
    }

    requestAnimationFrame(animate);
  }
  animate();
}

// =====================================================
// 5) 썸네일 생성 & 상세 표시
// =====================================================
function shuffleArray(inputArray) {
  const arr = inputArray.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function createThumbnails(options = {}) {
  if (!thumbnailsContainer) return;
  if (!Array.isArray(projects)) return;

  thumbnailsContainer.innerHTML = '';

  const { shuffle = true } = options;
  const list = shuffle ? shuffleArray(projects) : projects;

  list.forEach((project) => {
    const thumbnail = document.createElement('div');
    thumbnail.className = 'thumbnail';

    const img = document.createElement('img');
    const first = (project.images && project.images[0]) ? project.images[0] : '';
    img.src = getImageSrc(first);
    img.alt = project.title || '';

    thumbnail.appendChild(img);
    thumbnail.addEventListener('click', () => showProjectDetail(project.id));
    thumbnailsContainer.appendChild(thumbnail);
  });
}

createThumbnails({ shuffle: true });

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

// =====================================================
// ✅ [핵심] 하단 스트립: "슬라이드(스크롤) 중엔 선택(클릭) 금지" 가드
// =====================================================
let stripIsPointerDown = false;     // 손가락/마우스가 눌린 상태
let stripMoved = false;             // 눌린 뒤 일정 거리 이상 이동했는지
let stripStartX = 0;
let stripStartY = 0;
let stripStartScrollLeft = 0;

// ✅ 클릭 억제 타이머(모바일에서 touchend 뒤 click이 늦게 발생하는 케이스 방지)
let stripSuppressClickUntil = 0;

/**
 * 지금 발생한 "선택 클릭"을 무시해야 하는 상황인가?
 * - 방금 스크롤/드래그 했거나
 * - 관성 스크롤 직후(짧은 시간)인 경우
 */
function shouldSuppressStripClick() {
  return stripMoved || Date.now() < stripSuppressClickUntil;
}

/**
 * 스트립에서 "스크롤로 판단"하는 기준
 * - 손가락이 조금만 움직여도 탭으로 오작동할 수 있어
 * - 그래서 threshold를 둬서 '이 정도 이상' 움직였을 때만 스크롤로 판단
 */
const STRIP_MOVE_THRESHOLD = 10; // px (필요하면 8~14 사이로 조절)

function initStripDragGuard() {
  if (!detailStripTrack) return;

  // 1) 터치 시작
  detailStripTrack.addEventListener('touchstart', (e) => {
    if (e.touches.length === 0) return;
    const t = e.touches[0];

    stripIsPointerDown = true;
    stripMoved = false;

    stripStartX = t.clientX;
    stripStartY = t.clientY;
    stripStartScrollLeft = detailStripTrack.scrollLeft;
  }, { passive: true });

  // 2) 터치 이동(스크롤 중)
  detailStripTrack.addEventListener('touchmove', (e) => {
    if (!stripIsPointerDown || e.touches.length === 0) return;
    const t = e.touches[0];

    const dx = Math.abs(t.clientX - stripStartX);
    const dy = Math.abs(t.clientY - stripStartY);

    // 손가락 이동이 일정 이상이거나, 실제 스크롤이 변했으면 "슬라이드"로 판단
    const scrolled = Math.abs(detailStripTrack.scrollLeft - stripStartScrollLeft) > 2;

    if (dx > STRIP_MOVE_THRESHOLD || dy > STRIP_MOVE_THRESHOLD || scrolled) {
      stripMoved = true;

      // ✅ touchend 후에 click이 튀는 걸 막기 위해, 잠깐 클릭 억제
      stripSuppressClickUntil = Date.now() + 350;
    }
  }, { passive: true });

  // 3) 터치 종료
  detailStripTrack.addEventListener('touchend', () => {
    stripIsPointerDown = false;
    // stripMoved는 바로 false로 만들지 말고, suppress 타이머로 안전하게 처리
  }, { passive: true });

  detailStripTrack.addEventListener('touchcancel', () => {
    stripIsPointerDown = false;
    stripMoved = false;
  }, { passive: true });

  // 4) 스크롤 이벤트(관성 스크롤 포함)
  detailStripTrack.addEventListener('scroll', () => {
    // 사용자가 스크롤하고 있으면(특히 모바일 관성), 선택 클릭이 튀지 않게 잠깐 막기
    // scroll은 아주 자주 발생하므로 "짧게 갱신"만 해준다.
    stripSuppressClickUntil = Date.now() + 250;
  }, { passive: true });

  // 5) 캡처 단계에서 click 자체를 차단(버튼 click 핸들러보다 먼저)
  detailStripTrack.addEventListener('click', (e) => {
    if (!shouldSuppressStripClick()) return;
    e.preventDefault();
    e.stopPropagation();
  }, true);
}

// ✅ 1회 초기화
initStripDragGuard();

// =====================================================
// ✅ 하단 “프로젝트 썸네일 스트립” 생성/갱신
// =====================================================
function buildDetailBottomStrip() {
  if (!detailStripTrack) return;
  if (!Array.isArray(projects)) return;

  detailStripTrack.innerHTML = '';

  projects.forEach((p) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'detail-strip-thumb';
    btn.dataset.projectId = String(p.id);

    const img = document.createElement('img');
    const first = (p.images && p.images[0]) ? p.images[0] : '';
    img.src = getImageSrc(first);
    img.alt = p.title || '';
    btn.appendChild(img);

    // ✅ [핵심] "슬라이드 중"이면 클릭(선택) 무시
    btn.addEventListener('click', (e) => {
      if (shouldSuppressStripClick()) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      showProjectDetail(p.id);
    });

    detailStripTrack.appendChild(btn);
  });
}

function setActiveStrip(projectId) {
  if (!detailStripTrack) return;
  const id = String(projectId);

  const thumbs = detailStripTrack.querySelectorAll('.detail-strip-thumb');
  thumbs.forEach((t) => {
    if (t.dataset.projectId === id) t.classList.add('is-active');
    else t.classList.remove('is-active');
  });

  // ✅ 활성 썸네일이 화면에 자연스럽게 보이도록 살짝 스크롤
  const active = detailStripTrack.querySelector('.detail-strip-thumb.is-active');
  if (active && typeof active.scrollIntoView === 'function') {
    active.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }
}

// 화살표 스크롤
function scrollStripBy(direction) {
  if (!detailStripTrack) return;
  const amount = Math.max(240, Math.floor(window.innerWidth * 0.65));
  detailStripTrack.scrollBy({ left: direction * amount, behavior: 'smooth' });

  // ✅ 화살표로 움직인 직후에도 클릭 튀는 걸 약간 방지
  stripSuppressClickUntil = Date.now() + 250;
}

if (detailStripLeft) detailStripLeft.addEventListener('click', () => scrollStripBy(-1));
if (detailStripRight) detailStripRight.addEventListener('click', () => scrollStripBy(1));

// 페이지 로딩 시 1회 생성
buildDetailBottomStrip();

function showProjectDetail(projectId) {
  if (!Array.isArray(projects)) return;

  const index = projects.findIndex((p) => p.id === projectId);
  if (index === -1) return;

  currentProjectIndex = index;
  const project = projects[index];

  if (detailTitleEl) detailTitleEl.textContent = project.title || '';
  if (detailSubtitleEl) detailSubtitleEl.textContent = normalizeText(project.subtitle);
  if (detailYearEl) detailYearEl.textContent = project.year || '';

  const specsText = normalizeText(project.specs);
  if (detailSpecsEl && detailSpecsContainer) {
    if (specsText) {
      detailSpecsEl.textContent = specsText;
      detailSpecsContainer.style.display = 'flex';
    } else {
      detailSpecsEl.textContent = '';
      detailSpecsContainer.style.display = 'none';
    }
  }

  const sizeText = normalizeText(project.size);
  if (detailSizeEl && detailSizeContainer) {
    if (sizeText) {
      detailSizeEl.textContent = sizeText;
      detailSizeContainer.style.display = 'flex';
    } else {
      detailSizeEl.textContent = '';
      detailSizeContainer.style.display = 'none';
    }
  }

  const clientText = normalizeText(project.client);
  if (detailClientEl && detailClientContainer) {
    if (clientText) {
      detailClientEl.textContent = clientText;
      detailClientContainer.style.display = 'flex';
    } else {
      detailClientEl.textContent = '';
      detailClientContainer.style.display = 'none';
    }
  }

  if (detailDescriptionEl) detailDescriptionEl.innerHTML = project.description || '';

  const images = project.images || [];

  if (detailMainImageEl) detailMainImageEl.innerHTML = '';
  if (detailImagesEl) detailImagesEl.innerHTML = '';

  const mainSize = normalizeMainImageSize(project.mainImageSize);

  // ✅ 대표이미지(첫 번째)
  if (images.length > 0 && detailMainImageEl) {
    const firstImgItem = images[0];
    const firstSrc = getImageSrc(firstImgItem);

    if (firstSrc) {
      const firstImg = document.createElement('img');
      firstImg.src = firstSrc;
      firstImg.alt = project.title || '';
      firstImg.classList.add(`main-img-${mainSize}`);
      detailMainImageEl.appendChild(firstImg);
    }
  }

  // ✅ 나머지 이미지들
  if (detailImagesEl && images.length > 1) {
    for (let i = 1; i < images.length; i++) {
      const item = images[i];
      const src = getImageSrc(item);
      if (!src) continue;

      const img = document.createElement('img');
      img.src = src;
      img.alt = project.title || '';

      // span:2 처리
      if (item && typeof item === 'object' && item.span === 2) {
        img.style.gridColumn = '1 / -1';
        img.classList.add('span-2');
      }

      detailImagesEl.appendChild(img);
    }
  }

  // ✅ 하단 스트립 활성 표시 갱신
  setActiveStrip(project.id);

  showPage(detailPage);
  if (detailPage) detailPage.scrollTop = 0;
  updateDetailNavButtons();
}

// =====================================================
// 6) 모바일: 상세페이지 스와이프(prev/next)
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
      if (currentProjectIndex > 0) {
        const prev = projects[currentProjectIndex - 1];
        if (prev) showProjectDetail(prev.id);
      }
    } else {
      if (currentProjectIndex < projects.length - 1) {
        const next = projects[currentProjectIndex + 1];
        if (next) showProjectDetail(next.id);
      }
    }
  }, { passive: true });
}
