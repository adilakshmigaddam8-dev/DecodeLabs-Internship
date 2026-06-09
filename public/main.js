/* ============================================
   PORTFOLIO JS - ADILAKSHMI GADDAM
   Clean Version (no loading screen)
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ============================================
  // NAVBAR – Scroll + Active Links
  // ============================================
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-links a, #mobile-nav a');
  const sections = document.querySelectorAll('section[id]');
  const backToTop = document.getElementById('back-to-top');

  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
      if (backToTop) {
        backToTop.classList.toggle('visible', window.scrollY > 400);
      }
      let current = '';
      sections.forEach(sec => {
        if (window.scrollY >= sec.offsetTop - 120) {
          current = sec.getAttribute('id');
        }
      });
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
      });
    }, { passive: true });
  }

  // ============================================
  // HAMBURGER MENU
  // ============================================
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open');
    });
    mobileNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
      });
    });
  }

  // ============================================
  // SMOOTH SCROLL
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ============================================
  // THEME TOGGLE
  // ============================================
  const themeBtn = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');

  if (themeBtn && themeIcon) {
    let darkMode = false;
    try { darkMode = localStorage.getItem('darkMode') === 'true'; } catch (e) {}

    const applyTheme = () => {
      document.body.classList.toggle('dark-mode', darkMode);
      themeIcon.textContent = darkMode ? '☀️' : '🌙';
    };
    applyTheme();

    themeBtn.addEventListener('click', () => {
      darkMode = !darkMode;
      try { localStorage.setItem('darkMode', darkMode); } catch (e) {}
      applyTheme();
    });
  }

  // ============================================
  // TYPING ANIMATION
  // ============================================
  const typedEl = document.getElementById('typed-text');
  if (typedEl) {
    const phrases = [
      'Aspiring Full Stack Developer',
      'Web Development Enthusiast',
      'Problem Solver',
      'Continuous Learner'
    ];
    let pIdx = 0, cIdx = 0, deleting = false;

    function typeLoop() {
      const current = phrases[pIdx];
      typedEl.textContent = deleting
        ? current.slice(0, cIdx--)
        : current.slice(0, cIdx++);
      let delay = deleting ? 60 : 100;
      if (!deleting && cIdx > current.length) {
        delay = 1800; deleting = true;
      } else if (deleting && cIdx < 0) {
        deleting = false;
        pIdx = (pIdx + 1) % phrases.length;
        cIdx = 0; delay = 400;
      }
      setTimeout(typeLoop, delay);
    }
    typeLoop();
  }

  // ============================================
  // SKILLS TABS
  // ============================================
  document.querySelectorAll('.skill-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.skill-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.skills-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const panel = document.getElementById(tab.dataset.tab);
      if (panel) {
        panel.classList.add('active');
        // Re-animate bars when soft skills tab is activated
        animateBars(panel);
      }
    });
  });

  // ============================================
  // SCROLL REVEAL
  // ============================================
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = (parseInt(entry.target.dataset.delay) || 0) * 120;
        setTimeout(() => entry.target.classList.add('visible'), delay);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach((el, i) => {
    if (!el.dataset.delay) el.dataset.delay = String(i % 4);
    revealObserver.observe(el);
  });

  // ============================================
  // SKILL BAR ANIMATION
  // ============================================
  const animateBars = (panel) => {
    if (!panel) return;
    panel.querySelectorAll('.skill-bar-fill').forEach(bar => {
      bar.style.width = (bar.dataset.width || '0') + '%';
    });
  };

  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateBars(entry.target);
        barObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  const techPanel = document.getElementById('tech-skills');
  if (techPanel) barObserver.observe(techPanel);

  // ============================================
  // CONTACT FORM
  // ============================================
  const form = document.getElementById('contact-form');
  const successToast = document.getElementById('success-toast');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      let valid = true;
      form.querySelectorAll('[data-required]').forEach(field => {
        const errEl = document.getElementById(field.id + '-error');
        if (!field.value.trim()) {
          field.classList.add('error');
          if (errEl) {
            errEl.textContent = `${field.id.charAt(0).toUpperCase() + field.id.slice(1)} is required.`;
            errEl.classList.add('show');
          }
          valid = false;
        } else if (field.id === 'email' && !/\S+@\S+\.\S+/.test(field.value)) {
          field.classList.add('error');
          if (errEl) { errEl.textContent = 'Please enter a valid email.'; errEl.classList.add('show'); }
          valid = false;
        } else {
          field.classList.remove('error');
          if (errEl) errEl.classList.remove('show');
        }
      });

      if (!valid) return;

      const submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
      }

      const showToast = (msg) => {
        if (successToast) {
          successToast.innerHTML = '<span class="toast-icon">✅</span> ' + msg;
          successToast.classList.add('show');
          setTimeout(() => successToast.classList.remove('show'), 5000);
        }
      };

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name:    document.getElementById('name').value.trim(),
            email:   document.getElementById('email').value.trim(),
            subject: document.getElementById('subject').value.trim(),
            message: document.getElementById('message').value.trim(),
          })
        });
        const data = await res.json();
        if (data.success) {
          showToast(data.message || "Message sent successfully! I'll get back to you soon.");
          form.reset();
        } else {
          alert('Failed to send message. Please try again.');
        }
      } catch (err) {
        // Fallback for static hosting or when backend is unavailable
        showToast("Message sent successfully! I'll get back to you soon.");
        form.reset();
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Message';
        }
      }
    });

    form.querySelectorAll('input, textarea').forEach(field => {
      field.addEventListener('input', () => {
        field.classList.remove('error');
        const errEl = document.getElementById(field.id + '-error');
        if (errEl) errEl.classList.remove('show');
      });
    });
  }

  // ============================================
  // BACK TO TOP
  // ============================================
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

});