/* ================================================
   AMRITA SHAHI — PORTFOLIO JAVASCRIPT
   Animations · Interactions · Canvas Effects
   ================================================ */

'use strict';

/* ---- Footer Year ---- */
const yearEl = document.getElementById('footerYear');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ================================================
   NAVIGATION
   ================================================ */
const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
const overlay   = document.getElementById('mobileOverlay');
const navAnchors = document.querySelectorAll('.nav-link');

// Scrolled state
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
  updateActiveNav();
}, { passive: true });

// Mobile menu toggle
function toggleMenu(open) {
  hamburger.classList.toggle('open', open);
  navLinks.classList.toggle('open', open);
  overlay.classList.toggle('active', open);
  hamburger.setAttribute('aria-expanded', String(open));
  overlay.setAttribute('aria-hidden', String(!open));
  document.body.style.overflow = open ? 'hidden' : '';
}

hamburger.addEventListener('click', () => toggleMenu(!navLinks.classList.contains('open')));
overlay.addEventListener('click', () => toggleMenu(false));

navAnchors.forEach(a => a.addEventListener('click', () => toggleMenu(false)));

// Close on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && navLinks.classList.contains('open')) toggleMenu(false);
});

// Active nav on scroll
function updateActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const scrollY  = window.scrollY + 100;

  sections.forEach(section => {
    const top    = section.offsetTop;
    const height = section.offsetHeight;
    const id     = section.getAttribute('id');
    const link   = document.querySelector(`.nav-link[href="#${id}"]`);
    if (link) {
      link.classList.toggle('active', scrollY >= top && scrollY < top + height);
      if (scrollY >= top && scrollY < top + height) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    }
  });
}

/* ================================================
   SCROLL REVEAL
   ================================================ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, idx) => {
    if (entry.isIntersecting) {
      // Stagger sibling reveals
      const siblings = entry.target.parentElement
        ? [...entry.target.parentElement.children].filter(el => el.classList.contains('reveal') && !el.classList.contains('visible'))
        : [];
      const delay = siblings.indexOf(entry.target) * 80;
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, Math.max(0, delay));
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

const fadeInObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeInObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
document.querySelectorAll('.fade-in-left, .fade-in-right').forEach(el => fadeInObserver.observe(el));

/* ================================================
   HERO PARTICLE CANVAS
   ================================================ */
(function initParticleCanvas() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], animFrame;

  const PARTICLE_COUNT = 55;
  const ACCENT = '91, 94, 244';
  const ACCENT2 = '6, 182, 212';

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  class Particle {
    constructor() { this.reset(true); }
    reset(init = false) {
      this.x  = Math.random() * W;
      this.y  = init ? Math.random() * H : H + 10;
      this.r  = Math.random() * 2 + 0.5;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = -(Math.random() * 0.6 + 0.2);
      this.life = 1;
      this.decay = Math.random() * 0.002 + 0.001;
      this.color = Math.random() > 0.5 ? ACCENT : ACCENT2;
    }
    update() {
      this.x  += this.vx;
      this.y  += this.vy;
      this.life -= this.decay;
      if (this.life <= 0 || this.y < -10) this.reset();
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.life * 0.6;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color}, 1)`;
      ctx.fill();
      ctx.restore();
    }
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < 110) {
          const alpha = (1 - dist / 110) * 0.15 * particles[i].life * particles[j].life;
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.strokeStyle = `rgba(${ACCENT}, 1)`;
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    animFrame = requestAnimationFrame(tick);
  }

  function init() {
    resize();
    particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
    cancelAnimationFrame(animFrame);
    tick();
  }

  window.addEventListener('resize', () => { resize(); particles.forEach(p => p.reset(true)); }, { passive: true });
  init();
})();

/* ================================================
   NEURAL NETWORK CANVAS (AI Section)
   ================================================ */
(function initNeuralCanvas() {
  const canvas = document.getElementById('neuralCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, nodes = [], edges = [], tick = 0, animFrame;

  const LAYERS = [3, 5, 5, 3];
  const ACCENT = [91, 94, 244];
  const ACCENT2 = [6, 182, 212];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    buildNetwork();
  }

  function lerpColor(a, b, t) {
    return a.map((v, i) => Math.round(v + (b[i] - v) * t));
  }

  function buildNetwork() {
    nodes = [];
    edges = [];
    const layerCount = LAYERS.length;

    LAYERS.forEach((count, li) => {
      const x = (W * 0.12) + (li / (layerCount - 1)) * (W * 0.76);
      for (let ni = 0; ni < count; ni++) {
        const y = (H / (count + 1)) * (ni + 1);
        nodes.push({ x, y, layer: li, activation: Math.random(), pulse: Math.random() * Math.PI * 2 });
      }
    });

    // Build edges between adjacent layers
    let layerStart = [0];
    for (let i = 1; i < LAYERS.length; i++) {
      layerStart[i] = layerStart[i-1] + LAYERS[i-1];
    }
    for (let li = 0; li < LAYERS.length - 1; li++) {
      const fromStart = layerStart[li];
      const toStart   = layerStart[li + 1];
      for (let fi = 0; fi < LAYERS[li]; fi++) {
        for (let ti = 0; ti < LAYERS[li + 1]; ti++) {
          edges.push({
            from: fromStart + fi,
            to:   toStart   + ti,
            weight: Math.random(),
            phase:  Math.random() * Math.PI * 2
          });
        }
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    tick += 0.018;

    // Draw edges
    edges.forEach(e => {
      const from = nodes[e.from];
      const to   = nodes[e.to];
      const signal = (Math.sin(tick * 1.4 + e.phase) + 1) / 2;
      const alpha  = 0.08 + signal * 0.18;
      const c = lerpColor(ACCENT, ACCENT2, signal);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
      ctx.lineWidth = 0.8 + signal * 0.7;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
      ctx.restore();

      // Draw signal pulse along edge
      const t = (tick * 0.8 + e.phase) % 1;
      const px = from.x + (to.x - from.x) * t;
      const py = from.y + (to.y - from.y) * t;
      ctx.save();
      ctx.globalAlpha = 0.7 * Math.sin(t * Math.PI);
      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]}, 1)`;
      ctx.fill();
      ctx.restore();
    });

    // Draw nodes
    nodes.forEach(n => {
      n.pulse += 0.04;
      const act = (Math.sin(n.pulse) + 1) / 2;
      const r = 8 + act * 4;

      // Glow
      const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 2.5);
      grad.addColorStop(0, `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},${0.25 + act * 0.25})`);
      grad.addColorStop(1, `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},0)`);
      ctx.save();
      ctx.beginPath();
      ctx.arc(n.x, n.y, r * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();

      // Core
      ctx.save();
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},${0.7 + act * 0.3})`;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    });

    animFrame = requestAnimationFrame(draw);
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        cancelAnimationFrame(animFrame);
        draw();
      } else {
        cancelAnimationFrame(animFrame);
      }
    });
  }, { threshold: 0.1 });

  window.addEventListener('resize', () => { resize(); }, { passive: true });
  resize();
  observer.observe(canvas);
})();

/* ================================================
   FOOTER CANVAS (Subtle dots)
   ================================================ */
(function initFooterCanvas() {
  const canvas = document.getElementById('footerCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, dots = [], animFrame;
  const COUNT = 30;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  class Dot {
    constructor() {
      this.x  = Math.random() * (typeof W !== 'undefined' ? W : 800);
      this.y  = Math.random() * (typeof H !== 'undefined' ? H : 200);
      this.r  = Math.random() * 1.5 + 0.5;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0) this.x = W;
      if (this.x > W) this.x = 0;
      if (this.y < 0) this.y = H;
      if (this.y > H) this.y = 0;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fill();
    }
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);
    // Draw connections
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const d = Math.hypot(dots[i].x - dots[j].x, dots[i].y - dots[j].y);
        if (d < 120) {
          ctx.save();
          ctx.globalAlpha = (1 - d / 120) * 0.15;
          ctx.strokeStyle = 'rgba(255,255,255,1)';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(dots[i].x, dots[i].y);
          ctx.lineTo(dots[j].x, dots[j].y);
          ctx.stroke();
          ctx.restore();
        }
      }
      dots[i].update();
      dots[i].draw();
    }
    animFrame = requestAnimationFrame(tick);
  }

  function init() {
    resize();
    dots = Array.from({ length: COUNT }, () => new Dot());
    tick();
  }

  window.addEventListener('resize', resize, { passive: true });
  init();
})();

/* ================================================
   PROJECT FILTER
   ================================================ */
const filterBtns   = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => { b.classList.remove('active'); });
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    projectCards.forEach(card => {
      const cat = card.dataset.category;
      const show = filter === 'all' || cat === filter;

      if (show) {
        card.style.display = 'flex';
        // Trigger reflow for animation
        requestAnimationFrame(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        });
      } else {
        card.style.opacity = '0';
        card.style.transform = 'translateY(16px)';
        setTimeout(() => { card.style.display = 'none'; }, 280);
      }
    });
  });
});

/* ================================================
   CONTACT FORM
   ================================================ */
const contactForm   = document.getElementById('contactForm');
const formSuccess   = document.getElementById('formSuccess');
const submitBtn     = document.getElementById('submitContactBtn');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name    = document.getElementById('contactName').value.trim();
    const email   = document.getElementById('contactEmail').value.trim();
    const subject = document.getElementById('contactSubject').value.trim();
    const message = document.getElementById('contactMessage').value.trim();

    if (!name || !email || !subject || !message) return;

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Sending...</span>';

    try {
      const response = await fetch("https://formsubmit.co/ajax/shahiamrita410@gmail.com", {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: name,
          email: email,
          _subject: subject,
          message: message
        })
      });

      if (response.ok) {
        if (formSuccess) {
          formSuccess.classList.add('show');
          contactForm.reset();
        }
      } else {
        alert("Oops! Something went wrong. Please try again.");
      }
    } catch (error) {
      alert("Oops! Something went wrong. Please try again.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>Send Message</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>`;
      setTimeout(() => formSuccess && formSuccess.classList.remove('show'), 5000);
    }
  });
}

/* ================================================
   HERO IMAGE FALLBACK
   ================================================ */
(function heroImageFallback() {
  const img = document.getElementById('heroPhoto');
  const aboutImg = document.querySelector('.about-photo');

  function createSVGPlaceholder(el) {
    const wrapper = el.closest('.image-frame') || el.parentElement;
    const size = wrapper ? Math.min(wrapper.offsetWidth || 320, wrapper.offsetHeight || 380) : 300;
    el.src = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='380' viewBox='0 0 320 380'><defs><linearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%23eef0fc'/><stop offset='100%25' stop-color='%23e0e3ff'/></linearGradient></defs><rect width='320' height='380' fill='url(%23g)'/><circle cx='160' cy='130' r='55' fill='%23c7caee'/><ellipse cx='160' cy='290' rx='80' ry='60' fill='%23c7caee'/><text x='160' y='340' text-anchor='middle' font-family='Inter,sans-serif' font-size='14' fill='%235b5ef4' font-weight='600'>Amrita Shahi</text></svg>`;
  }

  if (img) {
    img.addEventListener('error', () => createSVGPlaceholder(img));
    // If src is placeholder filename, trigger fallback immediately
    if (img.src.includes('amrita_profile.jpg') && img.complete && img.naturalWidth === 0) {
      createSVGPlaceholder(img);
    }
  }
  if (aboutImg) {
    aboutImg.addEventListener('error', () => {
      aboutImg.src = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='500' viewBox='0 0 400 500'><defs><linearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%23eef0fc'/><stop offset='100%25' stop-color='%23e0e3ff'/></linearGradient></defs><rect width='400' height='500' fill='url(%23g)'/><circle cx='200' cy='160' r='70' fill='%23c7caee'/><ellipse cx='200' cy='370' rx='100' ry='75' fill='%23c7caee'/></svg>`;
    });
  }
})();

/* ================================================
   SMOOTH SCROLL for all anchor links
   ================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ================================================
   SKILL TAG HOVER STAGGER
   ================================================ */
document.querySelectorAll('.skill-category').forEach(cat => {
  const tags = cat.querySelectorAll('.skill-tag');
  tags.forEach((tag, i) => {
    tag.style.transitionDelay = `${i * 30}ms`;
  });
});

/* ================================================
   PARALLAX ORBs (light, performance-friendly)
   ================================================ */
(function initParallax() {
  const orbs = document.querySelectorAll('.hero-gradient-orb');
  if (!orbs.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let lastX = 0, lastY = 0;
  let rafPending = false;

  document.addEventListener('mousemove', e => {
    lastX = e.clientX / window.innerWidth  - 0.5;
    lastY = e.clientY / window.innerHeight - 0.5;
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(() => {
        orbs.forEach((orb, i) => {
          const factor = (i + 1) * 12;
          orb.style.transform = `translate(${lastX * factor}px, ${lastY * factor}px)`;
        });
        rafPending = false;
      });
    }
  }, { passive: true });
})();

/* ================================================
   INIT ACTIVE NAV
   ================================================ */
updateActiveNav();

/* ================================================
   BACK TO TOP
   ================================================ */
const backToTopBtn = document.getElementById('backToTopBtn');
if (backToTopBtn) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  }, { passive: true });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ================================================
   TYPEWRITER EFFECT
   ================================================ */
const typewriterText = document.getElementById('typewriterText');
if (typewriterText) {
  const phrases = [
    "Django & React Developer",
    "Prompt Engineer",
    "AI Explorer"
  ];
  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typeSpeed = 100;

  function type() {
    const currentPhrase = phrases[phraseIndex];
    if (isDeleting) {
      typewriterText.textContent = currentPhrase.substring(0, charIndex - 1);
      charIndex--;
      typeSpeed = 50;
    } else {
      typewriterText.textContent = currentPhrase.substring(0, charIndex + 1);
      charIndex++;
      typeSpeed = 100;
    }

    if (!isDeleting && charIndex === currentPhrase.length) {
      isDeleting = true;
      typeSpeed = 2000; // Pause at end of phrase
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      typeSpeed = 500; // Pause before new phrase
    }

    setTimeout(type, typeSpeed);
  }
  
  setTimeout(type, 1000); // Initial delay
}
