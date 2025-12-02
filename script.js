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
    // 페이지 전환
    // ==============================
    function showPage(page) {
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      page.classList.add('active');

      if (page === mainPage) {
        topBar.classList.add('hidden');
      } else {
        topBar.classList.remove('hidden');
      }
    }

    showPage(mainPage);

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
    // 상세페이지 ← / → 버튼 상태
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

    function updatePaddleDom() {
      if (!marqueeBar) return;
      marqueeBar.style.width = `${paddleWidth}px`;
      marqueeBar.style.left = `${paddleX}px`;
    }

    function initPaddle() {
      if (!marqueeBar) return;

      paddleHeight = marqueeBar.offsetHeight || 0;
      const vw = window.innerWidth;

      if (vw <= 768) {
        paddleWidth = Math.min(vw * 0.4, vw);
      } else {
        paddleWidth = Math.min(vw * 0.2, vw);
      }

      paddleX = (vw - paddleWidth) / 2;

      const rect = marqueeBar.getBoundingClientRect();
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
    // 패들 드래그 (마우스 + 터치)
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

      window.addEventListener('mousemove', (e) => {
        if (!isDraggingPaddle) return;

        const now = performance.now();
        const dx = e.clientX - lastPointerX;
        const dt = now - lastPointerTime || 16;
        paddleVX = (dx / dt) * 16;

        paddleX += dx;
        const maxX = canvas.width - paddleWidth;
        if (paddleX < 0) paddleX = 0;
        if (paddleX > maxX) paddleX = maxX;

        updatePaddleDom();

        lastPointerX = e.clientX;
        lastPointerTime = now;
      });

      window.addEventListener('mouseup', () => {
        isDraggingPaddle = false;
        paddleVX = 0;
      });

      marqueeBar.addEventListener('touchstart', (e) => {
        if (e.touches.length === 0) return;
        const touch = e.touches[0];
        isDraggingPaddle = true;
        lastPointerX = touch.clientX;
        lastPointerTime = performance.now();
        e.preventDefault();
      }, { passive: false });

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
    let tiltEnabled = false;

    function handleOrientation(event) {
      if (window.innerWidth > 768) return;

      let gamma = event.gamma; // -90 ~ 90
      if (gamma === null || typeof gamma === 'undefined') return;

      const maxTilt = 30;
      gamma = Math.max(-maxTilt, Math.min(maxTilt, gamma)); // -30 ~ 30

      const ratio = (gamma + maxTilt) / (2 * maxTilt); // 0 ~ 1
      const maxX = canvas.width - paddleWidth;

      paddleX = maxX * ratio;
      updatePaddleDom();
    }

    function enableTiltControlOnce() {
      if (tiltEnabled) return;
      tiltEnabled = true;

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
        window.addEventListener('deviceorientation', handleOrientation);
      } else {
        console.warn('DeviceOrientationEvent is not supported on this device.');
      }
    }

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
          const topLimit = paddleY;

          if (this.y - this.radius < topLimit) {
            const withinPaddle = this.x >= paddleX && this.x <= paddleX + paddleWidth;

            this.y = topLimit + this.radius;
            this.vy = Math.abs(this.vy);

            if (withinPaddle) {
              this.vx += paddleVX * 0.8;
            }
          }
        }

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

      balls.forEach(ball => ball.update());

      for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
          checkCollision(balls[i], balls[j]);
        }
      }

      requestAnimationFrame(animate);
    }
    animate();

    // ==============================
    // 썸네일 / 상세페이지
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
