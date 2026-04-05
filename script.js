/* ===========================
   WUYS MACRO — script.js
   Dùng JSONBin.io để lưu trạng thái
   =========================== */

// ---- CONFIGURATION JSONBIN.IO ----
const JSONBIN_BIN_ID = "69cbf6d036566621a8677944";
const JSONBIN_API_KEY = "$2a$10$ij4GsbUfmLulRmghig1A6.OUv5ovgXeHF2LLAMjl0W1N4/oM5.TF.";

// ---- BOOT SEQUENCE ----
const bootMessages = [
    "INITIALIZING SYSTEM...",
    "LOADING ENGINE v2.0...",
    "CALIBRATING TOE METHOD...",
    "SYNCING CLICK PATTERNS...",
    "STABILITY CHECK: 91%...",
    "SYSTEM READY."
];

let currentMsg = 0;
const bootBar = document.getElementById('boot-bar');
const bootStatus = document.getElementById('boot-status');
const bootScreen = document.getElementById('boot-screen');
const app = document.getElementById('app');

function runBoot() {
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 12 + 3;
        if (progress > 100) progress = 100;

        bootBar.style.width = progress + '%';

        const msgIndex = Math.floor((progress / 100) * bootMessages.length);
        if (msgIndex < bootMessages.length && msgIndex !== currentMsg) {
            currentMsg = msgIndex;
            bootStatus.textContent = bootMessages[msgIndex];
        }

        if (progress >= 100) {
            clearInterval(interval);
            bootStatus.textContent = "SYSTEM READY.";
            setTimeout(() => {
                bootScreen.style.cursor = 'pointer';
            }, 400);
        }
    }, 120);
}

function enterApp() {
    bootScreen.classList.add('hidden');
    app.classList.add('visible');
    setTimeout(checkReveal, 800);
    loadWuysStatus();
}

bootScreen.addEventListener('click', enterApp);
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') enterApp();
});

runBoot();

setTimeout(() => {
    if (!app.classList.contains('visible')) enterApp();
}, 5000);

// ---- WUYS STATUS (Lưu trên JSONBin.io) ----
let wuysOnline = true;

async function loadWuysStatus() {
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
            headers: {
                'X-Master-Key': JSONBIN_API_KEY
            }
        });
        const data = await response.json();
        
        if (data.record) {
            wuysOnline = data.record.online === true;
            updateWuysStatusDisplay();
        } else {
            console.error('Failed to load status');
            fallbackToLocal();
        }
    } catch (error) {
        console.error('Error loading status:', error);
        fallbackToLocal();
    }
}

function fallbackToLocal() {
    const saved = localStorage.getItem('wuys_macro_status_fallback');
    if (saved !== null) {
        wuysOnline = saved === 'true';
        updateWuysStatusDisplay();
    }
}

async function updateWuysStatus(online) {
    try {
        const newRecord = {
            online: online,
            last_updated: new Date().toISOString()
        };
        
        const updateResponse = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': JSONBIN_API_KEY
            },
            body: JSON.stringify(newRecord)
        });
        
        if (updateResponse.ok) {
            wuysOnline = online;
            updateWuysStatusDisplay();
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error updating status:', error);
        // Fallback to localStorage
        localStorage.setItem('wuys_macro_status_fallback', online);
        wuysOnline = online;
        updateWuysStatusDisplay();
        return false;
    }
}

function updateWuysStatusDisplay() {
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');
    const wannaBtn = document.getElementById('wanna-btn');
    
    if (statusDot && statusText) {
        if (wuysOnline) {
            statusDot.className = 'status-dot online';
            statusText.textContent = '⚔️ ONLINE - Sẵn sàng 1v1!';
            if (wannaBtn) {
                wannaBtn.style.opacity = '1';
                wannaBtn.style.pointerEvents = 'auto';
            }
        } else {
            statusDot.className = 'status-dot offline';
            statusText.textContent = '💤 OFFLINE - Hiện không nhận 1v1';
            if (wannaBtn) {
                wannaBtn.style.opacity = '0.6';
                wannaBtn.style.pointerEvents = 'none';
            }
        }
    }
}

// Expose for panel
window.loadWuysStatus = loadWuysStatus;
window.updateWuysStatus = updateWuysStatus;

// ---- NAV ----
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
    updateActiveNav();
});

function updateActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const links = document.querySelectorAll('.nav-link');
    let current = '';
    sections.forEach(s => {
        if (window.scrollY >= s.offsetTop - 120) current = s.id;
    });
    links.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
}

// ---- HAMBURGER ----
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

window.toggleNav = function() {
    const open = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open', open);
};

// ---- SCROLL REVEAL ----
const reveals = document.querySelectorAll('.feature-card, .about-grid, .section-title, .section-label, .demo-frame, .demo-cta, .about-card, .hero-stats, .footer-grid, .wanna-card');

reveals.forEach(el => el.classList.add('reveal'));

function checkReveal() {
    const trigger = window.innerHeight * 0.88;
    reveals.forEach(el => {
        const top = el.getBoundingClientRect().top;
        if (top < trigger) el.classList.add('visible');
    });
}

window.addEventListener('scroll', checkReveal);
checkReveal();

// ---- SMOOTH ANCHOR SCROLL ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ---- PARTICLE EFFECT ----
const particlesContainer = document.getElementById('particles');
if (particlesContainer) {
    for (let i = 0; i < 12; i++) {
        const p = document.createElement('div');
        p.style.cssText = `
            position: absolute;
            width: ${Math.random() * 3 + 1}px;
            height: ${Math.random() * 3 + 1}px;
            background: rgba(0,245,196,${Math.random() * 0.5 + 0.1});
            border-radius: 50%;
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            animation: float-particle ${Math.random() * 4 + 3}s ease-in-out infinite;
            animation-delay: ${Math.random() * 3}s;
            box-shadow: 0 0 6px rgba(0,245,196,0.4);
        `;
        particlesContainer.appendChild(p);
    }

    const style = document.createElement('style');
    style.textContent = `
        @keyframes float-particle {
            0%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
            50% { transform: translateY(-20px) scale(1.2); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
}

// ---- VIDEO FALLBACK ----
document.querySelectorAll('video').forEach(v => {
    v.addEventListener('error', () => {
        const wrap = v.closest('.demo-video-wrap');
        if (wrap) {
            wrap.innerHTML = `
                <div style="padding:4rem 2rem; text-align:center; color:#6b6f80; font-family:'Share Tech Mono',monospace; font-size:0.8rem;">
                    <div style="font-size:2rem;margin-bottom:1rem;">▶</div>
                    <div>testing-video.mp4</div>
                    <div style="margin-top:0.5rem;opacity:0.5">Place video file in project folder</div>
                </div>
            `;
        }
    });
});
