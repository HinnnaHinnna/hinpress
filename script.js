// ==============================
// 공통 페이지 요소 선택
// ==============================
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

  // 메인 페이지에서는 상단바 숨기기
  if (page === mainPage) {
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
// 상세 페이지 네비게이션 버튼 상태
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

// 왼쪽/오른쪽 화살표 클릭 시 이전/다음 프로젝트로 이동
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
// 캔버스 & 마퀴 패들 설정
// ==============================
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const marqueeBar = document.querySelector('.marquee-bar');

let paddleWidth = 0;
let paddleHeight = 0;
let paddleX = 0;
let paddleY = 0;
let paddleVX = 0;

// 마퀴바 DOM 위치/폭을 갱신하는 함수
function updatePaddleDom() {
  if (!marqueeBar) return;
  marqueeBar.style.width = `${paddleWidth}px`;
  marqueeBar.style.left = `${paddleX}px`;
}

// 초기 패들 길이/위치 계산
function initPaddle() {
  if (!marqueeBar) return;

  paddleHeight = marqueeBar.offsetHeight || 0;
  const viewportWidth = window.innerWidth;

  if (viewportWidth <= 768) {
    // 모바일에서 패들 길이를 더 길게
    paddleWidth = Math.min(viewportWidth * 0.4, viewportWidth);
  } else {
    paddleWidth = Math.min(viewportWidth * 0.2, viewportWidth);
  }

  // 가운데 정렬
  paddleX = (viewportWidth - paddleWidth) / 2;

  // 화면에서의 실제 y 위치
  const rect = marqueeBar.getBoundingClientRect();
  paddleY = rect.bottom;

  updatePaddleDom();
}

// 캔버스 크기를 화면에 맞게 설정
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

if (marqueeBar) {
  // 마우스 드래그 시작
  marqueeBar.addEventListener('mousedown', (e) => {
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

    paddleVX = (dx / dt) * 16; // 속도 계산

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
// 모바일 기울기(자이로) 제어
// ==============================

// 한 번만 권한 요청하기 위한 플래그
let tiltEnabled = false;

// 기울기 값으로 패들 위치 조정
function handleOrientation(event) {
  // 데스크탑에서는 무시
  if (window.innerWidth > 768) return;

  let gamma = event.gamma; // -90 ~ 90
  if (gamma === null || typeof gamma === 'undefined') return;

  // 너무 심한 값은 클램프
  const maxTilt = 30; // 좌우 30도까지만 사용
  gamma = Math.max(-maxTilt, Math.min(maxTilt, gamma)); // -30 ~ 30

  // gamma를 0~1 비율로 변환
  const ratio = (gamma + maxTilt) / (2 * maxTilt); // 0~1
  const maxX = canvas.width - paddleWidth;

  paddleX = maxX * ratio;
  updatePaddleDom();
}

// 클릭/터치 한 번 발생했을 때 권한 요청 + 이벤트 연결
function enableTiltControlOnce() {
  if (tiltEnabled) return;
  tiltEnabled = true;

  // iOS 13+ : 권한 요청 필요
  if (typeof DeviceOrientationEvent !== 'undefined' &&
    typeof DeviceOrientationEvent.requestPermission === 'function') {

    DeviceOrientationEvent.requestPermission()
      .then((state) => {
        if (state === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation);
        } else {
          console.warn('DeviceOrientation permission not granted:', state);
        }
      })
      .catch((err) => {
        console.warn('DeviceOrientation permission error:', err);
      });

  } else if ('DeviceOrientationEvent' in window) {
    // 안드로이드 / 일부 브라우저
    window.addEventListener('deviceorientation', handleOrientation);
  } else {
    console.warn('DeviceOrientationEvent is not supported on this device.');
  }
}

// 모바일에서만 자이로 권한 요청 시도
if (window.innerWidth <= 768) {
  window.addEventListener('click', enableTiltControlOnce, { once: true });
  window.addEventListener('touchstart', enableTiltControlOnce, { once: true });
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

    // 마퀴바 아래에서 튕기기
    if (paddleHeight > 0) {
      const topLimit = paddleY;

      if (this.y - this.radius < topLimit) {
        const withinPaddle =
          this.x >= paddleX && this.x <= paddleX + paddleWidth;

        this.y = topLimit + this.radius;
        this.vy = Math.abs(this.vy);

        if (withinPaddle) {
          // 패들이 움직였던 속도만큼 x 방향 속도 추가
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

// 공끼리 충돌 체크
function checkCollision(ball1, ball2) {
  const dx = ball2.x - ball1.x;
  const dy = ball2.y - ball1.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance < ball1.radius + ball2.radius) {
    const angle = Math.atan2(dy, dx);
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);

    // 회전 좌표계로 속도 변환
    const vx1 = ball1.vx * cos + ball1.vy * sin;
    const vy1 = ball1.vy * cos - ball1.vx * sin;
    const vx2 = ball2.vx * cos + ball2.vy * sin;
    const vy2 = ball2.vy * cos - ball2.vx * sin;

    // 1차원 탄성 충돌 (x방향 속도를 서로 교환)
    const vx1Final = vx2;
    const vx2Final = vx1;

    // 다시 원래 좌표계로 변환
    ball1.vx = vx1Final * cos - vy1 * sin;
    ball1.vy = vy1 * cos + vx1Final * sin;
    ball2.vx = vx2Final * cos - vy2 * sin;
    ball2.vy = vy2 * cos + vx2Final * sin;

    // 충돌 시 새로운 공 생성 (퍼지는 느낌)
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

// 초기 공 생성 (마퀴바 아래쪽 범위에서만)
for (let i = 0; i < numBalls; i++) {
  const radius = 16;
  const minY = paddleY + radius + 10;
  const maxY = canvas.height - radius * 2;
  const x = radius + Math.random() * (canvas.width - radius * 2);
  const y = minY + Math.random() * Math.max(0, maxY - minY);
  balls.push(new Ball(x, y, radius, ballColor));
}

// 애니메이션 루프
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

    // 썸네일 클릭 시 상세 페이지로
    thumbnail.addEventListener('click', () => {
      showProjectDetail(project.id);
    });

    thumbnailsContainer.appendChild(thumbnail);
  });
}
createThumbnails();

// 상세 페이지 구성 함수
function showProjectDetail(projectId) {
  const index = projects.findIndex((p) => p.id === projectId);
  if (index === -1) return;

  currentProjectIndex = index;
  const project = projects[index];

  detailTitleEl.textContent = project.title || '';
  detailSubtitleEl.textContent = project.subtitle || '';
  detailYearEl.textContent = project.year || '';

  // 제본
  if (project.specs) {
    detailSpecsEl.textContent = project.specs;
    detailSpecsContainer.style.display = 'flex';
  } else {
    detailSpecsEl.textContent = '';
    detailSpecsContainer.style.display = 'none';
  }

  // 사양
  if (project.size) {
    detailSizeEl.textContent = project.size;
    detailSizeContainer.style.display = 'flex';
  } else {
    detailSizeEl.textContent = '';
    detailSizeContainer.style.display = 'none';
  }

  // 의뢰인/기관
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

  // 설명 (HTML 그대로 사용)
  detailDescriptionEl.innerHTML = project.description || '';

  // 이미지들
  const images = project.images || [];
  if (detailMainImageEl) detailMainImageEl.innerHTML = '';
  detailImagesEl.innerHTML = '';

  if (images.length > 0) {
    // 첫 번째 이미지는 상단 메인 이미지
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

    // 나머지 이미지들
    for (let i = 1; i < images.length; i++) {
      const img = document.createElement('img');
      img.src = images[i];
      img.alt = project.title || '';
      detailImagesEl.appendChild(img);
    }
  }

  // 상세 페이지로 전환
  showPage(detailPage);
  detailPage.scrollTop = 0;

  updateDetailNavButtons();
}
