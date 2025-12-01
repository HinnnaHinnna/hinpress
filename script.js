// ==============================
// 공통 페이지 요소 선택
// ==============================
const mainPage = document.getElementById('main-page');
const portfolioPage = document.getElementById('portfolio-page');
const detailPage = document.getElementById('detail-page');
const cvPage = document.getElementById('cv-page'); // 🔹 CV 페이지

const mainTitle = document.getElementById('main-title');

const topBar = document.getElementById('top-bar');
const topLogo = document.getElementById('top-logo');
const aboutBtn = document.getElementById('about-btn');
const cvBtn = document.getElementById('cv-btn');           // 🔹 CV 버튼
const contactBtn = document.getElementById('contact-btn'); // 🔹 Contact 버튼

const thumbnailsContainer = document.getElementById('thumbnails-container');

const detailPrev = document.getElementById('detail-prev');
const detailNext = document.getElementById('detail-next');

// ==============================
// 상세 정보 영역 요소들
// ==============================
const detailTitleEl = document.getElementById('detail-title');
const detailSubtitleEl = document.getElementById('detail-subtitle');
const detailYearEl = document.getElementById('detail-year');
const detailSpecsEl = document.getElementById('detail-specs');
const detailSizeEl = document.getElementById('detail-size');
const detailClientEl = document.getElementById('detail-client');
const detailDescriptionEl = document.getElementById('detail-description');

// 첫 번째 이미지를 넣을 영역
const detailMainImageEl = document.getElementById('detail-main-image');

// 두 번째 이후 이미지를 넣을 영역
const detailImagesEl = document.getElementById('detail-images');

// 사양/크기/의뢰 라벨 박스 (값 없을 때 숨기기 위함)
const detailSpecsContainer = document.getElementById('detail-specs-container');
const detailSizeContainer = document.getElementById('detail-size-container');
const detailClientContainer = document.getElementById('detail-client-container');

// 현재 보고 있는 프로젝트 인덱스 (projects 배열의 인덱스)
let currentProjectIndex = -1;

// ==============================
// 페이지 전환 함수
// ==============================
function showPage(page) {
  const pages = document.querySelectorAll('.page');
  pages.forEach((p) => p.classList.remove('active'));

  page.classList.add('active');

  // 메인 페이지에서는 상단 바 숨기고, 나머지 페이지에서는 표시
  if (page === mainPage) {
    topBar.classList.add('hidden');
  } else {
    topBar.classList.remove('hidden');
  }
}

// 초기에는 메인 페이지 보이게 설정
showPage(mainPage);

// ==============================
// 상단 바 & 타이틀 네비게이션
// ==============================

// 메인 페이지 중앙 타이틀 클릭 → 포트폴리오 페이지
if (mainTitle) {
  mainTitle.addEventListener('click', () => {
    showPage(portfolioPage);
  });
}

// 상단 바 중앙의 "작업들" 로고 클릭 → 포트폴리오 페이지
if (topLogo) {
  topLogo.addEventListener('click', () => {
    showPage(portfolioPage);
  });
}

// "힌프레스" 버튼 클릭 → 메인 페이지
if (aboutBtn) {
  aboutBtn.addEventListener('click', () => {
    showPage(mainPage);
  });
}

// 🔹 "CV" 버튼 클릭 → CV 페이지
if (cvBtn) {
  cvBtn.addEventListener('click', () => {
    if (cvPage) {
      showPage(cvPage);
    }
  });
}

// 🔹 "Contact" 버튼 클릭 → 인스타그램 새 탭
if (contactBtn) {
  contactBtn.addEventListener('click', () => {
    window.open('https://www.instagram.com/chales9/', '_blank', 'noopener');
  });
}

// ==============================
// 상세 페이지 ← / → 네비게이션
// ==============================

// 현재 인덱스에 따라 ←, → 버튼 활성/비활성 상태 갱신
function updateDetailNavButtons() {
  if (!detailPrev || !detailNext) return;

  // 첫 번째 프로젝트면 ← 비활성
  if (currentProjectIndex <= 0) {
    detailPrev.classList.add('disabled');
  } else {
    detailPrev.classList.remove('disabled');
  }

  // 마지막 프로젝트면 → 비활성
  if (currentProjectIndex >= projects.length - 1) {
    detailNext.classList.add('disabled');
  } else {
    detailNext.classList.remove('disabled');
  }
}

// ← 버튼 클릭 → 이전 프로젝트 (첫 번째에서는 동작하지 않음)
if (detailPrev) {
  detailPrev.addEventListener('click', () => {
    if (currentProjectIndex <= 0) return; // 첫 번째면 아무 동작 안 함

    const prevIndex = currentProjectIndex - 1;
    const prevProject = projects[prevIndex];
    if (prevProject) {
      showProjectDetail(prevProject.id);
    }
  });
}

// → 버튼 클릭 → 다음 프로젝트 (마지막에서는 동작하지 않음)
if (detailNext) {
  detailNext.addEventListener('click', () => {
    if (currentProjectIndex >= projects.length - 1) return; // 마지막이면 아무 동작 안 함

    const nextIndex = currentProjectIndex + 1;
    const nextProject = projects[nextIndex];
    if (nextProject) {
      showProjectDetail(nextProject.id);
    }
  });
}

// ==============================
// 캔버스 & 스마일 볼 물리 애니메이션
// ==============================
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// 상단 흐르는 글 바 (마퀴 바) 요소
const marqueeBar = document.querySelector('.marquee-bar');

/* 🔹 마퀴 바 랜덤 흔들림 효과
   - 텍스트(.marquee-inner)의 흐름 애니메이션은 그대로 두고
   - 바 컨테이너(.marquee-bar)에만 .shake 클래스를 붙였다가 떼서
     barShake 키프레임을 한 번 재생시키는 방식
*/
if (marqueeBar) {
  // 한 번 "달그락" 흔들기
  function shakeBarOnce() {
    // 이미 흔들리는 중이면 중복 적용 방지 (선택 사항)
    if (marqueeBar.classList.contains('shake')) {
      scheduleNextShake();
      return;
    }

    marqueeBar.classList.add('shake');

    // CSS에서 0.25초로 설정했으니, 약간 여유를 두고 클래스 제거
    setTimeout(() => {
      marqueeBar.classList.remove('shake');
      scheduleNextShake(); // 다음 흔들림 예약
    }, 300);
  }

  // 다음 흔들림 타이밍을 랜덤으로 예약
  function scheduleNextShake() {
    // 최소/최대 딜레이를 적당히 조절해서 "가끔" 흔들리게
    const minDelay = 0; // 0초
    const maxDelay = 3000; // 3초
    const delay = minDelay + Math.random() * (maxDelay - minDelay);

    setTimeout(shakeBarOnce, delay);
  }

  // 페이지 로드 후 첫 흔들림 예약 시작
  scheduleNextShake();
}

// "바" (브레이크아웃 패들) 물리 상태
let paddleWidth = 0;
let paddleHeight = 0;
let paddleX = 0;     // 화면 기준 왼쪽 좌표
let paddleY = 0;     // 공 좌표계에서의 "천장 높이" (바의 아랫면)
let paddleVX = 0;    // 최근 드래그 속도 (px/frame 근사값)

// 바 DOM 스타일 갱신
function updatePaddleDom() {
  if (!marqueeBar) return;
  marqueeBar.style.width = `${paddleWidth}px`;
  marqueeBar.style.left = `${paddleX}px`;
}

// 바 초기화 (화면 크기 기준)
function initPaddle() {
  if (!marqueeBar) return;

  // 바 높이: CSS에서 지정한 height 사용
  paddleHeight = marqueeBar.offsetHeight || 0;

  // 바 가로 길이: 화면의 20% 정도
  paddleWidth = Math.min(window.innerWidth * 0.2, window.innerWidth);

  // 가운데 정렬
  paddleX = (window.innerWidth - paddleWidth) / 2;

  // 바의 아랫면 y 좌표
  const rect = marqueeBar.getBoundingClientRect();
  paddleY = rect.bottom;

  updatePaddleDom();
}

// 캔버스를 브라우저 창 크기에 맞게 조절
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

// 최초 한 번 초기화 + 리사이즈 대응
resizeCanvas();
initPaddle();
window.addEventListener('resize', () => {
  resizeCanvas();
  initPaddle();
});

// ==============================
// 바 드래그(벽돌 게임 패들처럼)
// ==============================
let isDraggingPaddle = false;
let lastPointerX = 0;
let lastPointerTime = 0;

if (marqueeBar) {
  marqueeBar.addEventListener('mousedown', (e) => {
    isDraggingPaddle = true;
    lastPointerX = e.clientX;
    lastPointerTime = performance.now();
    e.preventDefault();
  });

  window.addEventListener('mouseup', () => {
    isDraggingPaddle = false;
    paddleVX = 0; // 드래그 끝나면 속도 0으로
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDraggingPaddle) return;

    const now = performance.now();
    const dx = e.clientX - lastPointerX;
    const dt = now - lastPointerTime || 16; // ms, 1프레임 ≒16ms 가정

    // 드래그 속도 → 1프레임당 픽셀 속도로 근사
    paddleVX = (dx / dt) * 16;

    // 바 위치 업데이트
    paddleX += dx;

    // 화면 밖으로 나가지 않게 클램프
    const maxX = canvas.width - paddleWidth;
    if (paddleX < 0) paddleX = 0;
    if (paddleX > maxX) paddleX = maxX;

    updatePaddleDom();

    lastPointerX = e.clientX;
    lastPointerTime = now;
  });
}

// ==============================
// 스마일 볼 클래스 정의
// ==============================
class Ball {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;

    // 속도
    this.vx = (Math.random() - 0.5) * 10;
    this.vy = (Math.random() - 0.5) * 10;

    // 회전 값
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.05;
  }

  // 스마일 볼 그리기
  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    // 얼굴 (노란 원)
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = this.color;
    ctx.stroke(); // 테두리만

    // 스마일 입 (반원 아크)
    ctx.strokeStyle = '#b5ff16ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, this.radius * 0.1, this.radius * 0.5, 0, Math.PI);
    ctx.stroke();

    ctx.restore();
  }

  // 위치/속도 업데이트 + 충돌 처리
  update() {
    // 1) 속도만큼 위치 이동
    this.x += this.vx;
    this.y += this.vy;

    // 2) 좌우 벽과 충돌
    if (this.x + this.radius > canvas.width) {
      this.x = canvas.width - this.radius;
      this.vx = -Math.abs(this.vx);
    } else if (this.x - this.radius < 0) {
      this.x = this.radius;
      this.vx = Math.abs(this.vx);
    }

    // 3) 상단 바(마퀴 바)의 아랫면과 충돌
    if (paddleHeight > 0) {
      const topLimit = paddleY; // 바의 아랫면 y좌표

      if (this.y - this.radius < topLimit) {
        const withinPaddle =
          this.x >= paddleX && this.x <= paddleX + paddleWidth;

        this.y = topLimit + this.radius;
        this.vy = Math.abs(this.vy);

        if (withinPaddle) {
          this.vx += paddleVX * 0.8;
        }
      }
    }

    // 4) 바닥과 충돌
    if (this.y + this.radius > canvas.height) {
      this.y = canvas.height - this.radius;
      this.vy = -Math.abs(this.vy);
    }

    // 5) 회전값 업데이트 + 그리기
    this.rotation += this.rotationSpeed;
    this.draw();
  }
}

// 공들끼리 충돌 처리 + 충돌 시 새로운 공 생성
const balls = [];
const numBalls = 12;
const ballColor = '#fcff54';

// 새 공을 너무 많이 만들지 않기 위한 제한
const MAX_BALLS = 410;
let lastSpawnTime = 0; // ms 단위

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

    // 🔹 충돌 시 새 공 생성
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

// 공 여러 개 생성 (상단 바 아래에서만 랜덤 배치)
for (let i = 0; i < numBalls; i++) {
  const radius = 16;
  const minY = paddleY + radius + 10; // 바 아래쪽에서 시작
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
// 포트폴리오 썸네일 생성
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

// ==============================
// 프로젝트 상세 페이지 표시
// ==============================
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

  // 🔹 의뢰(client) 처리: 배열/문자열 모두 지원
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

  // 🔹 설명: HTML 허용 (링크, <br> 등)
  detailDescriptionEl.innerHTML = project.description || '';

  const images = project.images || [];

  if (detailMainImageEl) {
    detailMainImageEl.innerHTML = '';
  }
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
