// ============================================================
// SCENE MANAGEMENT
// ============================================================
const scenes = document.querySelectorAll('.scene');

function showScene(id) {
  const current = document.querySelector('.scene.active');
  const target = document.getElementById(id);
  if (!target || current === target) return;

  if (current) {
    current.classList.add('leaving');
    setTimeout(() => {
      current.classList.remove('active', 'leaving');
      activateScene(target);
    }, 300);
  } else {
    activateScene(target);
  }
}

function activateScene(target) {
  target.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (target.querySelector('[data-typewriter]') ||
      target.querySelector('[data-photo-reveal]')) {
    runTypewritersIn(target);
  }
}

// ============================================================
// MUSIC
// ============================================================
const music = document.getElementById('bgMusic');
const musicBtn = document.getElementById('musicToggle');
let musicStarted = false;

function startMusic() {
  if (musicStarted) return;
  music.volume = 0.6;
  music.play()
    .then(() => {
      musicStarted = true;
      musicBtn.classList.add('playing');
      musicBtn.textContent = '🎶';
    })
    .catch(err => console.log('Autoplay diblokir:', err));
}

musicBtn.addEventListener('click', () => {
  if (music.paused) {
    music.play();
    musicBtn.classList.add('playing');
    musicBtn.textContent = '🎶';
  } else {
    music.pause();
    musicBtn.classList.remove('playing');
    musicBtn.textContent = '🔇';
  }
});

// ============================================================
// PASSWORD GATE
// ============================================================
const SECRET = {
  password: 'akucintaeskrim',                       // 🔑 GANTI PASSWORD DI SINI
  hint: 'passwordnya biasanya "akucintaeskrim"',     // 💡 Hint
  caseSensitive: false,
};

const passwordForm   = document.getElementById('passwordForm');
const passwordInput  = document.getElementById('passwordInput');
const passwordError  = document.getElementById('passwordError');
const passwordHintEl = document.getElementById('passwordHint');
const lockIcon       = document.getElementById('lockIcon');
const toggleEye      = document.getElementById('toggleEye');

if (passwordHintEl) passwordHintEl.textContent = SECRET.hint;

toggleEye?.addEventListener('click', () => {
  const isPwd = passwordInput.type === 'password';
  passwordInput.type = isPwd ? 'text' : 'password';
  toggleEye.textContent = isPwd ? '🙈' : '👁';
  passwordInput.focus();
});

passwordForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const input  = passwordInput.value.trim();
  const target = SECRET.password;
  const match  = SECRET.caseSensitive
    ? input === target
    : input.toLowerCase() === target.toLowerCase();

  match ? handleUnlock() : handleWrong();
});

function handleWrong() {
  passwordError.classList.remove('hidden');
  lockIcon.classList.add('shake');
  passwordInput.value = '';
  passwordInput.focus();
  setTimeout(() => lockIcon.classList.remove('shake'), 650);
  setTimeout(() => passwordError.classList.add('hidden'), 3200);
}

function handleUnlock() {
  passwordError.classList.add('hidden');
  lockIcon.classList.add('unlocked');

  const rect = lockIcon.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  burstParticles(cx, cy, '✨', 30);
  burstParticles(cx, cy, '⭐', 20);
  burstParticles(cx, cy, '🎉', 16);

  startMusic();

  setTimeout(() => {
    showScene('scene-gift');
  }, 1400);
}

// ============================================================
// GIFT BOX PNG — DRAMATIC OPEN
// ============================================================
const gift = document.getElementById('gift');
const giftHint = document.getElementById('giftHint');

gift?.addEventListener('click', () => {
  if (gift.classList.contains('charging') ||
      gift.classList.contains('opening')) return;

  gift.classList.add('charging');
  if (giftHint) giftHint.textContent = 'Siap-siap... ✨';

  const chargeInterval = setInterval(() => {
    const r = gift.getBoundingClientRect();
    spawnSparkleAt(
      r.left + r.width / 2 + (Math.random() - 0.5) * 200,
      r.top + r.height / 2 + (Math.random() - 0.5) * 200
    );
  }, 90);

  setTimeout(() => {
    clearInterval(chargeInterval);
    gift.classList.remove('charging');
    gift.classList.add('opening');
    if (giftHint) giftHint.textContent = 'Ta-daa! 🎉';

    const r = gift.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;

    burstParticles(cx, cy, '✨', 40);
    burstParticles(cx, cy, '⭐', 26);
    burstParticles(cx, cy, '🎉', 30);
    burstParticles(cx, cy, '🎊', 24);
    burstParticles(cx, cy, '🌟', 18);

    const flash = document.createElement('div');
    flash.className = 'screen-flash';
    document.body.appendChild(flash);
    requestAnimationFrame(() => flash.classList.add('active'));
    setTimeout(() => flash.remove(), 1100);

    setTimeout(() => {
      showScene('scene-video');
      const video = document.getElementById('bdayVideo');
      video?.play().catch(() => {});
    }, 1500);
  }, 1100);
});

// ============================================================
// NAV BUTTONS
// ============================================================
document.querySelectorAll('[data-next]').forEach(btn => {
  btn.addEventListener('click', () => {
    const rect = btn.getBoundingClientRect();
    burstParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, '✨', 14);

    const nextId = btn.getAttribute('data-next');
    const video = document.getElementById('bdayVideo');
    if (video && !video.paused) video.pause();

    showScene(nextId);
  });
});

// ============================================================
// TYPEWRITER + REVEAL
// ============================================================
let typingController = null;

function runTypewritersIn(scope) {
  const el = scope.querySelector('[data-typewriter]');

  if (!el) {
    setTimeout(() => revealAfterTyping(scope), 350);
    return;
  }

  if (el.dataset.typed === 'true') {
    revealAfterTyping(scope);
    return;
  }

  const full = el.textContent.trim();
  el.textContent = '';
  el.dataset.full = full;
  el.classList.add('typing');
  el.dataset.typed = 'typing';

  let i = 0;
  let skip = false;
  const speed = 14;

  function type() {
    if (skip) {
      el.textContent = full;
      el.classList.remove('typing');
      el.dataset.typed = 'true';
      revealAfterTyping(scope);
      typingController = null;
      return;
    }

    if (i >= full.length) {
      el.classList.remove('typing');
      el.dataset.typed = 'true';
      revealAfterTyping(scope);
      typingController = null;
      return;
    }

    el.appendChild(document.createTextNode(full[i]));
    i++;

    const scrollTarget = el.scrollHeight + el.getBoundingClientRect().top;
    if (scrollTarget > window.innerHeight - 80) {
      window.scrollTo({ top: window.scrollY + 80, behavior: 'auto' });
    }

    setTimeout(type, speed);
  }

  typingController = { skip: () => { skip = true; } };
  type();
}

document.addEventListener('click', (e) => {
  if (typingController && !e.target.closest('button')) {
    typingController.skip();
  }
}, true);

function revealAfterTyping(scope) {
  const sig = scope.querySelector('[data-signature]');
  const photos = scope.querySelector('[data-photo-reveal]');

  if (sig) {
    setTimeout(() => sig.classList.add('show'), 250);
  }
  if (photos) {
    setTimeout(() => photos.classList.add('reveal'), sig ? 900 : 250);
  }
}

// ============================================================
// MIXUE FINAL
// ============================================================
const lickBtn = document.getElementById('lickBtn');
lickBtn?.addEventListener('click', () => {
  const rect = lickBtn.getBoundingClientRect();
  burstParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, '🍦', 22);
  burstParticles(window.innerWidth / 2, window.innerHeight / 2, '✨', 30);

  document.getElementById('finalMsg').classList.remove('hidden');
  createConfetti();
  lickBtn.disabled = true;
  lickBtn.textContent = 'Selamat ya! 🎉';
});

// ============================================================
// PARTICLE BURST
// ============================================================
function burstParticles(x, y, emoji, count = 16) {
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.textContent = emoji;
    el.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      font-size: ${14 + Math.random() * 14}px;
      pointer-events: none;
      z-index: 9999;
      user-select: none;
      will-change: transform, opacity;
    `;
    document.body.appendChild(el);

    const angle = Math.random() * Math.PI * 2;
    const dist = 60 + Math.random() * 140;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist - 40;
    const rot = (Math.random() - 0.5) * 720;

    el.animate(
      [
        { transform: `translate(-50%, -50%) translate(0,0) rotate(0deg) scale(0.6)`, opacity: 1 },
        { transform: `translate(-50%, -50%) translate(${dx}px, ${dy}px) rotate(${rot}deg) scale(1)`, opacity: 0 }
      ],
      { duration: 900 + Math.random() * 500, easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)' }
    ).onfinish = () => el.remove();
  }
}

// ============================================================
// SPARKLE AT (untuk charging gift)
// ============================================================
function spawnSparkleAt(x, y) {
  const el = document.createElement('span');
  const pool = ['✨', '⭐', '🌟'];
  el.textContent = pool[Math.floor(Math.random() * pool.length)];
  el.style.cssText = `
    position: fixed;
    left: ${x}px;
    top: ${y}px;
    font-size: ${10 + Math.random() * 10}px;
    pointer-events: none;
    z-index: 100;
    opacity: 0;
    transform: translate(-50%, -50%);
  `;
  document.body.appendChild(el);
  el.animate(
    [
      { opacity: 0, transform: 'translate(-50%, -50%) scale(0.3) rotate(0deg)' },
      { opacity: 1, transform: 'translate(-50%, -50%) scale(1.2) rotate(180deg)', offset: 0.4 },
      { opacity: 0, transform: 'translate(-50%, -50%) scale(0.3) rotate(360deg)' }
    ],
    { duration: 900 + Math.random() * 500, easing: 'ease-in-out' }
  ).onfinish = () => el.remove();
}

// ============================================================
// CONFETTI
// ============================================================
function createConfetti() {
  const colors = ['#ffd43b', '#69db7c', '#4dabf7', '#b197fc', '#ffa94d', '#ff8787'];
  for (let i = 0; i < 60; i++) {
    const c = document.createElement('div');
    c.style.cssText = `
      position: fixed;
      top: -20px;
      left: ${Math.random() * 100}vw;
      width: 8px;
      height: 12px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      z-index: 9998;
      pointer-events: none;
      border-radius: 2px;
      will-change: transform, opacity;
    `;
    document.body.appendChild(c);

    const duration = 2200 + Math.random() * 2200;
    const drift = (Math.random() - 0.5) * 200;

    c.animate(
      [
        { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
        { transform: `translate(${drift}px, 110vh) rotate(${720 + Math.random() * 720}deg)`, opacity: 0 }
      ],
      { duration, easing: 'cubic-bezier(0.3, 0.1, 0.5, 1)' }
    ).onfinish = () => c.remove();
  }
}

// ============================================================
// FLOATING FX (background) — netral, bukan bunga/cinta
// ============================================================
const FX_POOL = ['✨', '⭐', '🌟', '💫', '🎈'];
const fxLayer = document.getElementById('fx-layer');

function spawnPetal() {
  const el = document.createElement('span');
  el.className = 'petal';
  el.textContent = FX_POOL[Math.floor(Math.random() * FX_POOL.length)];
  const left = Math.random() * 100;
  const size = 12 + Math.random() * 14;
  const dur = 9 + Math.random() * 8;
  el.style.left = left + 'vw';
  el.style.fontSize = size + 'px';
  el.style.animationDuration = dur + 's';
  el.style.opacity = 0.45 + Math.random() * 0.45;
  fxLayer.appendChild(el);
  setTimeout(() => el.remove(), dur * 1000 + 500);
}
setInterval(spawnPetal, 900);
for (let i = 0; i < 6; i++) setTimeout(spawnPetal, i * 250);

// ============================================================
// AMBIENT SPARKLES
// ============================================================
function spawnSparkle() {
  const el = document.createElement('span');
  el.textContent = '✨';
  el.style.cssText = `
    position: fixed;
    left: ${Math.random() * 100}vw;
    top: ${Math.random() * 100}vh;
    font-size: ${8 + Math.random() * 10}px;
    pointer-events: none;
    z-index: 4;
    opacity: 0;
  `;
  document.body.appendChild(el);

  el.animate(
    [
      { opacity: 0, transform: 'scale(0.4) rotate(0deg)' },
      { opacity: 1, transform: 'scale(1.2) rotate(180deg)', offset: 0.5 },
      { opacity: 0, transform: 'scale(0.4) rotate(360deg)' }
    ],
    { duration: 1600 + Math.random() * 800, easing: 'ease-in-out' }
  ).onfinish = () => el.remove();
}
setInterval(spawnSparkle, 600);

// ============================================================
// INIT
// ============================================================
console.log('%c🎂 Happy Birthday Website Ready!', 'color:#d6336c;font-size:16px;font-weight:bold');