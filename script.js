// ==============================
// 공통 페이지 요소 선택
// ==============================
const mainPage = document.getElementById('main-page');
const portfolioPage = document.getElementById('portfolio-page');
const detailPage = document.getElementById('detail-page');
const cvPage = document.getElementById('cv-page'); // CV 페이지

const mainTitle = document.getElementById('main-title');

const topBar = document.getElementById('top-bar');
const topLogo = document.getElementById('top-logo');
const aboutBtn = document.getElementById('about-btn');
const cvBtn = document.getElementById('cv-btn');
const contactBtn = document.getElementById('contact-btn');

const thumbnailsContainer = document.getElementById('thumbnails-container');

const detailPrev = document.getElementById('detail-prev');
const detailNext = document.getElementById('detail-next');

// 상세 정보 요소
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

// ==============================
// 페이지 전환 함수
// ==============================
function showPage(page) {
  const pages = document.querySelectorAll('.page');
  pages.forEach((p) => p.classList.remove('active'));

  page.classList.add('active');

  if (page === mainPage) {
    // 메인에서는 상단바 숨김
    topBar.classList.add('hidden');
  } else {
    topBar.classList.remove('hidden');
  }
}

// 초기 메인 페이지
showPage(mainPage);

// 네비게이션
if (mainTitle) {
  mainTitle.addEventListener('click', () => {
    showPage(portfolioPage);
  });
}

if (topLogo) {
  topLogo.addEventListener('click', () => {
    showPage(portfolioPage);
  });
}

if (aboutBtn) {
  aboutBtn.addEventListener('click', () => {
    showPage(mainPage);
  });
}

if (cvBtn) {
  cvBtn.addEventListener('click', () => {
    if (cvPage) showPage(cvPage);
  });
}

if (contactBtn) {
  contactBtn.addEventListener('click', () => {
    window.open('https://www.instagram.com/chales9/', '_blank', 'noopener');
  });
}

// ==============================
// 상세 페이지 네비게이션 (버튼)
// ==============================
function updateDetailNavButtons() {
  if (!detailPrev || !detailNext) return;

  if (currentProjectIndex <= 0) {
    detailPrev.classList.add('disabled');
  } else {
    detailPrev.classList.remove('disabled');
  }

  if (currentProjectIndex >= projects.length - 1) {
    detailNext.classList.add('disabled');
  } else {
    detailNext.classList.remove('disabled');
  }
}

if (detailPrev) {
  detailPrev.addEventListener('click', () => {
    if (currentProjectIndex <= 0) return;
    const prevIndex = currentProjectIndex - 1;
    const prevProject = projects[prevIndex];
    if (prevProject) showProjectDetail(prevProject.id);
  });
}

if (detailNext) {
  detailNext.addEventListener('click', () => {
    if (currentProjectIndex >= projects.length - 1) return;
    const nextIndex = currentProjectIndex + 1;
    const nextProject = projects[nextIndex];
    if (nextProject) showProjectDetail(nextProject.id);
  });
}

// ==============================
// 캔버스 & 마퀴 패들
// ==============================
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const marqueeBar = document.querySelector('.marquee-bar');

let paddleWidth = 0;
let paddleHeight = 0;
let paddleX = 0;
let paddleY = 0;
let paddleVX = 0;

/**
 * ✅ 추가: DOM에서 마퀴바의 "진짜" 크기/위치를 읽어서
 * paddleWidth / paddleHeight / paddleX / paddleY를 최신 상태로 유지
 * - 사용자가 CSS resize로 폭을 바꾸면, rect.width가 바뀐다.
 * - 공 충돌 판정/드래그 clamp가 최신 폭을 따라가게 됨.
 */
function syncPaddleFromDom() {
  if (!marqueeBar) return;
  const rect = marqueeBar.getBoundingClientRect();
  paddleWidth = rect.width;
  paddleHeight = rect.height;
  paddleX = rect.left;
  paddleY = rect.bottom;
}

/**
 * ✅ 수정 핵심:
 * 기존 updatePaddleDom()는 매번 width를 JS가 강제로 덮어썼음.
 * → 그러면 사용자가 늘린 폭이 바로 원래대로 돌아가서 리사이즈가 불가능.
 *
 * 그래서 "left만" 업데이트하고,
 * width는 DOM(사용자 리사이즈 결과)을 존중한다.
 */
function updatePaddleDom() {
  if (!marqueeBar) return;
  marqueeBar.style.left = `${paddleX}px`;
}

/**
 * ✅ 화면 밖으로 나가지 않게 clamp
 * - paddleWidth는 syncPaddleFromDom()으로 최신값을 읽은 후 계산해야 함
 */
function clampPaddleX() {
  const maxX = canvas.width - paddleWidth;
  if (paddleX < 0) paddleX = 0;
  if (paddleX > maxX) paddleX = maxX;
}

// 패들 초기 위치/크기 계산
function initPaddle() {
  if (!marqueeBar) return;

  const viewportWidth = window.innerWidth;

  // ✅ "초기 한 번"만 기본 폭을 잡아줌(네 기존 로직 그대로 유지)
  // 이후 사용자가 resize로 바꾸는 폭은 JS가 건드리지 않게 됨.
  let initialWidth = 0;
  if (viewportWidth <= 768) {
    initialWidth = Math.min(viewportWidth * 0.4, viewportWidth);
  } else {
    initialWidth = Math.min(viewportWidth * 0.2, viewportWidth);
  }
  marqueeBar.style.width = `${initialWidth}px`;

  // DOM에서 실제 값 읽기(폭/높이/좌표)
  syncPaddleFromDom();

  // 가운데 정렬
  paddleX = (viewportWidth - paddleWidth) / 2;
  clampPaddleX();
  updatePaddleDom();

  // left 적용 후 바닥(y) 포함 재동기화
  syncPaddleFromDom();
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
initPaddle();

/**
 * ✅ 추가: ResizeObserver
 * - 사용자가 마퀴바 폭을 늘리거나 줄일 때마다 paddleWidth/paddleY 최신화
 * - 폭이 커져서 화면 밖으로 나가면 left를 자동으로 clamp
 */
if (marqueeBar && 'ResizeObserver' in window) {
  let isAdjusting = false;

  const ro = new ResizeObserver(() => {
    if (isAdjusting) return;
    isAdjusting = true;

    syncPaddleFromDom();   // 새 폭 반영
    clampPaddleX();        // 화면 밖 방지
    updatePaddleDom();     // left만 조정
    syncPaddleFromDom();   // y(bottom) 갱신

    isAdjusting = false;
  });

  ro.observe(marqueeBar);
}

/**
 * ✅ 수정: window resize 때 initPaddle()을 다시 부르면
 * 사용자가 조절한 폭이 초기폭으로 리셋될 수 있음.
 * → 캔버스만 리사이즈하고, 마퀴바는 "폭 유지 + 위치만 clamp"로 처리
 */
window.addEventListener('resize', () => {
  resizeCanvas();

  // 현재 DOM 폭/위치 기준으로 최신화
  syncPaddleFromDom();

  // 창이 줄어들면 화면 밖으로 나갈 수 있으니 left만 보정
  clampPaddleX();
  updatePaddleDom();

  // y(bottom) 다시 읽기
  syncPaddleFromDom();
});

// ==============================
// 패들 드래그: 마우스 + 터치
// ==============================
let isDraggingPaddle = false;
let lastPointerX = 0;
let lastPointerTime = 0;

/**
 * ✅ 추가: 오른쪽 끝(리사이즈 핸들 영역)을 잡을 때는
 * 드래그(이동) 시작을 막아야 브라우저 기본 resize가 동작함.
 * - 대략 오른쪽 끝 20px을 리사이즈 영역으로 취급
 */
function isOnResizeHandle(clientX, clientY) {
  if (!marqueeBar) return false;
  const rect = marqueeBar.getBoundingClientRect();
  const EDGE = 20; // 핸들 판정 범위(px)

  const nearRight = (rect.right - clientX) < EDGE;
  const nearBottom = (rect.bottom - clientY) < EDGE;

  // horizontal resize라도 브라우저에 따라 우하단 핸들이 쓰이기도 해서 둘 다 허용
  return nearRight || (nearRight && nearBottom);
}

if (marqueeBar) {
  // 마우스 드래그 시작
  marqueeBar.addEventListener('mousedown', (e) => {
    // ✅ 리사이즈하려는 클릭이면 이동 드래그를 막고 브라우저 resize를 살림
    if (isOnResizeHandle(e.clientX, e.clientY)) return;

    isDraggingPaddle = true;
    lastPointerX = e.clientX;
    lastPointerTime = performance.now();
    e.preventDefault();
  });

  // 마우스 이동
  window.addEventListener('mousemove', (e) => {
    if (!isDraggingPaddle) return;

    const now = performance.now();
    const dx = e.clientX - lastPointerX;
    const dt = now - lastPointerTime || 16;

    // dt(시간) 대비 얼마나 움직였는지 → 속도 추정
    paddleVX = (dx / dt) * 16;

    // ✅ 먼저 DOM에서 현재 폭을 읽어야 clamp가 정확함(사용자 리사이즈 반영)
    syncPaddleFromDom();

    paddleX += dx;

    clampPaddleX();
    updatePaddleDom();

    lastPointerX = e.clientX;
    lastPointerTime = now;

    // y(bottom) 갱신
    syncPaddleFromDom();
  });

  // 마우스 드래그 끝
  window.addEventListener('mouseup', () => {
    isDraggingPaddle = false;
    paddleVX = 0;
  });

  // 터치 시작
  marqueeBar.addEventListener('touchstart', (e) => {
    if (e.touches.length === 0) return;

    const touch = e.touches[0];
    isDraggingPaddle = true;
    lastPointerX = touch.clientX;
    lastPointerTime = performance.now();

    e.preventDefault();
  }, { passive: false });

  // 터치 이동
  window.addEventListener('touchmove', (e) => {
    if (!isDraggingPaddle || e.touches.length === 0) return;

    const touch = e.touches[0];
    const now = performance.now();
    const dx = touch.clientX - lastPointerX;
    const dt = now - lastPointerTime || 16;

    paddleVX = (dx / dt) * 16;

    // ✅ 터치에서도 DOM 폭을 최신화
    syncPaddleFromDom();

    paddleX += dx;

    clampPaddleX();
    updatePaddleDom();

    lastPointerX = touch.clientX;
    lastPointerTime = now;

    // y(bottom) 갱신
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

// ==============================
// 스마일 볼 클래스
// ==============================
class Ball {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;

    this.vx = (Math.random() - 0.5) * 10;
    this.vy = (Math.random() - 0.5) * 10;

    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.05;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    // 공 외곽
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = this.color;
    ctx.stroke();

    // 스마일 입
    ctx.strokeStyle = '#fcff54';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, this.radius * 0.1, this.radius * 0.5, 0, Math.PI);
    ctx.stroke();

    ctx.restore();
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    // 좌우 벽
    if (this.x + this.radius > canvas.width) {
      this.x = canvas.width - this.radius;
      this.vx = -Math.abs(this.vx);
    } else if (this.x - this.radius < 0) {
      this.x = this.radius;
      this.vx = Math.abs(this.vx);
    }

    // ✅ 마퀴바 충돌 (위쪽 벽 역할)
    // - paddleWidth/paddleY는 syncPaddleFromDom()으로 최신값 유지
    if (paddleHeight > 0) {
      const topLimit = paddleY;

      if (this.y - this.radius < topLimit) {
        const withinPaddle =
          this.x >= paddleX && this.x <= paddleX + paddleWidth;

        // 마퀴바보다 위로 올라갈 수 없게 y 고정
        this.y = topLimit + this.radius;
        this.vy = Math.abs(this.vy);

        // 패들 위에 있을 때는 패들 속도 영향을 일부 받게
        if (withinPaddle) {
          this.vx += paddleVX * 0.8;
        }
      }
    }

    // 바닥
    if (this.y + this.radius > canvas.height) {
      this.y = canvas.height - this.radius;
      this.vy = -Math.abs(this.vy);
    }

    this.rotation += this.rotationSpeed;
    this.draw();
  }
}

const balls = [];
const numBalls = 12;
const ballColor = '#fcff54';
const MAX_BALLS = 410;
let lastSpawnTime = 0;

// 공끼리 부딪히는지 체크
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

    const vx1Final = vx2;
    const vx2Final = vx1;

    ball1.vx = vx1Final * cos - vy1 * sin;
    ball1.vy = vy1 * cos + vx1Final * sin;
    ball2.vx = vx2Final * cos - vy2 * sin;
    ball2.vy = vy2 * cos + vx2Final * sin;

    const now = performance.now();
    if (balls.length < MAX_BALLS && now - lastSpawnTime > 200) {
      const newRadius = ball1.radius;
      const newBallX = (ball1.x + ball2.x) / 2;
      const newBallY = (ball1.y + ball2.y) / 2;
      const newBall = new Ball(newBallX, newBallY, newRadius, ballColor);
      balls.push(newBall);
      lastSpawnTime = now;
    }
  }
}

// 초기 공 생성 (마퀴바 아래쪽 영역에만)
syncPaddleFromDom();
for (let i = 0; i < numBalls; i++) {
  const radius = 16;
  const minY = paddleY + radius + 10;
  const maxY = canvas.height - radius * 2;
  const x = radius + Math.random() * (canvas.width - radius * 2);
  const y = minY + Math.random() * Math.max(0, maxY - minY);
  balls.push(new Ball(x, y, radius, ballColor));
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // ✅ 매 프레임 최신화(리사이즈 폭/바닥 y가 즉시 반영되게)
  syncPaddleFromDom();

  balls.forEach((ball) => ball.update());

  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      checkCollision(balls[i], balls[j]);
    }
  }

  requestAnimationFrame(animate);
}
animate();

// ==============================
// 썸네일 생성 & 프로젝트 상세
// ==============================
function createThumbnails() {
  if (!thumbnailsContainer) return;
  thumbnailsContainer.innerHTML = '';

  projects.forEach((project) => {
    const thumbnail = document.createElement('div');
    thumbnail.className = 'thumbnail';

    const img = document.createElement('img');
    img.src = project.images[0];
    img.alt = project.title;

    thumbnail.appendChild(img);

    thumbnail.addEventListener('click', () => {
      showProjectDetail(project.id);
    });

    thumbnailsContainer.appendChild(thumbnail);
  });
}

createThumbnails();

function showProjectDetail(projectId) {
  const index = projects.findIndex((p) => p.id === projectId);
  if (index === -1) return;

  currentProjectIndex = index;
  const project = projects[index];

  detailTitleEl.textContent = project.title || '';
  detailSubtitleEl.textContent = project.subtitle || '';
  detailYearEl.textContent = project.year || '';

  if (project.specs) {
    detailSpecsEl.textContent = project.specs;
    detailSpecsContainer.style.display = 'flex';
  } else {
    detailSpecsEl.textContent = '';
    detailSpecsContainer.style.display = 'none';
  }

  if (project.size) {
    detailSizeEl.textContent = project.size;
    detailSizeContainer.style.display = 'flex';
  } else {
    detailSizeEl.textContent = '';
    detailSizeContainer.style.display = 'none';
  }

  let clientText = '';
  if (Array.isArray(project.client)) {
    clientText = project.client.join(', ');
  } else if (typeof project.client === 'string') {
    clientText = project.client;
  }

  if (clientText && clientText.length > 0) {
    detailClientEl.textContent = clientText;
    detailClientContainer.style.display = 'flex';
  } else {
    detailClientEl.textContent = '';
    detailClientContainer.style.display = 'none';
  }

  detailDescriptionEl.innerHTML = project.description || '';

  const images = project.images || [];
  if (detailMainImageEl) detailMainImageEl.innerHTML = '';
  detailImagesEl.innerHTML = '';

  if (images.length > 0) {
    if (detailMainImageEl) {
      const firstImg = document.createElement('img');
      firstImg.src = images[0];
      firstImg.alt = project.title || '';
      detailMainImageEl.appendChild(firstImg);
    } else {
      const img = document.createElement('img');
      img.src = images[0];
      img.alt = project.title || '';
      detailImagesEl.appendChild(img);
    }

    for (let i = 1; i < images.length; i++) {
      const img = document.createElement('img');
      img.src = images[i];
      img.alt = project.title || '';
      detailImagesEl.appendChild(img);
    }
  }

  showPage(detailPage);
  detailPage.scrollTop = 0;

  updateDetailNavButtons();
}

// ==============================
// 🔹 모바일 스와이프 네비게이션 추가
// ==============================
if (detailPage) {
  let touchStartX = 0;
  let touchStartY = 0;

  const SWIPE_THRESHOLD = 50;      // 최소 가로 이동 거리(px)
  const VERTICAL_LIMIT = 40;       // 세로 이동이 이보다 크면 "스크롤"로 보고 무시

  detailPage.addEventListener('touchstart', (e) => {
    if (e.touches.length === 0) return;
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  }, { passive: true });

  detailPage.addEventListener('touchend', (e) => {
    if (e.changedTouches.length === 0) return;
    const touch = e.changedTouches[0];

    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;

    // 세로로 너무 많이 움직이면 → 스크롤 제스처로 보고 스와이프 무시
    if (Math.abs(dy) > VERTICAL_LIMIT) return;

    // 가로 이동이 너무 작으면 → 스와이프 아닌 것으로 무시
    if (Math.abs(dx) < SWIPE_THRESHOLD) return;

    if (dx > 0) {
      // 👉 오른쪽으로 스와이프 → 이전 프로젝트
      if (currentProjectIndex > 0) {
        const prevProject = projects[currentProjectIndex - 1];
        if (prevProject) showProjectDetail(prevProject.id);
      }
    } else {
      // 👈 왼쪽으로 스와이프 → 다음 프로젝트
      if (currentProjectIndex < projects.length - 1) {
        const nextProject = projects[currentProjectIndex + 1];
        if (nextProject) showProjectDetail(nextProject.id);
      }
    }
  }, { passive: true });
}
