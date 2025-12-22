// =====================================================
// script.js
// ⚠️ index.html에서 projects-data.js가 script.js보다 먼저 로드되어야 함!
// 예) <script src="projects-data.js"></script>
//     <script src="script.js"></script>
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
if (mainTitle) {
  mainTitle.addEventListener('click', () => showPage(portfolioPage));
}
if (topLogo) {
  topLogo.addEventListener('click', () => showPage(portfolioPage));
}
if (aboutBtn) {
  aboutBtn.addEventListener('click', () => showPage(mainPage));
}
if (cvBtn) {
  cvBtn.addEventListener('click', () => showPage(cvPage));
}
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

// ✅ 마퀴 “첫 로딩 인트로” 세팅용
const marqueeInner = document.getElementById('marquee-inner');
const marqueeText1 = document.getElementById('marquee-text-1');

/**
 * ✅ 패들(마퀴바)의 실제 위치/크기
 */
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

/**
 * ✅ 초기 마퀴바 폭 설정 (이후 사용자의 resize는 존중)
 */
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

/**
 * ✅ 마퀴 “첫 로딩 인트로” 시작 위치/시간 세팅
 * - 목표: 처음 프레임에서 텍스트가 "1/3 정도 보이는 상태"로 시작
 *
 * ✅ 속도 조절:
 *   const LOOP_SECONDS 값을 줄이면 빨라지고, 늘리면 느려짐.
 */
function setupMarqueeIntroOnce() {
  if (!marqueeBar || !marqueeInner || !marqueeText1) return;

  const barWidth = marqueeBar.getBoundingClientRect().width;
  const copyWidth = marqueeText1.getBoundingClientRect().width;

  if (!barWidth || !copyWidth) return;

  // 1/3 정도 보이게 시작
  const START_VISIBLE_RATIO = 1 / 3;
  const introFromPx = Math.max(0, barWidth * (1 - START_VISIBLE_RATIO));

  // ✅ 여기서 속도 조절 (작을수록 더 빠름)
  const LOOP_SECONDS = 30;

  // 루프 속도를 기준으로 intro duration 계산(속도감 통일)
  const pxPerSec = copyWidth / LOOP_SECONDS;
  const introSeconds = introFromPx / pxPerSec;

  marqueeInner.style.setProperty('--marquee-intro-from', `${introFromPx}px`);
  marqueeInner.style.setProperty('--marquee-intro-duration', `${introSeconds.toFixed(3)}s`);
  marqueeInner.style.setProperty('--marquee-loop-duration', `${LOOP_SECONDS}s`);
}

resizeCanvas();
initPaddle();

/**
 * ✅ 폰트 로딩 후 측정해야 폭이 정확하다.
 */
function initAfterFontsReady() {
  setupMarqueeIntroOnce();
}

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(initAfterFontsReady);
} else {
  window.addEventListener('load', initAfterFontsReady);
}

// ✅ 사용자가 마퀴바 폭을 리사이즈하면 공 충돌 영역 갱신
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

// 창 크기 변화: 캔버스 리사이즈 + 패들 left만 보정
window.addEventListener('resize', () => {
  resizeCanvas();
  syncPaddleFromDom();
  clampPaddleX();
  updatePaddleDomLeftOnly();
  syncPaddleFromDom();

  // ✅ 창 리사이즈 시 마퀴 인트로 계산도 다시 (원하면 유지, 싫으면 지워도 됨)
  setupMarqueeIntroOnce();
});

// ==============================
// 패들 드래그(이동): 마우스 + 터치
// ==============================
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

  // ✅ 나머지 이미지들 (여기서 span:2 처리!)
  if (detailImagesEl && images.length > 1) {
    for (let i = 1; i < images.length; i++) {
      const item = images[i];
      const src = getImageSrc(item);
      if (!src) continue;

      const img = document.createElement('img');
      img.src = src;
      img.alt = project.title || '';

      // ✅ span 처리: {src:"...", span:2}면 2열 전체를 먹게
      if (item && typeof item === 'object' && item.span === 2) {
        // CSS 없어도 확실히 풀폭 되도록 "1 / -1"로 강제
        img.style.gridColumn = '1 / -1';
        img.classList.add('is-span-2'); // CSS로도 쓰고 싶으면 사용
      }

      detailImagesEl.appendChild(img);
    }
  }

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
