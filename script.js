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
// ✅ [핵심] 이미지 확장자 fallback 지원 (jpg -> gif, png 등)
// =====================================================
function buildFallbackCandidates(src) {
  if (!src) return [];

  const [path, query] = src.split('?');
  const q = query ? `?${query}` : '';

  const m = path.match(/^(.*)\.([^.\/]+)$/);
  if (!m) return [src];

  const base = m[1];
  const ext = (m[2] || '').toLowerCase();

  const map = {
    jpg: ['gif', 'png'],
    jpeg: ['gif', 'png'],
    gif: ['jpg', 'png'],
    png: ['gif', 'jpg'],
    webp: ['gif', 'jpg'],
  };

  const alts = map[ext] || ['gif', 'jpg'];

  const candidates = [`${base}.${ext}${q}`, ...alts.map(e => `${base}.${e}${q}`)];
  const uniq = [...new Set(candidates)];

  return uniq.slice(0, 3);
}

function setImageSrcWithFallback(imgEl, src) {
  if (!imgEl) return;

  const attempts = buildFallbackCandidates(src);

  if (!attempts.length) {
    imgEl.removeAttribute('src');
    return;
  }

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

function initAfterFontsReady() { setupMarqueeIntroOnce(); }

if (document.fonts && document.fonts.ready) document.fonts.ready.then(initAfterFontsReady);
else window.addEventListener('load', initAfterFontsReady);

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

    // ✅ 초기 속도(랜덤) — 여기 범위를 줄이면 전체적으로 느려짐
    this.vx = (Math.random() - 0.5) * 15;
    this.vy = (Math.random() - 0.5) * 15;

    this.rotation = Math.random() * Math.PI * 3;
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
    ctx.lineWidth = 1;
    ctx.strokeStyle = this.color;
    ctx.stroke();

    ctx.strokeStyle = '#fdffa2';
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

    // 좌/우 벽 반사
    if (this.x + this.radius > canvas.width) {
      this.x = canvas.width - this.radius;
      this.vx = -Math.abs(this.vx);
    } else if (this.x - this.radius < 0) {
      this.x = this.radius;
      this.vx = Math.abs(this.vx);
    }

    // 패들(마퀴바) 충돌
    if (paddleHeight > 0) {
      const withinPaddleX =
        this.x >= (paddleX - this.radius) &&
        this.x <= (paddleX + paddleWidth + this.radius);

      // 위로 가는 볼이 패들 아래면에 부딪히는 경우
      if (this.vy < 0 && withinPaddleX) {
        const prevTop = (prevY - this.radius);
        const currTop = (this.y - this.radius);
        const crossedBottomSurface = (prevTop > paddleBottom) && (currTop <= paddleBottom);

        if (crossedBottomSurface) {
          this.y = paddleBottom + this.radius;
          this.vy = Math.abs(this.vy);

          // ✅ 패들 움직임이 공에 옆속도로 전달됨 (여기가 vx가 커지는 지점)
          this.vx += paddleVX * 0.8;
        }
      }

      // 아래로 가는 볼이 패들 윗면에 부딪히는 경우
      if (this.vy > 0 && withinPaddleX) {
        const prevBottom = (prevY + this.radius);
        const currBottom = (this.y + this.radius);
        const crossedTopSurface = (prevBottom < paddleTop) && (currBottom >= paddleTop);

        if (crossedTopSurface) {
          this.y = paddleTop - this.radius;
          this.vy = -Math.abs(this.vy);

          // ✅ 여기도 동일
          this.vx += paddleVX * 0.2;
        }
      }
    }

    // 바닥 반사
    if (this.y + this.radius > canvas.height) {
      this.y = canvas.height - this.radius;
      this.vy = -Math.abs(this.vy);
    }

    // 천장 밖으로 나가면 리사이클
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

    this.vx = (Math.random() - 0.5) * 2;
    this.vy = -(Math.random() * 2 + 1);

    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.05;
  }
}

const balls = [];

// ✅ 초기 공 개수
const numBalls = 6;

const ballColor = '#fdffa2';
const MAX_BALLS = 100;
let lastSpawnTime = 0;

// =====================================================
// ✅ (B) “겹치면 밀어내서 분리”를 위한 충돌 설정
// -----------------------------------------------------
// - overlapCorrectionPercent: 겹친 양을 몇 %까지 분리할지
//   1.0에 가까울수록 더 강하게 분리(붙어있는 현상 감소)
// - overlapSlop: 아주 미세한 겹침은 허용(너무 ‘덜컥’거리는 느낌 방지)
// - restitution: 튕김(탄성). 1.0이면 완전 탄성(에너지 보존 느낌)
// =====================================================
const COLLISION_CONFIG = {
  overlapCorrectionPercent: 0.9,
  overlapSlop: 0.1,
  restitution: 1.0,
};

// =====================================================
// ✅ 공-공 충돌 처리 (겹침 분리 + 물리 반응)
// -----------------------------------------------------
// 기존 문제(속도 갑자기 튀는 이유)
// - 공이 서로 겹친 채로 남아 있으면 다음 프레임에도 계속 충돌로 판정됨
// - 그러면 매 프레임 속도 교환/계산이 반복되면서 “갑자기 빨라진 것처럼” 보임
//
// 해결(B)
// 1) 겹친 만큼 먼저 서로 밀어내서 분리(포지션 보정)
// 2) 이미 서로 멀어지는 중이면(velAlongNormal > 0) 충돌 임펄스는 생략
//    → 겹침만 풀고, 속도는 불필요하게 튀지 않게 함
// =====================================================
function checkCollision(ball1, ball2) {
  if (!canvas) return;

  const dx = ball2.x - ball1.x;
  const dy = ball2.y - ball1.y;

  // 거리(0이면 나눗셈 터지니 아주 작은 값으로 보정)
  let dist = Math.hypot(dx, dy);
  if (dist === 0) dist = 0.0001;

  const minDist = ball1.radius + ball2.radius;

  // 안 겹치면 종료
  if (dist >= minDist) return;

  // ----------------------------
  // 1) 겹침 분리(포지션 보정)
  // ----------------------------
  const nx = dx / dist;   // 충돌 노말(단위벡터)
  const ny = dy / dist;

  const overlap = minDist - dist;

  // 너무 미세한 겹침까지 다 보정하면 떨림이 생길 수 있어서 slop를 둠
  const slop = COLLISION_CONFIG.overlapSlop;
  const percent = COLLISION_CONFIG.overlapCorrectionPercent;

  const correctionMag = Math.max(overlap - slop, 0) * percent;
  const correctionX = nx * (correctionMag / 2);
  const correctionY = ny * (correctionMag / 2);

  // 두 공을 서로 반대 방향으로 같은 만큼 이동(질량 동일 가정)
  ball1.x -= correctionX;
  ball1.y -= correctionY;
  ball2.x += correctionX;
  ball2.y += correctionY;

  // 좌/우 화면 밖으로 튀지 않도록 x만 최소한 클램프(위쪽은 나가도 리사이클 되니까 허용)
  ball1.x = Math.min(canvas.width - ball1.radius, Math.max(ball1.radius, ball1.x));
  ball2.x = Math.min(canvas.width - ball2.radius, Math.max(ball2.radius, ball2.x));

  // ----------------------------
  // 2) 충돌 임펄스(속도 반응)
  // ----------------------------
  // 상대속도
  const rvx = ball2.vx - ball1.vx;
  const rvy = ball2.vy - ball1.vy;

  // 노말 방향 상대속도(+)면 이미 멀어지는 중
  const velAlongNormal = rvx * nx + rvy * ny;

  // ✅ 이미 멀어지는 중이면, 속도는 건드리지 않는다.
  //    (겹침만 풀고 끝 → “반응 속도 갑자기 빨라짐” 방지에 매우 중요)
  if (velAlongNormal > 0) {
    // 그래도 “증식(공 추가)”은 겹침 순간의 이벤트로 보고 여기서 처리해도 됨
    // 하지만 멀어지는 중인데도 계속 겹쳤던 프레임이면 또 스폰될 수 있어서
    // 아래 스폰은 velAlongNormal <= 0일 때만 실행하는 걸 추천.
    return;
  }

  const e = COLLISION_CONFIG.restitution;

  // 질량 동일(m1=m2=1) 가정
  const invMass1 = 1;
  const invMass2 = 1;

  // 임펄스 스칼라
  const j = -(1 + e) * velAlongNormal / (invMass1 + invMass2);

  const impulseX = j * nx;
  const impulseY = j * ny;

  // 속도 업데이트
  ball1.vx -= impulseX * invMass1;
  ball1.vy -= impulseY * invMass1;

  ball2.vx += impulseX * invMass2;
  ball2.vy += impulseY * invMass2;

  // ----------------------------
  // 3) “충돌하면 공 늘어나기(증식)” 로직
  // ----------------------------
  // 여기서는 ‘진짜로 부딪힌(approaching)’ 순간에만 스폰되도록
  // velAlongNormal <= 0일 때(여기 구간)만 실행되는 구조가 됨.
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

    // 공-공 충돌 검사(모든 쌍)
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
    setImageSrcWithFallback(img, getImageSrc(first));

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
let stripIsPointerDown = false;
let stripMoved = false;
let stripStartX = 0;
let stripStartY = 0;
let stripStartScrollLeft = 0;
let stripSuppressClickUntil = 0;

function shouldSuppressStripClick() {
  return stripMoved || Date.now() < stripSuppressClickUntil;
}

const STRIP_MOVE_THRESHOLD = 10;

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

  detailStripTrack.addEventListener('touchend', () => {
    stripIsPointerDown = false;
  }, { passive: true });

  detailStripTrack.addEventListener('touchcancel', () => {
    stripIsPointerDown = false;
    stripMoved = false;
  }, { passive: true });

  detailStripTrack.addEventListener('scroll', () => {
    stripSuppressClickUntil = Date.now() + 250;
  }, { passive: true });

  detailStripTrack.addEventListener('click', (e) => {
    if (!shouldSuppressStripClick()) return;
    e.preventDefault();
    e.stopPropagation();
  }, true);
}
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
    setImageSrcWithFallback(img, getImageSrc(first));

    img.alt = p.title || '';
    btn.appendChild(img);

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

  const active = detailStripTrack.querySelector('.detail-strip-thumb.is-active');
  if (active && typeof active.scrollIntoView === 'function') {
    active.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }
}

function scrollStripBy(direction) {
  if (!detailStripTrack) return;
  const amount = Math.max(240, Math.floor(window.innerWidth * 0.65));
  detailStripTrack.scrollBy({ left: direction * amount, behavior: 'smooth' });
  stripSuppressClickUntil = Date.now() + 250;
}

if (detailStripLeft) detailStripLeft.addEventListener('click', () => scrollStripBy(-1));
if (detailStripRight) detailStripRight.addEventListener('click', () => scrollStripBy(1));

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

      setImageSrcWithFallback(firstImg, firstSrc);

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
