// /public/content.js
(function() {
  if (window.hasTrackerInjected) return;
  window.hasTrackerInjected = true;

  const LAP_MS = 15 * 60 * 1000;

  const init = () => {
    if (document.getElementById('activity-tracker-shadow-root')) return;
    
    const container = document.createElement('div');
    container.id = 'activity-tracker-shadow-root';
    (document.body || document.documentElement).appendChild(container);

    const shadow = container.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = `
      :host { position: fixed !important; top: 20px; right: 20px; z-index: 2147483647 !important; cursor: move; user-select: none; font-family: sans-serif; pointer-events: auto !important; transition: transform 0.3s ease, opacity 0.3s ease; }
      .tracker-dial-container { width: 70px; height: 70px; background: rgba(15, 17, 20, 0.9) !important; backdrop-filter: blur(12px); border-radius: 50%; border: 2px solid rgba(255, 255, 255, 0.2); display: flex; align-items: center; justify-content: center; box-shadow: 0 12px 32px rgba(0,0,0,0.5); position: relative; }
      .tracker-svg { transform: rotate(-90deg); width: 60px; height: 60px; }
      .tracker-circle-bg { fill: none; stroke: rgba(255, 255, 255, 0.1); stroke-width: 4; }
      .tracker-circle-progress { fill: none; stroke: #3b82f6; stroke-width: 4; stroke-linecap: round; transition: stroke-dashoffset 0.5s ease; }
      .tracker-time-text { position: absolute; color: #ffffff; font-size: 12px; font-weight: 700; pointer-events: none; }
      .tracker-lap-badge { position: absolute; bottom: -2px; right: -2px; background: #3b82f6; color: white; font-size: 9px; font-weight: 900; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #000; z-index: 2; }
      .tracker-context-menu { position: absolute; background: #1a1a1a; border-radius: 8px; padding: 4px; width: 140px; display: none; flex-direction: column; left: 75px; top: 0; border: 1px solid #333; }
      .menu-item { padding: 8px; color: #eee; font-size: 11px; cursor: pointer; border-radius: 4px; display: flex; justify-content: space-between; }
      .menu-item:hover { background: #333; }
      @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); } 70% { box-shadow: 0 0 0 15px rgba(59, 130, 246, 0); } 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); } }
      .pulse { animation: pulse 1s infinite; }
    `;
    shadow.appendChild(style);

    const root = document.createElement('div');
    root.innerHTML = `
      <div class="tracker-dial-container">
        <svg class="tracker-svg" viewBox="0 0 70 70">
          <circle class="tracker-circle-bg" cx="35" cy="35" r="30"></circle>
          <circle class="tracker-circle-progress" cx="35" cy="35" r="30"></circle>
        </svg>
        <div class="tracker-time-text">00:00</div>
        <div class="tracker-lap-badge" id="tracker-laps" style="display: none;">0</div>
        <div class="tracker-context-menu" id="tracker-menu">
          <div class="menu-item" id="menu-color">切换颜色</div>
          <div class="menu-item" id="menu-size">切换尺寸</div>
          <div class="menu-item" id="menu-locate">重置位置</div>
          <div class="menu-item" id="menu-hide" style="color:red">隐藏</div>
        </div>
      </div>
    `;
    shadow.appendChild(root);

    const progressCircle = shadow.querySelector('.tracker-circle-progress');
    const timeText = shadow.querySelector('.tracker-time-text');
    const lapBadge = shadow.querySelector('#tracker-laps');
    const contextMenu = shadow.querySelector('#tracker-menu');
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;

    async function update() {
      if (!chrome.runtime?.id) return;
      const s = await chrome.storage.local.get(['clockVisible', 'clockColor', 'clockSize', 'isPaused']);
      const isVisible = s.clockVisible !== false;
      const isPaused = s.isPaused === true;
      container.style.transform = `scale(${s.clockSize || 1})`;
      progressCircle.style.stroke = isPaused ? '#94a3b8' : (s.clockColor || '#3b82f6');
      lapBadge.style.backgroundColor = isPaused ? '#94a3b8' : (s.clockColor || '#3b82f6');
      container.style.opacity = isPaused ? '0.7' : '1';

      chrome.runtime.sendMessage({ action: "GET_CURRENT_SESSION" }, (session) => {
        if (chrome.runtime.lastError || !session || !isVisible) {
          container.style.display = 'none';
          return;
        }
        const ms = Date.now() - session.startTime;
        const sec = Math.floor(ms / 1000);
        
        if (isPaused) {
          timeText.innerText = 'PAUSE';
          timeText.style.fontSize = '10px';
        } else {
          timeText.innerText = `${Math.floor(sec/60).toString().padStart(2,'0')}:${(sec%60).toString().padStart(2,'0')}`;
          timeText.style.fontSize = '12px';
        }

        const laps = Math.floor(ms / LAP_MS);
        lapBadge.innerText = laps;
        lapBadge.style.display = laps > 0 ? 'flex' : 'none';
        const progress = (ms % LAP_MS) / LAP_MS;
        progressCircle.style.strokeDashoffset = circumference - (progress * circumference);
        container.style.display = 'block';
      });
    }

    setInterval(update, 1000);
    root.addEventListener('contextmenu', (e) => { e.preventDefault(); contextMenu.style.display = 'flex'; });
    document.addEventListener('click', (e) => { if (!container.contains(e.target)) contextMenu.style.display = 'none'; });

    shadow.querySelector('#menu-color').onclick = async () => {
      const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];
      const d = await chrome.storage.local.get('clockColor');
      const next = colors[(colors.indexOf(d.clockColor || '#3b82f6') + 1) % colors.length];
      await chrome.storage.local.set({ clockColor: next });
      update();
    };

    shadow.querySelector('#menu-size').onclick = async () => {
      const sizes = ['0.7', '1', '1.3'];
      const d = await chrome.storage.local.get('clockSize');
      const next = sizes[(sizes.indexOf(d.clockSize || '1') + 1) % sizes.length];
      await chrome.storage.local.set({ clockSize: next });
      update();
    };

    shadow.querySelector('#menu-locate').onclick = () => {
      container.style.top = '20px'; container.style.right = '20px'; container.style.left = 'auto';
      contextMenu.style.display = 'none';
    };

    shadow.querySelector('#menu-hide').onclick = async () => {
      await chrome.storage.local.set({ clockVisible: false });
      container.style.display = 'none';
    };

    chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
      if (req.action === "PING") sendResponse({ status: "pong" });
      if (req.action === "LOCATE_BALL") {
        container.style.display = 'block';
        container.style.top = '50%'; container.style.left = '50%'; container.style.right = 'auto';
        container.style.transform = 'translate(-50%, -50%) scale(1.5)';
        root.classList.add('pulse');
        setTimeout(() => { root.classList.remove('pulse'); update(); }, 3000);
      }
    });

    // Dragging
    let isDrag = false, sx, sy, ix, iy, mouseDownTime = 0;
    root.addEventListener('mousedown', (e) => {
      if (contextMenu.contains(e.target)) return;
      mouseDownTime = Date.now();
      isDrag = true; sx = e.clientX; sy = e.clientY;
      const r = container.getBoundingClientRect();
      ix = r.left; iy = r.top;
      container.style.transition = 'none';
    });
    document.addEventListener('mousemove', (e) => {
      if (!isDrag) return;
      container.style.left = `${ix + (e.clientX - sx)}px`;
      container.style.top = `${iy + (e.clientY - sy)}px`;
      container.style.right = 'auto';
    });
    document.addEventListener('mouseup', async (e) => {
      if (isDrag) {
        const dx = Math.abs(e.clientX - sx);
        const dy = Math.abs(e.clientY - sy);
        // If moved less than 5px and held for less than 200ms, it's a click
        if (dx < 5 && dy < 5 && (Date.now() - mouseDownTime < 200)) {
          const s = await chrome.storage.local.get('isPaused');
          await chrome.storage.local.set({ isPaused: !s.isPaused });
          update();
          chrome.runtime.sendMessage({ action: "SETTINGS_UPDATED" });
        }
      }
      isDrag = false;
      container.style.transition = 'transform 0.3s ease';
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
