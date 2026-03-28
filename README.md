# Browser Activity Tracker Pro - 项目说明文档

本项目是一个基于 **Chrome Extension Manifest V3** 标准开发的高精度网页活动追踪器。

## 🏗️ 核心架构

插件由三个主要部分组成，它们通过 `chrome.runtime` 消息总线进行实时通信：

1.  **Background Service Worker (`/public/background.js`)**
    *   **角色**：插件的“大脑”。
    *   **职责**：负责全局计时、数据持久化、窗口状态监控、保活唤醒。
    *   **关键技术**：`chrome.alarms` (保活), `chrome.storage.local` (存储), `chrome.idle` (闲置检测)。

2.  **Content Script (`/public/content.js`)**
    *   **角色**：插件的“触角”。
    *   **职责**：在每个网页中注入悬浮表盘 UI，处理拖拽交互，实时显示当前页面的时间。
    *   **关键技术**：DOM 注入, CSS 动画, 拖拽算法。

3.  **Popup / Mini Window (`/public/popup.js`)**
    *   **角色**：插件的“控制面板”。
    *   **职责**：展示统计排行、管理插件设置（颜色、尺寸、黑名单）、导出数据。
    *   **关键技术**：实时消息监听, 动态 UI 渲染。

## 📂 文件夹说明

*   `/public`: 包含插件的所有核心逻辑代码（Manifest, JS, CSS, HTML）。这是您检查插件功能最重要的地方。
*   `/src`: 包含插件的 Web 介绍页面（基于 React 开发）。
*   `metadata.json`: 插件的元数据信息。

## ⚠️ 兼容性与限制

1.  **浏览器支持**：本插件完全兼容 **Google Chrome** 和 **Microsoft Edge**。
2.  **系统页面限制**：由于浏览器安全策略，悬浮球**无法**在以下页面显示：
    *   浏览器设置页面 (`chrome://settings`, `edge://settings`)
    *   扩展管理页面 (`chrome://extensions`, `edge://extensions`)
    *   浏览器自带的新标签页
    *   浏览器应用商店 (Chrome Web Store / Edge Add-ons)
3.  **特定网站限制**：由于部分网站（如 **哔哩哔哩 Bilibili**）具有极强的全局样式保护和复杂的 DOM 结构，悬浮球可能无法在这些页面正常显示或定位。
4.  **刷新生效**：在安装或更新插件后，您需要**刷新**已打开的网页，悬浮球才能正常加载。

### 1. 为什么计时极其精准？
我们采用了 **“增量原子累加”** 逻辑。系统每秒执行一次心跳检查，计算自上一秒以来的增量时间（Delta），并立即写入存储。这种方式避免了因浏览器崩溃或意外关闭导致的长时间数据丢失。

### 2. 为什么看视频也能统计？
我们通过 `chrome.alarms` 强制唤醒可能进入休眠的 Service Worker，并将闲置判定（Idle）宽限期延长至 30 分钟，确保用户在静止观看视频时，插件依然处于活跃计时状态。

### 3. 如何实现“置顶固定”？
我们提供了“独立小窗口”模式。通过 `chrome.windows.create` 创建一个 `popup` 类型的独立窗口，该窗口在系统层级上具有较高的独立性，且后台脚本会通过广播机制确保该窗口内的时间与主页面完全同步。
