const mainPage = document.getElementById('main-page');
const portfolioPage = document.getElementById('portfolio-page');
const detailPage = document.getElementById('detail-page');
const cvPage = document.getElementById('cv-page');

const mainTitle = document.getElementById('main-title-svg');
const mainTitleVisual = document.getElementById('main-title-visual');

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

/*
  포트폴리오 썸네일 생성 상태
  - 예전에는 메인 페이지가 열릴 때도 createThumbnails()를 바로 실행했다.
  - 모바일 Safari에서는 QR로 처음 접속할 때 이미지 로딩과 canvas 애니메이션이 동시에 실행되면 느려질 수 있다.
  - 그래서 포트폴리오 페이지에 실제로 들어간 뒤 한 번만 썸네일을 만든다.
*/
let thumbnailsCreated = false;



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

/*
  상단 메뉴 폰트 동기화
  - 모바일 Safari에서는 button 요소가 브라우저 기본 폰트처럼 보일 때가 있다.
  - 그래서 #top-logo(작업들/Works)에 실제로 적용된 computed font 값을 읽어서
    힌프레스 / CV / 사적 글쓰기 버튼에 그대로 복사한다.
  - CSS에서 비슷하게 맞추는 것보다, 실제 보이는 값을 복사하는 방식이 더 안정적이다.
*/
function syncTopNavFontToLogo() {
  if (!topLogo) return;

  const logoStyle = window.getComputedStyle(topLogo);
  const navItems = document.querySelectorAll('.top-nav-item');

  navItems.forEach((item) => {
    item.style.fontFamily = logoStyle.fontFamily;
    item.style.fontSize = logoStyle.fontSize;
    item.style.fontWeight = logoStyle.fontWeight;
    item.style.fontStyle = logoStyle.fontStyle;
    item.style.lineHeight = logoStyle.lineHeight;
    item.style.letterSpacing = logoStyle.letterSpacing;
    item.style.textTransform = logoStyle.textTransform;
    item.style.color = logoStyle.color;
    item.style.webkitTextFillColor = logoStyle.color;
  });
}

function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  page.classList.add('active');

  /*
    포트폴리오 썸네일은 포트폴리오 페이지에 처음 들어갈 때만 만든다.
    이렇게 하면 모바일 Safari 첫 로딩에서 이미지 로딩이 canvas 공 애니메이션을 방해하는 일을 줄일 수 있다.
  */
  if (page === portfolioPage && !thumbnailsCreated) {
    createThumbnails({ shuffle: false });
  }

  if (page === mainPage) {
    topBar?.classList.add('hidden');
  } else {
    topBar?.classList.remove('hidden');
    syncTopNavFontToLogo();
  }
}
showPage(mainPage);

/*
  메인 페이지에서 포트폴리오 페이지로 이동하는 방식
  - 기존에는 hinPress SVG 이미지(mainTitle)를 직접 클릭해야만 이동했다.
  - 이제는 main-page 영역 어디를 클릭해도 포트폴리오 페이지로 이동한다.
  - click 이벤트는 데스크탑 마우스 클릭과 모바일 탭 모두에서 동작한다.
*/
mainPage?.addEventListener('click', () => showPage(portfolioPage));

topLogo?.addEventListener('click', () => showPage(portfolioPage));
aboutBtn?.addEventListener('click', () => showPage(mainPage));
cvBtn?.addEventListener('click', () => showPage(cvPage));
contactBtn?.addEventListener('click', () => window.open('note.html', '_blank'));


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


function getTextInkRect(el) {
  if (!el) return null;

  return el.getBoundingClientRect();
}


function getMarqueeTuningByViewport(titleRect) {
  const isMobile = window.innerWidth <= 768;

  return {

    GAP: isMobile ? 0 : 2,

    LEFT_NUDGE: isMobile ? 2.8 : 4.5,
    RIGHT_NUDGE: 0
  };
}

function alignMarqueeToTitleUnderline() {
  if (!mainTitle || !marqueeBar) return;

  const rect = getTextInkRect(mainTitle);
  if (!rect || !rect.width) return;

  const { GAP } = getMarqueeTuningByViewport(rect);

  const top = rect.bottom + GAP;

  marqueeBar.style.left = '0';
  marqueeBar.style.right = 'auto';
  marqueeBar.style.marginLeft = '0';
  marqueeBar.style.marginRight = '0';
  marqueeBar.style.width = '100vw';

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
  syncTopNavFontToLogo();
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
  syncTopNavFontToLogo();
});

if (mainTitle && 'ResizeObserver' in window) {
  const ro = new ResizeObserver(() => {
    alignMarqueeToTitleUnderline();
    setupMarqueeIntroOnce();
  });
  ro.observe(mainTitle);
}


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


class Ball {
  constructor(x, y, radius, color) {
    this.x = x; this.y = y;
    this.radius = radius;
    this.color = color;

    /*
      모바일에서는 Safari의 프레임 변동을 고려해서 초기 속도를 조금 낮춘다.
      이전 버전은 시간 보정을 강하게 넣으면서 QR 첫 진입 시 공이 빠르게 느껴질 수 있었다.
    */
    const initialSpeed = isMobileViewport() ? 16 : 25;
    this.vx = (Math.random() - 0.5) * initialSpeed;
    this.vy = (Math.random() - 0.5) * initialSpeed;

    this.rotation = Math.random() * Math.PI * 3;
    this.rotationSpeed = (Math.random() - 0.5) * (isMobileViewport() ? 0.35 : 0.6);
  }

  limitVelocity() {
    /*
      충돌이 여러 번 겹치면 속도가 갑자기 커질 수 있다.
      특히 모바일 Safari에서는 이런 순간 가속이 “덜 부드러운 움직임”처럼 보인다.
      그래서 화면 크기에 따라 최대 속도를 제한한다.
    */
    const maxSpeed = isMobileViewport() ? 12 : 22;
    const speed = Math.hypot(this.vx, this.vy);

    if (speed > maxSpeed) {
      const scale = maxSpeed / speed;
      this.vx *= scale;
      this.vy *= scale;
    }
  }

  draw() {
    if (!ctx) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = this.color;
    ctx.stroke();

    ctx.strokeStyle = '#fd2af6';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, this.radius * 0.2, this.radius * 0.7, 0, Math.PI);
    ctx.stroke();

    ctx.restore();
  }

  update(speedRatio = 1) {
    if (!canvas) return;

    /*
      Safari 최적화 핵심
      - 이전 코드는 프레임마다 this.x += this.vx, this.y += this.vy만 실행했다.
      - 그러면 브라우저가 60fps가 아니라 30fps로 떨어지는 순간, 공의 실제 속도도 절반처럼 느려진다.
      - speedRatio는 현재 프레임 간격을 기준으로 보정하는 값이다.
        60fps 기준 한 프레임은 약 16.67ms이므로, 그보다 느리게 그려진 프레임에서는 이동량을 조금 더 보정한다.
    */
    const prevY = this.y;
    this.x += this.vx * speedRatio;
    this.y += this.vy * speedRatio;

    if (this.x + this.radius > canvas.width) { this.x = canvas.width - this.radius; this.vx = -Math.abs(this.vx); }
    else if (this.x - this.radius < 0) { this.x = this.radius; this.vx = Math.abs(this.vx); }

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

    this.limitVelocity();
    this.rotation += this.rotationSpeed * speedRatio;
    this.draw();
  }

  recycleBall() {
    if (!canvas) return;
    this.x = this.radius + Math.random() * (canvas.width - this.radius * 2);
    this.y = canvas.height - this.radius - 5;
    const recycleSpeed = isMobileViewport() ? 1.4 : 2;
    const recycleUpSpeed = isMobileViewport() ? 0.9 : 1;
    this.vx = (Math.random() - 0.5) * recycleSpeed;
    this.vy = -(Math.random() * recycleSpeed + recycleUpSpeed);
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * (isMobileViewport() ? 0.1 : 0.15);
  }
}

const balls = [];
const ballColor = '#fd2af6';

/*
  모바일 Safari에서는 이미지 로딩, 주소창 변화, canvas 애니메이션이 겹칠 때 프레임이 쉽게 떨어진다.
  그래서 모바일 화면에서는 공 개수와 최대 증식 개수를 살짝 줄인다.
  시각적 인상은 유지하면서 계산량을 줄이는 목적이다.
*/
function isMobileViewport() {
  return window.innerWidth <= 768;
}

const INITIAL_BALL_COUNT = isMobileViewport() ? 4 : 5;
const MAX_BALLS = isMobileViewport() ? 7 : 10;
const BALL_RADIUS = isMobileViewport() ? 24 : 30;

let lastSpawnTime = 0;


const debugBallEl = document.getElementById('debug-balls');
let lastDebugLog = 0;
function debugBallCount() {
  const now = performance.now();

  if (debugBallEl) {
    debugBallEl.textContent = `balls: ${balls.length} / ${MAX_BALLS}`;
  }

  if (now - lastDebugLog > 1000) {
    console.log(`[hinPress] balls: ${balls.length} / ${MAX_BALLS}`);
    lastDebugLog = now;
  }
}

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

if (window.__hinpressBallRAF) {
  cancelAnimationFrame(window.__hinpressBallRAF);
  window.__hinpressBallRAF = null;
}

if (canvas && ctx) {
  for (let i = 0; i < INITIAL_BALL_COUNT; i++) {
    const radius = BALL_RADIUS;
    const x = radius + Math.random() * (canvas.width - radius * 2);
    const y = radius + Math.random() * (canvas.height - radius * 2);
    balls.push(new Ball(x, y, radius, ballColor));
  }

  let lastFrameTime = null;
  let smoothedSpeedRatio = 1;

  function animate(timestamp) {
    const delta = lastFrameTime === null ? 16.67 : timestamp - lastFrameTime;
    lastFrameTime = timestamp;

    /*
      부드러운 모바일 움직임을 위한 시간 보정
      - 시간 기반 애니메이션은 유지하되, Safari에서 프레임 간격이 갑자기 커지는 순간을 그대로 반영하면
        공이 순간적으로 빨라지거나 튀는 것처럼 보인다.
      - 그래서 delta를 적당한 범위로 제한하고, 이전 speedRatio와 섞어 천천히 따라가게 만든다.
      - MOBILE_SPEED_MULTIPLIER는 모바일에서 전체 속도를 조금 낮춰 QR 첫 진입 시 빠르게 보이는 문제를 줄인다.
    */
    const isMobile = isMobileViewport();
    const clampedDelta = clamp(delta, 10, isMobile ? 34 : 42);
    const targetSpeedRatio = clamp(clampedDelta / 16.67, 0.7, isMobile ? 1.45 : 1.8);
    const smoothing = isMobile ? 0.10 : 0.16;
    const mobileSpeedMultiplier = isMobile ? 0.76 : 1;

    smoothedSpeedRatio += (targetSpeedRatio - smoothedSpeedRatio) * smoothing;
    const speedRatio = smoothedSpeedRatio * mobileSpeedMultiplier;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /*
      메인 페이지가 보일 때만 공의 물리 계산을 실행한다.
      포트폴리오/CV/상세 페이지로 넘어간 뒤에도 canvas는 DOM에 남아 있으므로,
      계속 계산하면 모바일 성능을 불필요하게 사용하게 된다.
    */
    const isMainVisible = mainPage?.classList.contains('active');

    if (isMainVisible) {
      syncPaddleFromDom();

      balls.forEach(b => b.update(speedRatio));

      for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) checkCollision(balls[i], balls[j]);
      }

      debugBallCount();
    }

    window.__hinpressBallRAF = requestAnimationFrame(animate);
  }

  window.__hinpressBallRAF = requestAnimationFrame(animate);
}

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

  const list = (options.shuffle ?? false) ? shuffleArray(projects) : projects;

  list.forEach(project => {
    const thumbnail = document.createElement('div');
    thumbnail.className = 'thumbnail';

    const img = document.createElement('img');

    /*
      모바일 Safari 첫 진입 최적화
      - loading='lazy': 화면 밖의 이미지를 한꺼번에 불러오지 않는다.
      - decoding='async': 이미지 디코딩이 메인 스레드를 오래 막지 않도록 한다.
    */
    img.loading = 'lazy';
    img.decoding = 'async';
    const first = (project.images && project.images[0]) ? project.images[0] : '';
    setImageSrcWithFallback(img, getImageSrc(first));
    img.alt = project.title || '';

    thumbnail.appendChild(img);
    thumbnail.addEventListener('click', () => showProjectDetail(project.id));
    thumbnailsContainer.appendChild(thumbnail);
  });

  thumbnailsCreated = true;
}

/*
  중요: 메인 페이지 첫 로딩 때 썸네일을 미리 만들지 않는다.
  포트폴리오 페이지에 들어갈 때 showPage() 안에서 한 번만 생성된다.
*/

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


