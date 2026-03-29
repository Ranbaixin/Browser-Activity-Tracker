// /public/popup.js

function formatTime(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  return `${m}m ${s % 60}s`;
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "TIMER_TICK") {
    const el = document.getElementById('liveTimer');
    if (el) {
      if (msg.isPaused) {
        el.innerText = `[已暂停] ${msg.domain}`;
        el.style.color = '#94a3b8';
      } else {
        el.innerText = `${msg.domain}: ${formatTime(msg.duration)}`;
        el.style.color = '#1d4ed8';
      }
    }
  }
});

document.getElementById('tab-stats').onclick = () => switchTab('stats');
document.getElementById('tab-settings').onclick = () => switchTab('settings');

function switchTab(tab) {
  document.getElementById('statsTab').style.display = tab === 'stats' ? 'block' : 'none';
  document.getElementById('settingsTab').style.display = tab === 'settings' ? 'block' : 'none';
  document.getElementById('tab-stats').className = `tab ${tab === 'stats' ? 'active' : ''}`;
  document.getElementById('tab-settings').className = `tab ${tab === 'settings' ? 'active' : ''}`;
}

async function updateUI() {
  const data = await chrome.storage.local.get(['domainTotals']);
  const totals = data.domainTotals || {};
  const sorted = Object.entries(totals).sort((a, b) => b[1].totalTime - a[1].totalTime).slice(0, 8);
  const list = document.getElementById('siteList');
  list.innerHTML = sorted.length ? '' : '<li style="text-align:center;color:#94a3b8;padding:10px;">暂无数据</li>';
  sorted.forEach(([domain, info]) => {
    const li = document.createElement('li');
    li.className = 'site-item';
    li.innerHTML = `<span class="site-domain">${domain}</span><span class="site-time">${formatTime(info.totalTime)}</span>`;
    list.appendChild(li);
  });
}

async function loadSettings() {
  const s = await chrome.storage.local.get(['clockVisible', 'clockColor', 'clockSize', 'idleTimeout', 'blacklist', 'isPaused']);
  document.getElementById('clockVisibleCheck').checked = s.clockVisible !== false;
  document.getElementById('isPausedCheck').checked = s.isPaused === true;
  document.getElementById('clockColor').value = s.clockColor || '#3b82f6';
  document.getElementById('clockSize').value = s.clockSize || '1';
  document.getElementById('idleTimeout').value = s.idleTimeout || 30;
  document.getElementById('blacklist').value = s.blacklist || '';
}

const save = async () => {
  await chrome.storage.local.set({
    clockVisible: document.getElementById('clockVisibleCheck').checked,
    isPaused: document.getElementById('isPausedCheck').checked,
    clockColor: document.getElementById('clockColor').value,
    clockSize: document.getElementById('clockSize').value,
    idleTimeout: parseInt(document.getElementById('idleTimeout').value) || 30,
    blacklist: document.getElementById('blacklist').value
  });
  const tabs = await chrome.tabs.query({});
  tabs.forEach(t => chrome.tabs.sendMessage(t.id, { action: "SETTINGS_UPDATED" }).catch(() => {}));
};

['clockVisibleCheck', 'isPausedCheck', 'clockColor', 'clockSize', 'idleTimeout', 'blacklist'].forEach(id => {
  document.getElementById(id).onchange = save;
});

document.getElementById('locateBallBtn').onclick = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;

  // 检查是否为系统页面
  const isSys = tab.url.startsWith('chrome') || tab.url.startsWith('edge') || tab.url.startsWith('about');
  if (isSys) {
    alert("无法在浏览器系统页面显示悬浮球。");
    return;
  }

  // 尝试 PING
  chrome.tabs.sendMessage(tab.id, { action: "PING" }, (res) => {
    if (chrome.runtime.lastError || !res) {
      alert("定位失败：脚本未响应。请刷新当前网页后再试。");
    } else {
      chrome.tabs.sendMessage(tab.id, { action: "LOCATE_BALL" });
    }
  });
};

document.getElementById('openMiniWinBtn').onclick = () => chrome.runtime.sendMessage({ action: "OPEN_MINI_WINDOW" });

document.getElementById('exportBtn').onclick = async () => {
  const data = await chrome.storage.local.get(null);
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  chrome.downloads.download({ url: URL.createObjectURL(blob), filename: `activity_report.json` });
};

document.getElementById('resetBtn').onclick = async () => {
  if (confirm('确定清空吗？')) {
    await chrome.storage.local.clear();
    loadSettings();
    updateUI();
  }
};

loadSettings();
updateUI();
setInterval(updateUI, 5000);
