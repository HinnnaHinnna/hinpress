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

// DOM 상의 마퀴바 위치/크기를 JS에서 업데이트
function updatePaddleDom() {
  if (!marqueeBar) return;
  marqueeBar.style.width = `${paddleWidth}px`;
  marqueeBar.style.left = `${paddleX}px`;
}

// 패들 초기 위치/크기 계산
function initPaddle() {
  if (!marqueeBar) return;

  paddleHeight = marqueeBar.offsetHeight || 0;
  const viewportWidth = window.innerWidth;

  if (viewportWidth <= 768) {
    // 모바일에서 좀 더 긴 패들
    paddleWidth = Math.min(viewportWidth * 0.4, viewportWidth);
  } else {
    paddleWidth = Math.min(viewportWidth * 0.2, viewportWidth);
  }

  paddleX = (viewportWidth - paddleWidth) / 2;

  const rect = marqueeBar.getBoundingClientRect();
  // 마퀴바의 "바닥" y좌표를 패들의 상단 역할로 사용
  paddleY = rect.bottom;

  updatePaddleDom();
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
initPaddle();

window.addEventListener('resize', () => {
  resizeCanvas();
  initPaddle();
});

// ==============================
// 패들 드래그: 마우스 + 터치
// ==============================
let isDraggingPaddle = false;
let lastPointerX = 0;
let lastPointerTime = 0;

// 자이로(기울기) permission 설정 플래그
let orientationHandlerAttached = false;

// 기울기 이벤트 핸들러
function handleOrientation(event) {
  // 모바일 화면에서만 동작
  if (window.innerWidth > 768) return;

  const gamma = event.gamma; // 좌우 기울기 (-90 ~ 90)
  if (gamma === null) return;

  if (typeof handleOrientation.lastGamma === 'undefined' || handleOrientation.lastGamma === null) {
    handleOrientation.lastGamma = gamma;
    const msg = '📱 기울기 감지 시작, gamma: ' + gamma.toFixed(1);
    console.log(msg);
    addDebugMessage(msg);
    return;
  }

  // 이전 프레임 대비 기울기 차이만 사용
  const deltaGamma = gamma - handleOrientation.lastGamma;
  handleOrientation.lastGamma = gamma;

  const sensitivity = 2.0; // 좌우 이동 민감도

  paddleX += deltaGamma * sensitivity;

  const maxX = canvas.width - paddleWidth;
  if (paddleX < 0) paddleX = 0;
  if (paddleX > maxX) paddleX = maxX;

  const msg = '🔄 기울기: ' + gamma.toFixed(1) + ' | paddleX: ' + paddleX.toFixed(1);
  console.log(msg);
  addDebugMessage(msg);

  updatePaddleDom();
}

// 자이로(기울기) 사용 허용 요청
function setupTiltControl() {
  if (orientationHandlerAttached) {
    const msg = '⚠️ 이미 기울기 센서 활성화됨';
    console.log(msg);
    addDebugMessage(msg);
    return;
  }
  orientationHandlerAttached = true;

  addDebugMessage('🔹 기울기 권한 요청 시작');
  addDebugMessage('📊 화면: ' + window.innerWidth + 'px');

  // iOS 13+ : 권한 요청 필요
  if (typeof DeviceOrientationEvent !== 'undefined' &&
    typeof DeviceOrientationEvent.requestPermission === 'function') {

    addDebugMessage('🍎 iOS - 권한 요청 중...');
    DeviceOrientationEvent.requestPermission()
      .then((response) => {
        addDebugMessage('📱 iOS 응답: ' + response);
        if (response === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation);
          addDebugMessage('✅ iOS 기울기 허용됨!');
        } else {
          addDebugMessage('❌ iOS 기울기 거부됨');
        }
      })
      .catch((err) => {
        addDebugMessage('❌ 오류: ' + err.message);
        console.error('❌ DeviceOrientation permission error:', err);
      });
  } else if (window.DeviceOrientationEvent) {
    // 안드로이드/일부 브라우저: 바로 사용 가능
    window.addEventListener('deviceorientation', handleOrientation);
    addDebugMessage('✅ Android 센서 활성화됨!');
    addDebugMessage('핸드폰을 기울여보세요');
  } else {
    addDebugMessage('❌ 센서 미지원 기기');
  }
}

// 🔹 페이지 로드 시 바로 기울기 센서 활성화 시도 (안드로이드에서 작동)
console.log('🔧 script.js 로드 완료');

// 🔹 화면 디버깅 패널
const debugPanel = document.getElementById('debug-panel');
const debugContent = document.getElementById('debug-content');
let debugMessages = [];

function addDebugMessage(msg) {
  console.log(msg);
  debugMessages.push(msg);
  if (debugMessages.length > 15) debugMessages.shift();
  if (debugContent) {
    debugContent.innerHTML = debugMessages.join('<br>');
  }
}

// 모바일에서만 디버그 패널 표시
if (window.innerWidth <= 768 && debugPanel) {
  debugPanel.style.display = 'block';
  addDebugMessage('🔧 script.js 로드 완료');
  addDebugMessage('📱 화면 너비: ' + window.innerWidth);
  addDebugMessage('📱 User-Agent: ' + (navigator.userAgent.includes('iPhone') ? 'iPhone' : navigator.userAgent.includes('Android') ? 'Android' : '기타'));
  
  // iOS Safari 확인
  const isIOSSafari = /iPhone|iPad|iPod/.test(navigator.userAgent) && /Safari/.test(navigator.userAgent) && !/CriOS|FxiOS|OPiOS/.test(navigator.userAgent);
  const isIOSChrome = /iPhone|iPad|iPod/.test(navigator.userAgent) && /CriOS/.test(navigator.userAgent);
  
  if (isIOSChrome) {
    addDebugMessage('⚠️ iOS 크롬 감지! Safari를 사용하세요!');
  } else if (isIOSSafari) {
    addDebugMessage('✅ iOS Safari 감지');
  }
}

// DOMContentLoaded와 load 둘 다 시도
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎯 DOMContentLoaded 이벤트 발생');
  // iOS가 아닌 경우(안드로이드 등) 바로 활성화
  if (typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission !== 'function') {
    console.log('🚀 DOMContentLoaded - 기울기 센서 자동 활성화 시도');
    setupTiltControl();
  } else {
    console.log('⏸️ iOS 감지 - 사용자 터치 대기 중');
  }
});

window.addEventListener('load', () => {
  console.log('🎯 window load 이벤트 발생');
  // iOS가 아닌 경우(안드로이드 등) 바로 활성화
  if (typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission !== 'function') {
    console.log('🚀 window load - 기울기 센서 자동 활성화 시도');
    setupTiltControl();
  }
});

// 🔹 메인 페이지 전체에서 터치 시 권한 요청 (iOS용)
if (mainPage) {
  console.log('✅ mainPage 찾음 - 터치 이벤트 리스너 등록');
  mainPage.addEventListener('touchstart', (e) => {
    console.log('👆 mainPage touchstart 이벤트 발생');
    setupTiltControl();
  }, { once: true, passive: true });
  
  mainPage.addEventListener('click', (e) => {
    console.log('🖱️ mainPage click 이벤트 발생');
    setupTiltControl();
  }, { once: true });
} else {
  console.log('❌ mainPage를 찾을 수 없습니다');
}

if (marqueeBar) {
  // 마우스 드래그 시작
  marqueeBar.addEventListener('mousedown', (e) => {
    isDraggingPaddle = true;
    lastPointerX = e.clientX;
    lastPointerTime = performance.now();
    setupTiltControl(); // 첫 인터랙션 때 자이로 권한 요청
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

    paddleX += dx;

    const maxX = canvas.width - paddleWidth;
    if (paddleX < 0) paddleX = 0;
    if (paddleX > maxX) paddleX = maxX;

    updatePaddleDom();

    lastPointerX = e.clientX;
    lastPointerTime = now;
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

    setupTiltControl(); // 모바일에서 첫 터치 시 자이로 권한 요청

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

    paddleX += dx;
    const maxX = canvas.width - paddleWidth;
    if (paddleX < 0) paddleX = 0;
    if (paddleX > maxX) paddleX = maxX;

    updatePaddleDom();

    lastPointerX = touch.clientX;
    lastPointerTime = now;

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

    // 마퀴바 충돌 (위쪽 벽 역할)
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
