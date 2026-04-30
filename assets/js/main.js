// ============================================================
// NOVYX — Site JavaScript
// ============================================================

// URL da API do bot (mude para o endereço do seu servidor)
const API_URL = "";

// ── BUSCA DADOS DA API ──
async function fetchStats() {
  try {
    const res = await fetch(`${API_URL}/api/stats`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function fetchLeaderboard(tipo = "coins") {
  try {
    const res = await fetch(`${API_URL}/api/leaderboard?tipo=${tipo}`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

async function loadStats() {
  const data = await fetchStats();
  if (!data) return;

  // Atualiza os números do hero e seção de stats
  document.querySelectorAll("[data-stat]").forEach(el => {
    const key = el.dataset.stat;
    if (data[key] !== undefined) {
      el.dataset.target = data[key];
      el.textContent = Number(data[key]).toLocaleString("pt-BR") + (el.dataset.suffix || "");
    }
  });

  // Badge de status online
  const badge = document.querySelector(".hero-badge .dot");
  if (badge) {
    badge.style.background = data.online ? "var(--success)" : "var(--danger)";
  }

  // Ping no footer
  const pingEl = document.getElementById("bot-ping");
  if (pingEl && data.ping) pingEl.textContent = `${data.ping}ms`;
}

async function loadLeaderboard() {
  const lb = document.getElementById("leaderboard-list");
  if (!lb) return;

  const data = await fetchLeaderboard("coins");
  if (!data.length) {
    lb.innerHTML = "<p style='color:var(--text-muted);text-align:center'>Nenhum dado disponível.</p>";
    return;
  }

  const medals = ["🥇", "🥈", "🥉"];
  lb.innerHTML = data.map((u, i) => `
    <div class="lb-item">
      <span class="lb-pos">${medals[i] || `#${u.pos}`}</span>
      ${u.avatar ? `<img src="${u.avatar}" class="lb-avatar" alt="${u.username}">` : '<div class="lb-avatar-placeholder">👤</div>'}
      <span class="lb-name">${u.username}</span>
      <span class="lb-value">🪙 ${Number(u.value).toLocaleString("pt-BR")}</span>
    </div>
  `).join("");
}

// ── NAV HAMBURGER ──
const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");

hamburger?.addEventListener("click", () => {
  navLinks.classList.toggle("open");
  hamburger.classList.toggle("active");
});

document.querySelectorAll(".nav-links a").forEach(a => {
  a.addEventListener("click", () => {
    navLinks.classList.remove("open");
    hamburger.classList.remove("active");
  });
});

// ── NAV SCROLL EFFECT ──
window.addEventListener("scroll", () => {
  const nav = document.querySelector("nav");
  nav.style.boxShadow = window.scrollY > 20 ? "0 4px 32px rgba(0,0,0,0.5)" : "none";
});

// ── COMMAND TABS ──
const tabs = document.querySelectorAll(".cmd-tab");
const lists = document.querySelectorAll(".cmd-list");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    lists.forEach(l => l.classList.remove("active"));
    tab.classList.add("active");
    const target = document.getElementById("cmd-" + tab.dataset.cat);
    if (target) target.classList.add("active");
  });
});

// ── FADE IN OBSERVER ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".fade-in").forEach(el => observer.observe(el));

// ── COUNTER ANIMATION ──
function animateCounter(el, target, suffix = "") {
  const duration = 1800;
  const start = performance.now();
  const update = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target).toLocaleString("pt-BR") + suffix;
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseInt(el.dataset.target);
    const suffix = el.dataset.suffix || "";
    if (target) animateCounter(el, target, suffix);
    statsObserver.unobserve(el);
  });
}, { threshold: 0.5 });

document.querySelectorAll(".count-up").forEach(el => statsObserver.observe(el));

// ── PARTICLES HERO ──
(function createParticles() {
  const hero = document.querySelector(".hero-bg");
  if (!hero) return;
  for (let i = 0; i < 18; i++) {
    const dot = document.createElement("div");
    const size = Math.random() * 4 + 2;
    dot.style.cssText = `
      position:absolute;width:${size}px;height:${size}px;
      background:rgba(88,101,242,${Math.random() * 0.4 + 0.1});
      border-radius:50%;left:${Math.random() * 100}%;top:${Math.random() * 100}%;
      animation:float ${Math.random() * 8 + 6}s ease-in-out infinite;
      animation-delay:${Math.random() * 4}s;
    `;
    hero.appendChild(dot);
  }
  const style = document.createElement("style");
  style.textContent = `@keyframes float{0%,100%{transform:translateY(0) scale(1);opacity:.6}50%{transform:translateY(-24px) scale(1.1);opacity:1}}`;
  document.head.appendChild(style);
})();

// ── INIT ──
document.addEventListener("DOMContentLoaded", () => {
  loadStats();
  loadLeaderboard();
  // Atualiza stats a cada 30 segundos
  setInterval(loadStats, 30_000);
});
