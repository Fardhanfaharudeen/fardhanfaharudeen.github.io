/* ── Cartoon Fireworks Engine ─────────────────────────────────── */
function launchCartoonFireworks() {
    const canvas = document.getElementById('fireworks-canvas');
    if (!canvas) return;

    const parent = canvas.parentElement; // .mobile-container
    function resizeCanvas() {
        canvas.width  = parent.clientWidth;
        canvas.height = parent.clientHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const ctx = canvas.getContext('2d');

    const ALL_COLORS = [
        '#FF1493', '#FF0055', '#FF4500', '#FF8500', '#FFD700', '#FFE600', 
        '#00FF66', '#00F5D4', '#00E5FF', '#70D6FF', '#6C63FF', '#7B2CBF', 
        '#9D00FF', '#F72585', '#FF00A0', '#FFAFCC', '#05FFA1', '#FF9F1C'
    ];
    const rockets    = [];
    const particles  = [];
    const shockwaves = [];
    let lastLaunch   = 0;
    let nextInterval = 450;

    let lastColor = '';
    function getNextColor() {
        let chosen = ALL_COLORS[Math.floor(Math.random() * ALL_COLORS.length)];
        let attempts = 0;
        while (chosen === lastColor && attempts < 10) {
            chosen = ALL_COLORS[Math.floor(Math.random() * ALL_COLORS.length)];
            attempts++;
        }
        lastColor = chosen;
        return chosen;
    }

    /* ── Live bounding box of the Promise container & the Couple ── */
    function getTargetZones() {
        const widget = document.getElementById('reunion-widget');
        if (!widget) return null;
        const wRect = widget.getBoundingClientRect();
        const cRect = canvas.getBoundingClientRect();

        const box = {
            left:   wRect.left - cRect.left,
            top:    wRect.top - cRect.top,
            right:  wRect.right - cRect.left,
            bottom: wRect.bottom - cRect.top,
            width:  wRect.width,
            height: wRect.height
        };

        const hugEl = document.getElementById('char-hug');
        let hugBox = null;
        if (hugEl && hugEl.classList.contains('visible')) {
            const hRect = hugEl.getBoundingClientRect();
            hugBox = {
                left:   Math.max(0, hRect.left - cRect.left - 4),
                top:    Math.max(0, hRect.top - cRect.top - 4),
                width:  hRect.width + 8,
                height: hRect.height + 8
            };
        }

        return { box, hugBox };
    }

    /* ── Rocket — shoots up and hits INSIDE the promise container ── */
    class Rocket {
        constructor() {
            const info = getTargetZones();
            const box = info ? info.box : {
                left: canvas.width * 0.08,
                top: canvas.height * 0.45,
                width: canvas.width * 0.84,
                height: canvas.height * 0.45
            };

            // 5 randomized hit/burst zones INSIDE the Promise container:
            const zone = Math.floor(Math.random() * 5);
            let tx, ty, startX;

            if (zone === 0) {
                // Left flank inside container
                tx = box.left + box.width * (0.08 + Math.random() * 0.18);
                ty = box.top + box.height * (0.24 + Math.random() * 0.32);
                startX = tx + (Math.random() - 0.5) * 20;
            } else if (zone === 1) {
                // Upper Left inside container
                tx = box.left + box.width * (0.12 + Math.random() * 0.20);
                ty = box.top + box.height * (0.10 + Math.random() * 0.18);
                startX = tx + (Math.random() - 0.5) * 30;
            } else if (zone === 2) {
                // High Center Sky inside container (well above couple)
                tx = box.left + box.width * (0.35 + Math.random() * 0.30);
                ty = box.top + box.height * (0.06 + Math.random() * 0.16);
                startX = Math.random() < 0.5 
                    ? box.left + box.width * (0.08 + Math.random() * 0.16)
                    : box.left + box.width * (0.76 + Math.random() * 0.16);
            } else if (zone === 3) {
                // Upper Right inside container
                tx = box.left + box.width * (0.68 + Math.random() * 0.20);
                ty = box.top + box.height * (0.10 + Math.random() * 0.18);
                startX = tx + (Math.random() - 0.5) * 30;
            } else {
                // Right flank inside container
                tx = box.left + box.width * (0.74 + Math.random() * 0.18);
                ty = box.top + box.height * (0.24 + Math.random() * 0.32);
                startX = tx + (Math.random() - 0.5) * 20;
            }

            this.targetX = tx;
            this.targetY = ty;
            this.x = Math.max(10, Math.min(canvas.width - 10, startX));
            // Launch from below the promise container / bottom of mobile screen
            this.y = Math.min(canvas.height + 6, box.bottom + 45);

            const totalDy = this.y - this.targetY;
            const totalDx = this.targetX - this.x;
            const speed   = 6.5 + Math.random() * 3.0;
            const frames  = Math.max(16, totalDy / speed);
            this.vx       = totalDx / frames;
            this.vy       = speed;

            // Each burst gets its own single vibrant color, avoiding repeats
            this.color = getNextColor();
            this.trail = [];
            this.done  = false;
        }

        update() {
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > 9) this.trail.shift();
            this.x += this.vx;
            this.y -= this.vy;
            // Bursts the instant it reaches target location INSIDE the promise container
            if (this.y <= this.targetY) {
                this.x = this.targetX;
                this.y = this.targetY;
                this.explode();
                this.done = true;
            }
        }

        draw() {
            for (let i = 0; i < this.trail.length; i++) {
                const t = (i + 1) / this.trail.length;
                ctx.beginPath();
                ctx.arc(this.trail[i].x, this.trail[i].y, 2 * t, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.globalAlpha = t * 0.65;
                ctx.fill();
                ctx.globalAlpha = 1;
            }
            ctx.beginPath();
            ctx.arc(this.x, this.y, 3.5, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.shadowColor = this.color;
            ctx.shadowBlur  = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        explode() {
            const count = 28 + Math.floor(Math.random() * 12);

            // Each burst is ONE vibrant color: all star particles share this firework's color
            for (let i = 0; i < count; i++) {
                const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.25;
                // High outward expansion speed (2.8 to 6.2 px/frame) so sparks fly beyond the Promise container
                const spd   = 2.8 + Math.random() * 3.4;
                particles.push(new Particle(
                    this.x, this.y, this.color,
                    Math.cos(angle) * spd, Math.sin(angle) * spd, 'star'
                ));
            }

            // Glitter sparks matching this firework's single color with diamond twinkle
            for (let i = 0; i < 14; i++) {
                const angle = Math.random() * Math.PI * 2;
                const spd   = 1.5 + Math.random() * 3.4;
                const dotColor = Math.random() < 0.3 ? '#FFFFFF' : this.color;
                particles.push(new Particle(
                    this.x, this.y, dotColor,
                    Math.cos(angle) * spd,
                    Math.sin(angle) * spd, 'dot'
                ));
            }

            shockwaves.push(new Shockwave(this.x, this.y, this.color));
        }
    }

    /* ── Particle — lives longer to travel beyond the container into the screen ── */
    class Particle {
        constructor(x, y, color, vx, vy, type) {
            this.x = x; this.y = y;
            this.color = color;
            this.vx = vx; this.vy = vy;
            this.alpha   = 1;
            this.size    = type === 'star' ? (3.5 + Math.random() * 2.5) : (1.4 + Math.random() * 1.6);
            this.type    = type;
            // Lower decay = longer flight distance across and beyond the Promise card
            this.decay   = 0.009 + Math.random() * 0.008;
            this.gravity = 0.065;
        }
        update() {
            this.x  += this.vx;
            this.y  += this.vy;
            this.vy += this.gravity;
            this.vx *= 0.97;
            this.alpha -= this.decay;
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = Math.max(0, this.alpha);
            ctx.shadowColor = this.color;
            ctx.shadowBlur  = this.type === 'star' ? 8 : 4;
            if (this.type === 'star') {
                drawStar(ctx, this.x, this.y, 5, this.size, this.size * 0.42, this.color);
            } else {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
            ctx.shadowBlur = 0;
            ctx.restore();
        }
        isDead() { return this.alpha <= 0; }
    }

    /* ── Shockwave ring — expands outward past container bounds ── */
    class Shockwave {
        constructor(x, y, color) {
            this.x = x; this.y = y;
            this.color = color;
            this.r = 4; this.alpha = 0.85;
        }
        update() { this.r += 3.8; this.alpha -= 0.035; }
        draw() {
            ctx.save();
            ctx.globalAlpha = Math.max(0, this.alpha);
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2.5;
            ctx.stroke();
            ctx.restore();
        }
        isDead() { return this.alpha <= 0; }
    }

    /* ── 5-point star ── */
    function drawStar(ctx, cx, cy, spikes, outerR, innerR, color) {
        let rot = (Math.PI / 2) * 3;
        const step = Math.PI / spikes;
        ctx.beginPath();
        ctx.moveTo(cx, cy - outerR);
        for (let i = 0; i < spikes; i++) {
            ctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR); rot += step;
            ctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR); rot += step;
        }
        ctx.lineTo(cx, cy - outerR);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
    }

    /* ── Infinite Loop ── */
    function animate(now) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (now - lastLaunch > nextInterval) {
            rockets.push(new Rocket());
            if (Math.random() > 0.55) {
                rockets.push(new Rocket());
            }
            lastLaunch = now;
            nextInterval = 460 + Math.random() * 420; // Natural varied continuous rhythm
        }

        for (let i = rockets.length - 1; i >= 0; i--) {
            rockets[i].draw(); rockets[i].update();
            if (rockets[i].done) rockets.splice(i, 1);
        }
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].draw(); particles[i].update();
            if (particles[i].isDead()) particles.splice(i, 1);
        }
        for (let i = shockwaves.length - 1; i >= 0; i--) {
            shockwaves[i].draw(); shockwaves[i].update();
            if (shockwaves[i].isDead()) shockwaves.splice(i, 1);
        }

        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
}
/* ──────────────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
    // Lock Screen Logic
    let CORRECT_PIN = localStorage.getItem('vault_pin') || '0905'; // May 9 default
    let currentPin = '';
    const lockScreen = document.getElementById('lock-screen');
    const dots = document.querySelectorAll('.dot');
    const numBtns = document.querySelectorAll('.num-btn[data-num]');
    const clearBtn = document.getElementById('pin-clear');
    const enterBtn = document.getElementById('pin-enter');
    const pinDotsContainer = document.getElementById('pin-dots');

    function updateDots() {
        dots.forEach((dot, index) => {
            if (index < currentPin.length) {
                dot.classList.add('filled');
            } else {
                dot.classList.remove('filled');
                dot.classList.remove('error');
            }
        });
    }

    function triggerError() {
        pinDotsContainer.classList.add('shake-error');
        dots.forEach(dot => dot.classList.add('error'));
        
        setTimeout(() => {
            pinDotsContainer.classList.remove('shake-error');
            currentPin = '';
            updateDots();
        }, 400);
    }

    numBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentPin.length < 4) {
                currentPin += btn.getAttribute('data-num');
                updateDots();
                
                // Auto submit on 4 digits
                if (currentPin.length === 4) {
                    setTimeout(() => {
                        if (currentPin === CORRECT_PIN) {
                            lockScreen.classList.add('unlocked');
                        } else {
                            triggerError();
                        }
                    }, 150);
                }
            }
        });
    });

    clearBtn.addEventListener('click', () => {
        if (currentPin.length > 0) {
            currentPin = currentPin.slice(0, -1);
            updateDots();
        }
    });

    enterBtn.addEventListener('click', () => {
        if (currentPin.length === 4) {
            if (currentPin === CORRECT_PIN) {
                lockScreen.classList.add('unlocked');
            } else {
                triggerError();
            }
        } else {
            triggerError(); // Shake if not enough digits
        }
    });

    // Physical Keyboard Support for Lock Screen
    document.addEventListener('keydown', (e) => {
        if (!lockScreen.classList.contains('unlocked')) {
            if (e.key >= '0' && e.key <= '9') {
                if (currentPin.length < 4) {
                    currentPin += e.key;
                    updateDots();
                    
                    if (currentPin.length === 4) {
                        setTimeout(() => {
                            if (currentPin === CORRECT_PIN) {
                                lockScreen.classList.add('unlocked');
                            } else {
                                triggerError();
                            }
                        }, 150);
                    }
                }
            } else if (e.key === 'Backspace') {
                if (currentPin.length > 0) {
                    currentPin = currentPin.slice(0, -1);
                    updateDots();
                }
            } else if (e.key === 'Enter') {
                if (currentPin.length === 4) {
                    if (currentPin === CORRECT_PIN) {
                        lockScreen.classList.add('unlocked');
                    } else {
                        triggerError();
                    }
                } else {
                    triggerError();
                }
            }
        }
    });

    // App Loader Dismissal
    window.addEventListener('load', () => {
        setTimeout(() => {
            const loader = document.getElementById('app-loader');
            if (loader) {
                loader.classList.add('hidden');
            }
        }, 1200); // 1.2s delay for visual effect
    });

    const navItems = document.querySelectorAll('.nav-item');
    const screens = document.querySelectorAll('.screen');
    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

    // Theme Toggle Logic
    const themeIcon = document.getElementById('theme-icon');

    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('story-theme', newTheme);
        
        // Update icon
        if (newTheme === 'dark') {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        } else {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
    });

    // Load saved theme
    const savedTheme = localStorage.getItem('story-theme');
    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
        if (savedTheme === 'light') {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
    }

    // Home Screen Music Player Logic
    const homePlayBtn = document.getElementById('home-play-btn');
    const homePlayIcon = document.getElementById('home-play-icon');
    const vinylRecord = document.getElementById('vinyl-record');
    const musicCoverWrapper = document.getElementById('music-cover-wrapper');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const progressBar = document.getElementById('progress-bar');
    const currentTimeEl = document.getElementById('current-time');
    const totalTimeEl = document.getElementById('total-time');
    
    if (homePlayBtn) {
        const audio = new Audio('Songs/Maalai-Mangum-Neram.mp3');
        audio.loop = true;
        let isPlaying = false;

        function formatTime(seconds) {
            if (isNaN(seconds)) return "0:00";
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        }

        function updateProgressBackground() {
            const percentage = (progressBar.value / progressBar.max) * 100 || 0;
            progressBar.style.background = `linear-gradient(to right, var(--primary-color) ${percentage}%, var(--border-color) ${percentage}%)`;
        }

        audio.addEventListener('loadedmetadata', () => {
            totalTimeEl.textContent = formatTime(audio.duration);
            progressBar.max = audio.duration;
            updateProgressBackground();
        });

        audio.addEventListener('timeupdate', () => {
            currentTimeEl.textContent = formatTime(audio.currentTime);
            if (document.activeElement !== progressBar) {
                progressBar.value = audio.currentTime;
                updateProgressBackground();
            }
        });

        progressBar.addEventListener('input', () => {
            audio.currentTime = progressBar.value;
            currentTimeEl.textContent = formatTime(audio.currentTime);
            updateProgressBackground();
        });

        homePlayBtn.addEventListener('click', () => {
            if (isPlaying) {
                audio.pause();
                homePlayIcon.classList.remove('fa-pause');
                homePlayIcon.classList.add('fa-play');
                vinylRecord.classList.remove('spinning');
                musicCoverWrapper.classList.remove('playing');
                isPlaying = false;
                
                // Resume BGM if it was playing before
                if (window.wasBgPlaying) {
                    const bgChip = document.getElementById('bg-music-chip');
                    if (bgChip) bgChip.click();
                    window.wasBgPlaying = false;
                }
            } else {
                audio.play().then(() => {
                    homePlayIcon.classList.remove('fa-play');
                    homePlayIcon.classList.add('fa-pause');
                    vinylRecord.classList.add('spinning');
                    musicCoverWrapper.classList.add('playing');
                    isPlaying = true;
                    
                    // Pause BGM if it is playing
                    if (window.bgAudio && !window.bgAudio.paused) {
                        window.wasBgPlaying = true;
                        const bgChip = document.getElementById('bg-music-chip');
                        if (bgChip) bgChip.click();
                    }
                }).catch(error => {
                    console.error("Audio playback failed:", error);
                    alert("Please interact with the document first to allow audio playback!");
                });
            }
        });
        
        audio.addEventListener('ended', () => {
            if (window.wasBgPlaying) {
                const bgChip = document.getElementById('bg-music-chip');
                if (bgChip) bgChip.click();
                window.wasBgPlaying = false;
            }
        });

        // Skip 10s back/forward for single-song mode
        prevBtn.addEventListener('click', () => {
            audio.currentTime = Math.max(0, audio.currentTime - 10);
        });

        nextBtn.addEventListener('click', () => {
            audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
        });
    }

    // Scratch Card Logic
    const scratchCanvas = document.getElementById('scratch-canvas');
    if (scratchCanvas) {
        const ctx = scratchCanvas.getContext('2d', { willReadFrequently: true });
        let isDragging = false;
        let isRevealed = false;
        let scratchCount = 0;
        
        // Randomize the surprise coupon
        const coupons = [
            { title: "Coupon: 1 Free Hug! 🤗", desc: "Redeemable anytime, anywhere. No expiration date!" },
            { title: "Coupon: A Can of Pringles! 🥔", desc: "I'll buy you your absolute favorite flavor next time we meet!" },
            { title: "Coupon: Spicy Bhel Puri! 🌶️", desc: "Let's go grab some delicious street food together!" },
            { title: "Coupon: Romantic Long Drive! 🚗", desc: "Just you, me, the open road, and our favorite playlist." },
            { title: "Coupon: Candlelight Dinner! 🕯️", desc: "Dress up nice, tonight's romantic dinner is on me!" }
        ];
        const randomCoupon = coupons[Math.floor(Math.random() * coupons.length)];
        const scratchContent = document.getElementById('scratch-container').querySelector('.scratch-content');
        if (scratchContent) {
            scratchContent.innerHTML = `<h3>${randomCoupon.title}</h3><p>${randomCoupon.desc}</p>`;
        }

        function initScratchCanvas() {
            scratchCanvas.width = scratchCanvas.parentElement.clientWidth;
            scratchCanvas.height = scratchCanvas.parentElement.clientHeight;
            
            const gradient = ctx.createLinearGradient(0, 0, scratchCanvas.width, scratchCanvas.height);
            gradient.addColorStop(0, '#d4af37'); 
            gradient.addColorStop(0.5, '#f3e5ab');
            gradient.addColorStop(1, '#d4af37');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, scratchCanvas.width, scratchCanvas.height);
            
            ctx.font = 'bold 22px Arial';
            ctx.fillStyle = '#6b5413';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Scratch to Reveal!', scratchCanvas.width / 2, scratchCanvas.height / 2);
        }
        
        setTimeout(initScratchCanvas, 100);

        function getMousePos(e) {
            const rect = scratchCanvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return {
                x: clientX - rect.left,
                y: clientY - rect.top
            };
        }

        function checkReveal() {
            if (isRevealed) return;
            const imageData = ctx.getImageData(0, 0, scratchCanvas.width, scratchCanvas.height);
            const pixels = imageData.data;
            let transparentPixels = 0;
            const totalPixels = pixels.length / 4;
            
            // Sample every 8th pixel for speed
            for (let i = 0; i < pixels.length; i += 32) {
                if (pixels[i + 3] < 128) {
                    transparentPixels++;
                }
            }
            
            // If >= 50% of the sampled pixels are transparent
            if (transparentPixels >= (totalPixels / 8) / 2) {
                isRevealed = true;
                scratchCanvas.style.transition = 'opacity 0.5s ease-out';
                scratchCanvas.style.opacity = '0';
                setTimeout(() => {
                    scratchCanvas.style.display = 'none';
                    if (window.confetti) {
                        const rect = scratchCanvas.parentElement.getBoundingClientRect();
                        const x = (rect.left + rect.width / 2) / window.innerWidth;
                        const y = (rect.top + rect.height / 2) / window.innerHeight;
                        confetti({
                            particleCount: 150,
                            spread: 80,
                            origin: { x: x, y: y },
                            colors: ['#ff2a5f', '#ffc0cb', '#ffffff', '#d4af37']
                        });
                    }
                }, 500);
            }
        }

        let lastPos = null;

        function scratch(e) {
            if (!isDragging || isRevealed) return;
            e.preventDefault();
            const pos = getMousePos(e);
            
            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineCap = 'butt';
            ctx.lineJoin = 'miter';
            
            let dx = pos.x - (lastPos ? lastPos.x : pos.x);
            let dy = pos.y - (lastPos ? lastPos.y : pos.y);
            let dist = Math.sqrt(dx*dx + dy*dy);
            
            let angle = dist > 1 ? Math.atan2(dy, dx) : Math.random() * Math.PI * 2;
            let perp = angle + Math.PI / 2;

            // Draw a cluster of wild, erratic lines for a chaotic scratch
            const numLines = 20; 
            for (let i = 0; i < numLines; i++) {
                let offset = (Math.random() - 0.5) * 35; // 35px medium wild scratch area
                ctx.lineWidth = Math.random() * 5 + 1; 
                
                ctx.beginPath();
                if (lastPos && dist > 1) {
                    let startX = lastPos.x + Math.cos(perp) * offset + (Math.random() - 0.5) * 10;
                    let startY = lastPos.y + Math.sin(perp) * offset + (Math.random() - 0.5) * 10;
                    
                    let endOffset = offset + (Math.random() - 0.5) * 20; // Medium deviation
                    let endX = pos.x + Math.cos(perp) * endOffset + (Math.random() - 0.5) * 10;
                    let endY = pos.y + Math.sin(perp) * endOffset + (Math.random() - 0.5) * 10;
                    
                    ctx.moveTo(startX, startY);
                    // Add an intermediate erratic point to make lines zigzag
                    ctx.lineTo((startX + endX) / 2 + (Math.random() - 0.5) * 12, (startY + endY) / 2 + (Math.random() - 0.5) * 12);
                    ctx.lineTo(endX, endY);
                } else {
                    // Initial click creates wild patchy spot
                    let startX = pos.x + (Math.random() - 0.5) * 35;
                    let startY = pos.y + (Math.random() - 0.5) * 35;
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(startX + (Math.random() - 0.5) * 20, startY + (Math.random() - 0.5) * 20);
                }
                ctx.stroke();
            }

            lastPos = pos;

            scratchCount++;
            // Check reveal percentage every 10 scratch movements to save performance
            if (scratchCount % 10 === 0) {
                checkReveal();
            }
        }

        scratchCanvas.addEventListener('mousedown', (e) => { isDragging = true; lastPos = getMousePos(e); scratch(e); });
        scratchCanvas.addEventListener('mouseup', () => { isDragging = false; lastPos = null; checkReveal(); });
        scratchCanvas.addEventListener('mousemove', (e) => { if (isDragging) scratch(e); });
        scratchCanvas.addEventListener('mouseleave', () => { isDragging = false; lastPos = null; });

        scratchCanvas.addEventListener('touchstart', (e) => { isDragging = true; lastPos = getMousePos(e); scratch(e); }, {passive: false});
        scratchCanvas.addEventListener('touchend', () => { isDragging = false; lastPos = null; checkReveal(); });
        scratchCanvas.addEventListener('touchmove', (e) => { if (isDragging) scratch(e); }, {passive: false});
    }

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.getAttribute('data-target');
            
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            const screens = document.querySelectorAll('.screen');
            screens.forEach(screen => {
                if (screen.id === targetId) {
                    screen.classList.add('active');
                } else {
                    screen.classList.remove('active');
                }
            });

            // Only show Settings on Home screen
            const settingsToggle = document.getElementById('settings-toggle');
            if (settingsToggle) {
                if (targetId === 'screen-home') {
                    settingsToggle.style.display = 'flex';
                } else {
                    settingsToggle.style.display = 'none';
                }
            }
        });
    });

    // Memory of the Day Logic
    const memoryImg = document.getElementById('memory-img');
    if (memoryImg) {
        const galleryImages = [
            'Gallery/1000166870.jpg.jpeg',
            'Gallery/1000167119.jpg.jpeg',
            'Gallery/1000167234.jpg.jpeg',
            'Gallery/1000167259.webp',
            'Gallery/1000167411.jpg.jpeg'
        ];
        // Calculate days since epoch to change the image once every 24 hours
        const daysSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
        const todaysImageIndex = daysSinceEpoch % galleryImages.length;
        memoryImg.src = galleryImages[todaysImageIndex];
    }

    // Timeline Card Interaction
    const timelineCards = document.querySelectorAll('.timeline-card');
    timelineCards.forEach(card => {
        card.addEventListener('click', () => {
            // Close all other cards first
            timelineCards.forEach(otherCard => {
                if (otherCard !== card) {
                    otherCard.classList.remove('expanded');
                }
            });
            
            // Then toggle the clicked one
            card.classList.toggle('expanded');
            
            // If expanded, scroll it into view so it's centered
            if (card.classList.contains('expanded')) {
                setTimeout(() => {
                    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300); // Wait for the expand CSS transition to almost finish
            }
        });
    });

    // Background Music Chip Logic
    const bgMusicChip = document.getElementById('bg-music-chip');
    const bgVisualizer = document.getElementById('bg-visualizer');
    const musicHandPointer = document.getElementById('music-hand-pointer');
    
    if (bgMusicChip) {
        const bgAudio = new Audio('Songs/The-Metro-Proposal-MassTamilan.dev.mp3');
        window.bgAudio = bgAudio;
        bgAudio.loop = true;
        let isBgPlaying = false;

        // Clicking the pointing hand directly also plays the music
        if (musicHandPointer) {
            musicHandPointer.addEventListener('click', () => {
                bgMusicChip.click();
            });
        }
        
        bgMusicChip.addEventListener('click', () => {
            if (isBgPlaying) {
                bgAudio.pause();
                bgMusicChip.classList.remove('playing');
                if (bgVisualizer) bgVisualizer.classList.remove('active');
                if (musicHandPointer) musicHandPointer.classList.remove('hidden');
                isBgPlaying = false;
            } else {
                bgAudio.play().then(() => {
                    bgMusicChip.classList.add('playing');
                    if (bgVisualizer) bgVisualizer.classList.add('active');
                    if (musicHandPointer) musicHandPointer.classList.add('hidden');
                    isBgPlaying = true;
                }).catch(err => console.error("Error playing bg music:", err));
            }
        });

        // Stop BGM when the tab/browser is closed (desktop)
        window.addEventListener('beforeunload', () => {
            bgAudio.pause();
            bgAudio.currentTime = 0;
        });

        // Stop BGM when the page is hidden on mobile (tab switch, app close, etc.)
        window.addEventListener('pagehide', () => {
            bgAudio.pause();
            bgAudio.currentTime = 0;
            isBgPlaying = false;
            bgMusicChip.classList.remove('playing');
            if (bgVisualizer) bgVisualizer.classList.remove('active');
            if (musicHandPointer) musicHandPointer.classList.remove('hidden');
        });

        // Pause BGM when tab goes into background on mobile Chrome
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && isBgPlaying) {
                bgAudio.pause();
                bgMusicChip.classList.remove('playing');
                if (bgVisualizer) bgVisualizer.classList.remove('active');
                if (musicHandPointer) musicHandPointer.classList.remove('hidden');
                isBgPlaying = false;
            }
        });
    }

    // Love Meter Logic
    const calculateLoveBtn = document.getElementById('calculate-love-btn');
    const loveNeedle = document.getElementById('love-needle');
    const speedTrack = document.getElementById('speed-track');
    const speedReadout = document.getElementById('speed-readout');
    
    if (calculateLoveBtn && loveNeedle && speedTrack && speedReadout) {
        calculateLoveBtn.addEventListener('click', () => {
            calculateLoveBtn.disabled = true;
            calculateLoveBtn.textContent = 'Calculating...';
            
            // Animate SVG needle exactly to 100% (which is 90deg)
            loveNeedle.style.transform = 'rotate(90deg)';
            
            // Animate SVG track fill exactly to 100% (0 dashoffset)
            speedTrack.style.strokeDashoffset = '0';
            
            // Fast counting animation for the readout
            let currentCount = 0;
            const targetCount = 100;
            const duration = 3000; // ms
            const intervalTime = 30; // ms
            const step = targetCount / (duration / intervalTime);
            
            const widget = calculateLoveBtn.closest('.love-meter-widget');
            
            const counter = setInterval(() => {
                currentCount += step;
                
                // Progressive rumbling
                if (currentCount >= 90 && !widget.classList.contains('vibrating-high')) {
                    widget.classList.remove('vibrating-med');
                    widget.classList.add('vibrating-high');
                } else if (currentCount >= 70 && currentCount < 90 && !widget.classList.contains('vibrating-med')) {
                    widget.classList.remove('vibrating-low');
                    widget.classList.add('vibrating-med');
                } else if (currentCount >= 50 && currentCount < 70 && !widget.classList.contains('vibrating-low')) {
                    widget.classList.add('vibrating-low');
                    calculateLoveBtn.textContent = 'Overloading...';
                }
                
                // Vibrate the phone during the rumble
                if (currentCount >= 50 && navigator.vibrate) {
                    if (currentCount >= 90) navigator.vibrate(40);
                    else if (currentCount >= 70) navigator.vibrate(25);
                    else navigator.vibrate(15);
                } else if (currentCount >= 50) {
                    // Vibration not supported; could add visual cue or fallback
                    console.log('Vibration not supported on this device.');
                }
                
                if (currentCount >= targetCount) {
                    clearInterval(counter);
                    speedReadout.textContent = '∞%';
                    
                    setTimeout(() => {
                        widget.classList.remove('vibrating-high', 'vibrating-med', 'vibrating-low');
                        calculateLoveBtn.textContent = 'Infinite% ❤️';
                        
                        // Explode vibration
                        if (navigator.vibrate) {
                            navigator.vibrate([100, 30, 100, 30, 300]);
                        }
                        
                        // Explode Confetti
                        if (window.confetti) {
                            const rect = widget.getBoundingClientRect();
                            const x = (rect.left + rect.width / 2) / window.innerWidth;
                            const y = (rect.top + rect.height / 2) / window.innerHeight;
                            
                            var particlesCount = 300;
                            var defaults = {
                              origin: { x: x, y: y },
                              zIndex: 1000
                            };
                            
                            function fire(particleRatio, opts) {
                              confetti(Object.assign({}, defaults, opts, {
                                particleCount: Math.floor(particlesCount * particleRatio)
                              }));
                            }
                            
                            fire(0.25, { spread: 26, startVelocity: 55 });
                            fire(0.2, { spread: 60 });
                            fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
                            fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
                            fire(0.1, { spread: 120, startVelocity: 45 });
                        }
                    }, 400); // Brief 400ms pause at max before the explosion pops
                } else {
                    speedReadout.textContent = Math.floor(currentCount) + '%';
                }
            }, intervalTime);
        });
    }

    // Love Jar Logic
    const loveJar = document.getElementById('love-jar');
    const reasonModal = document.getElementById('reason-modal');
    const closeReasonBtn = document.getElementById('close-reason');
    const reasonText = document.getElementById('random-reason-text');
    const reasonNumber = document.getElementById('reason-number');

    const reasons = [
        "You always know how to make me smile even when I'm down.",
        "Your laugh is absolutely my favorite sound in the world.",
        "You support my craziest dreams without hesitation.",
        "The way you look at me makes my heart melt.",
        "You're not just my partner, you're my best friend.",
        "Every little thing you do feels like magic to me.",
        "You make every ordinary day feel incredibly special.",
        "I love the way we can talk about absolutely anything.",
        "Your kindness inspires me to be a better person.",
        "With you, I'm simply the best version of myself."
    ];

    if (loveJar && reasonModal) {
        loveJar.addEventListener('click', () => {
            // Add shake animation
            loveJar.classList.add('shake-animation');
            
            setTimeout(() => {
                loveJar.classList.remove('shake-animation');
                
                // Pick random reason
                const randomIndex = Math.floor(Math.random() * reasons.length);
                reasonText.textContent = `"${reasons[randomIndex]}"`;
                reasonNumber.textContent = randomIndex + 1;

                // Show modal
                reasonModal.classList.remove('hidden');
            }, 500); // Wait for shake to finish
        });

        closeReasonBtn.addEventListener('click', () => {
            reasonModal.classList.add('hidden');
        });

        // Close on outside click
        reasonModal.addEventListener('click', (e) => {
            if (e.target === reasonModal) {
                reasonModal.classList.add('hidden');
            }
        });
    }

    // Gallery Image Preview Logic
    const galleryImages = document.querySelectorAll('.gallery-img');
    const previewModal = document.getElementById('image-preview-modal');
    const previewImage = document.getElementById('preview-image');
    const closePreviewBtn = document.getElementById('close-preview');

    if (previewModal) {
        galleryImages.forEach(img => {
            img.addEventListener('click', () => {
                previewImage.src = img.src;
                previewModal.classList.remove('hidden');
            });
        });

        closePreviewBtn.addEventListener('click', () => {
            previewModal.classList.add('hidden');
            setTimeout(() => { previewImage.src = ''; }, 300); // clear after animation
        });

        previewModal.addEventListener('click', (e) => {
            if (e.target === previewModal || e.target === previewImage) {
                previewModal.classList.add('hidden');
                setTimeout(() => { previewImage.src = ''; }, 300);
            }
        });
    }

    // Relationship Counter Logic
    const startDate = new Date('2022-05-09T00:00:00');
    
    function updateCounter() {
        const now = new Date();
        const diff = now - startDate;
        
        if (diff < 0) return; // In case of future date bug
        
        let years = now.getFullYear() - startDate.getFullYear();
        let months = now.getMonth() - startDate.getMonth();
        let days = now.getDate() - startDate.getDate();
        
        if (days < 0) {
            months--;
            const previousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
            days += previousMonth.getDate();
        }
        
        if (months < 0) {
            years--;
            months += 12;
        }

        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();

        document.getElementById('count-years').textContent = years;
        document.getElementById('count-months').textContent = months;
        document.getElementById('count-days').textContent = days;
        document.getElementById('count-hours').textContent = hours.toString().padStart(2, '0');
        document.getElementById('count-mins').textContent = minutes.toString().padStart(2, '0');
        document.getElementById('count-secs').textContent = seconds.toString().padStart(2, '0');
    }

    setInterval(updateCounter, 1000);
    updateCounter();

    // Settings Modal Logic
    const settingsToggle = document.getElementById('settings-toggle');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsBtn = document.getElementById('close-settings');
    const savePinBtn = document.getElementById('save-pin-btn');
    const currentPinInput = document.getElementById('current-pin-input');
    const newPinInput = document.getElementById('new-pin-input');
    const pinMessage = document.getElementById('pin-message');

    if (settingsToggle && settingsModal) {
        settingsToggle.addEventListener('click', () => {
            settingsModal.classList.remove('hidden');
            currentPinInput.value = '';
            newPinInput.value = '';
            pinMessage.textContent = '';
        });

        closeSettingsBtn.addEventListener('click', () => {
            settingsModal.classList.add('hidden');
        });

        settingsModal.addEventListener('click', (e) => {
            if (e.target === settingsModal) {
                settingsModal.classList.add('hidden');
            }
        });

        savePinBtn.addEventListener('click', () => {
            const currentVal = currentPinInput.value;
            const newVal = newPinInput.value;

            if (currentVal !== CORRECT_PIN) {
                pinMessage.style.color = '#ff3b30';
                pinMessage.textContent = 'Incorrect current PIN.';
                return;
            }

            if (newVal.length !== 4 || isNaN(newVal)) {
                pinMessage.style.color = '#ff3b30';
                pinMessage.textContent = 'New PIN must be 4 digits.';
                return;
            }

            // Success
            localStorage.setItem('vault_pin', newVal);
            CORRECT_PIN = newVal;
            
            pinMessage.style.color = '#4cd964';
            pinMessage.textContent = 'PIN updated successfully!';
            
            setTimeout(() => {
                settingsModal.classList.add('hidden');
            }, 1500);
        });
    }

    // Privacy Protections (Anti-screenshot/Save)
    document.addEventListener('keyup', (e) => {
        if (e.key === 'PrintScreen') {
            navigator.clipboard.writeText(''); // Clear clipboard
            alert('Screenshots are disabled for privacy!');
        }
    });

    // Disable Right Click context menu
    document.addEventListener('contextmenu', event => event.preventDefault());

    // ── Reunion Animation ──────────────────────────────
    const reunionBtn  = document.getElementById('reunion-btn');
    const figBoy      = document.getElementById('figure-boy');
    const figGirl     = document.getElementById('figure-girl');
    const charHug     = document.getElementById('char-hug');
    const hugHeart    = document.getElementById('hug-heart');
    const reunionMsg  = document.getElementById('reunion-message');
    const boyImg      = document.getElementById('boy-img');
    const girlImg     = document.getElementById('girl-img');

    if (reunionBtn && figBoy && figGirl) {
        let runInterval = null;
        let runFrame = 1;

        reunionBtn.addEventListener('click', () => {
            if (reunionBtn.classList.contains('done')) return;
            reunionBtn.classList.add('done');
            reunionBtn.querySelector('span').textContent = 'Running to each other... 🏃';

            // Step 1 — Swap to running images
            if (boyImg)  boyImg.src  = 'Gallery/Characters/Boy_running_step-1.png';
            if (girlImg) girlImg.src = 'Gallery/Characters/Girl_running_step-1.png';

            // Step 2 — Start running + move toward center
            setTimeout(() => {
                figBoy.classList.add('running');
                figGirl.classList.add('running');
                figBoy.style.left   = '18%';
                figGirl.style.right = '18%';

                // Alternate between step-1 and step-2 for run animation
                runInterval = setInterval(() => {
                    runFrame = runFrame === 1 ? 2 : 1;
                    if (boyImg)  boyImg.src  = `Gallery/Characters/Boy_running_step-${runFrame}.png`;
                    if (girlImg) girlImg.src = `Gallery/Characters/Girl_running_step-${runFrame}.png`;
                }, 280);
            }, 100);

            // Step 3 — They meet → hug
            setTimeout(() => {
                clearInterval(runInterval);
                figBoy.classList.remove('running');
                figGirl.classList.remove('running');
                figBoy.classList.add('fade-out');
                figGirl.classList.add('fade-out');

                // Show hug image
                if (charHug) charHug.classList.add('visible');

                // Show heart
                setTimeout(() => {
                    if (hugHeart) hugHeart.classList.add('visible');

                    // Show message + fireworks 🎆
                    setTimeout(() => {
                        if (reunionMsg) reunionMsg.classList.add('visible');
                        launchCartoonFireworks();
                    }, 350);
                }, 250);

                reunionBtn.querySelector('span').textContent = '💕 Together Forever';
            }, 2200);
        });
    }
});
