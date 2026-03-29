// /public/background.js

let activeSession = null;

function getDomain(url) {
  try {
    return new URL(url).hostname;
  } catch (e) { return null; }
}

// 修复：精准锁定当前窗口的活跃标签
async function getActiveTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url) {
      const isSys = tab.url.startsWith('chrome') || tab.url.startsWith('edge') || tab.url.startsWith('about') || tab.url.startsWith('view-source');
      const isExt = tab.url.startsWith('chrome-extension') || tab.url.startsWith('edge-extension');
      if (!isSys && !isExt) return tab;
    }
  } catch (e) {}
  return null;
}

async function tick() {
  const settings = await chrome.storage.local.get(['blacklist', 'idleTimeout', 'isPaused']);
  const isPaused = settings.isPaused === true;
  const blacklist = (settings.blacklist || "").split('\n').map(d => d.trim()).filter(d => d);
  const timeout = (settings.idleTimeout || 30) * 60;

  const tab = await getActiveTab();
  const idleState = await chrome.idle.queryState(timeout); 
  const now = Date.now();

  if (tab && (idleState === 'active' || idleState === 'idle') && !isPaused) {
    const domain = getDomain(tab.url);
    if (blacklist.some(b => domain.includes(b))) {
      activeSession = null;
    } else if (!activeSession || activeSession.url !== tab.url) {
      activeSession = {
        url: tab.url,
        domain: domain,
        title: tab.title,
        startTime: now,
        lastTick: now
      };
      await updateStorage(activeSession, 0);
    } else {
      const delta = now - activeSession.lastTick;
      await updateStorage(activeSession, delta);
      activeSession.lastTick = now;
    }
  } else {
    // 如果暂停了，我们更新 lastTick 避免恢复时突然跳变大段时长
    if (activeSession) activeSession.lastTick = now;
    if (!tab || (idleState !== 'active' && idleState !== 'idle')) {
      activeSession = null;
    }
  }

  if (activeSession) {
    chrome.runtime.sendMessage({
      action: "TIMER_TICK",
      duration: Date.now() - activeSession.startTime,
      domain: activeSession.domain,
      isPaused: isPaused
    }).catch(() => {});
  }
}

async function updateStorage(session, delta) {
  const data = await chrome.storage.local.get(['domainTotals', 'detailedHistory']);
  let domainTotals = data.domainTotals || {};
  let detailedHistory = data.detailedHistory || [];

  if (!domainTotals[session.domain]) {
    domainTotals[session.domain] = { totalTime: 0, lastSeen: 0 };
  }
  domainTotals[session.domain].totalTime += delta;
  domainTotals[session.domain].lastSeen = Date.now();

  const lastEntry = detailedHistory[detailedHistory.length - 1];
  if (lastEntry && lastEntry.url === session.url && (Date.now() - lastEntry.endTime < 10000)) {
    lastEntry.endTime = Date.now();
    lastEntry.duration += delta;
  } else {
    detailedHistory.push({
      id: Date.now().toString(36),
      url: session.url,
      domain: session.domain,
      startTime: session.startTime,
      endTime: Date.now(),
      duration: delta
    });
  }

  if (detailedHistory.length > 5000) detailedHistory = detailedHistory.slice(-5000);
  await chrome.storage.local.set({ domainTotals, detailedHistory });
}

setInterval(tick, 1000);
chrome.alarms.create('keepAlive', { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener(tick);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "OPEN_MINI_WINDOW") {
    chrome.windows.create({ url: 'popup.html', type: 'popup', width: 320, height: 480 });
  } else if (request.action === "GET_CURRENT_SESSION") {
    sendResponse(activeSession);
  }
  return true;
});
