/**
 * 统一面板 — Tab 切换
 * 职责：对话 / 设置两个视图切换；切换时通知主进程（调整窗口大小 + 设置视图固定显示不随 hover 隐藏）
 */
(function () {
  'use strict';

  const tabs = Array.from(document.querySelectorAll('.panel-tab'));
  const chatView = document.getElementById('view-chat');
  const settingsView = document.getElementById('view-settings');

  let currentTab = 'chat';

  function switchTab(tab) {
    if (tab !== 'chat' && tab !== 'settings') return;
    if (currentTab === tab) return; // 回声防护:已在目标 Tab 就不再通知主进程
    currentTab = tab;
    tabs.forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
    chatView.hidden = tab !== 'chat';
    settingsView.hidden = tab !== 'settings';
    // 视图切换淡入
    const view = tab === 'chat' ? chatView : settingsView;
    view.classList.remove('view-in');
    void view.offsetWidth; // 强制重排,重新触发动画
    view.classList.add('view-in');
    window.pet.panelSwitchTab(tab);
  }

  tabs.forEach((b) => b.addEventListener('click', () => switchTab(b.dataset.tab)));

  // 主进程通知（托盘右键打开设置等）
  window.pet.onPanelSwitch((tab) => switchTab(tab));
})();

/* ---------- 宠物控制：♡ 互动（单击随机 / 长按菜单）、− + 缩放、× 退出 ---------- */
// 互动项由面板发送给宠物窗口播放（姿态匹配与气泡渲染在宠物窗口内完成）
const INTERACTIONS = [
  { emoji: '♡', label: '摸摸头', match: ['done', 'win', 'cheer', 'happy', '完成', '开心', '胜利'], text: '嘿嘿~ 最喜欢你啦！' },
  { emoji: '👋', label: '打招呼', match: ['done', 'win', 'cheer', 'happy', 'hi', '打招呼'], text: '嗨~ 一直在等你哦！' },
  { emoji: '✨', label: '撒个娇', match: ['done', 'win', 'cheer', 'happy', '撒娇'], text: '人家想你了嘛~' },
  { emoji: '🍬', label: '喂糖果', match: ['done', 'win', 'cheer', 'happy', '吃', '开心'], text: '好甜！谢谢你！' },
  { emoji: '❓', label: '歪头疑惑', match: ['think', '思考', '想', '疑问', '疑惑', '歪'], text: '嗯？你在看什么呀？' },
  { emoji: '😴', label: '睡觉觉', match: ['read', '书', '睡', 'zzz', '打盹'], text: '呼…好困，小眯一会儿' },
];

const interactBtn = document.getElementById('btn-interact');
const interactMenu = document.getElementById('interact-menu');
let interactPressTimer = null;
let interactMenuTimer = null;

function buildInteractMenu() {
  if (interactMenu.childElementCount) return;
  INTERACTIONS.forEach((it) => {
    const b = document.createElement('button');
    b.className = 'interact-menu-item';
    b.innerHTML = '<span class="interact-menu-emoji">' + it.emoji + '</span>' + it.label;
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      hideInteractMenu();
      window.pet.interact(it);
    });
    interactMenu.appendChild(b);
  });
}
function showInteractMenu() {
  buildInteractMenu();
  interactMenu.hidden = false;
}
function hideInteractMenu() {
  interactMenu.hidden = true;
}

interactBtn.addEventListener('pointerdown', () => {
  clearTimeout(interactMenuTimer);
  interactPressTimer = setTimeout(() => {
    showInteractMenu();
    interactPressTimer = null;
  }, 500);
});
interactBtn.addEventListener('pointerup', () => {
  clearTimeout(interactPressTimer);
  interactPressTimer = null;
  if (!interactMenu.hidden) return; // 菜单已弹出:交给菜单项点击处理
  window.pet.interact(INTERACTIONS[Math.floor(Math.random() * INTERACTIONS.length)]);
});
interactMenu.addEventListener('mouseleave', () => {
  clearTimeout(interactMenuTimer);
  interactMenuTimer = setTimeout(hideInteractMenu, 300);
});
interactMenu.addEventListener('mouseenter', () => clearTimeout(interactMenuTimer));

document.getElementById('btn-smaller').addEventListener('click', () => window.pet.resize(-1));
document.getElementById('btn-larger').addEventListener('click', () => window.pet.resize(1));
document.getElementById('btn-quit').addEventListener('click', () => window.pet.quit());
