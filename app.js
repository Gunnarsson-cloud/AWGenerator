// === AW GENERATOR — Stadsbyggnadsförvaltningen Helsingborg ===

const PASSWORD = 'SBFAW2026';
const STORAGE_KEY_AUTH = 'aw_auth';
const STORAGE_KEY_DATES = 'aw_dates';

// ── Auth ──
const loginGate = document.getElementById('login-gate');
const appContainer = document.getElementById('app');
const loginForm = document.getElementById('login-form');
const loginInput = document.getElementById('login-input');
const loginError = document.getElementById('login-error');

function checkAuth() {
  if (sessionStorage.getItem(STORAGE_KEY_AUTH) === 'true') {
    showApp();
  }
}

function showApp() {
  loginGate.classList.add('hidden');
  appContainer.classList.remove('hidden');
  renderCalendar();
  updateCountdown();
}

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (loginInput.value === PASSWORD) {
    sessionStorage.setItem(STORAGE_KEY_AUTH, 'true');
    showApp();
  } else {
    loginError.classList.remove('hidden');
    loginInput.value = '';
    loginInput.focus();
    loginInput.classList.add('shake');
    setTimeout(() => loginInput.classList.remove('shake'), 500);
  }
});

checkAuth();

// ── State ──
let currentMode = 'random';
let isSpinning = false;
let battleVotes = { 1: 0, 2: 0 };
let battleRestaurants = { 1: null, 2: null };
let winnerDeclared = false;

// ── DOM refs ──
const btnRandom = document.getElementById('btn-random');
const btnBattle = document.getElementById('btn-battle');
const btnCalendar = document.getElementById('btn-calendar');
const slotDisplay = document.getElementById('slot-display');
const spinBtn = document.getElementById('spin-btn');
const resultCard = document.getElementById('result-card');
const resultName = document.getElementById('result-name');
const resultAddress = document.getElementById('result-address');
const resultTagline = document.getElementById('result-tagline');
const filterToggle = document.getElementById('filter-toggle');
const filterOptions = document.getElementById('filter-options');
const battleGenerateBtn = document.getElementById('battle-generate-btn');
const battleArena = document.getElementById('battle-arena');
const battleControls = document.getElementById('battle-controls');
const battleWinner = document.getElementById('battle-winner');

// ── Utility ──
function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function getTagline() { return rand(FUN_TAGLINES); }

function getFiltered() {
  const checked = [...document.querySelectorAll('.chip input:checked')].map(c => c.value);
  return checked.length ? RESTAURANTS.filter(r => checked.includes(r.area)) : RESTAURANTS;
}

function getTwoRandom() {
  const pool = getFiltered();
  if (pool.length < 2) return [pool[0], pool[0]];
  const s = [...pool].sort(() => Math.random() - 0.5);
  return [s[0], s[1]];
}

function openMaps(r) {
  const q = encodeURIComponent(`${r.name}, ${r.address}, Helsingborg`);
  window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank');
}

function getMapsEmbedUrl(r) {
  const q = encodeURIComponent(`${r.name}, ${r.address}, Helsingborg, Sweden`);
  return `https://www.google.com/maps?q=${q}&output=embed`;
}

function getTransportInfo(r) {
  const info = {
    centrum: { walk: '3–7 min', transport: 'Helsingborg C / Knutpunkten', icon: '🚶' },
    hamnen:  { walk: '5–12 min', transport: 'Helsingborg C / Ångfärjan', icon: '🚶' },
    söder:   { walk: '10–20 min', transport: 'Söder (buss 1, 7)', icon: '🚌' },
    norr:    { walk: '12–20 min', transport: 'Tågaborg / Hälsovägen (buss 2)', icon: '🚌' },
    övrigt:  { walk: '20+ min', transport: 'Se karta för hållplats', icon: '🚌' }
  };
  return info[r.area] || info.övrigt;
}

function showToast(msg) {
  const old = document.querySelector('.toast');
  if (old) old.remove();
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('show')));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2500);
}

function createConfetti(container) {
  const colors = ['#e11d48', '#f97316', '#6366f1', '#22c55e', '#f59e0b', '#a855f7'];
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    p.style.left = Math.random() * 100 + '%';
    p.style.background = rand(colors);
    p.style.animationDelay = Math.random() * 0.5 + 's';
    p.style.animationDuration = (2 + Math.random() * 2) + 's';
    const size = 5 + Math.random() * 8;
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    container.appendChild(p);
    setTimeout(() => p.remove(), 4000);
  }
}

// ── Mode switching ──
function switchMode(mode) {
  currentMode = mode;
  document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.mode-section').forEach(s => s.classList.remove('active'));
  document.getElementById(`btn-${mode}`).classList.add('active');
  document.getElementById(`${mode}-mode`).classList.add('active');
}

btnRandom.addEventListener('click', () => switchMode('random'));
btnBattle.addEventListener('click', () => switchMode('battle'));
btnCalendar.addEventListener('click', () => switchMode('calendar'));

// ── Random / Spin ──
function spin() {
  if (isSpinning) return;
  isSpinning = true;
  resultCard.classList.add('hidden');

  const pool = getFiltered();
  if (!pool.length) {
    slotDisplay.innerHTML = '<div style="color:var(--accent)">Inga restauranger matchar filtret</div>';
    isSpinning = false;
    return;
  }

  const total = 20 + Math.floor(Math.random() * 10);
  let tick = 0, speed = 50;

  function doTick() {
    slotDisplay.innerHTML = `<div class="spinning-name">${rand(pool).name}</div>`;
    tick++;
    if (tick > total * 0.6) speed = Math.min(speed + 18, 280);
    if (tick >= total) { showResult(rand(pool)); return; }
    setTimeout(doTick, speed);
  }
  doTick();
}

function showResult(r) {
  isSpinning = false;
  slotDisplay.innerHTML = `<div class="spinning-name final">${r.name}</div>`;
  resultCard.classList.remove('hidden');
  resultName.textContent = r.name;
  resultAddress.textContent = r.address + ', Helsingborg';
  resultTagline.textContent = getTagline();
  resultCard.dataset.restaurant = JSON.stringify(r);

  // Transport info
  const ti = getTransportInfo(r);
  document.getElementById('result-transport').innerHTML = `
    <div class="transport-row"><span class="transport-icon">🚂</span><span><strong>Från Helsingborg C:</strong> ${ti.walk} promenad</span></div>
    <div class="transport-row"><span class="transport-icon">${ti.icon}</span><span><strong>Närmaste hållplats:</strong> ${ti.transport}</span></div>
  `;

  // Map
  document.getElementById('result-map').innerHTML = `<iframe src="${getMapsEmbedUrl(r)}" class="map-iframe" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;

  createConfetti(document.getElementById('confetti-container'));
  resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

spinBtn.addEventListener('click', spin);
document.getElementById('maps-btn').addEventListener('click', () => openMaps(JSON.parse(resultCard.dataset.restaurant)));
document.getElementById('again-btn').addEventListener('click', spin);

// ── Filter ──
filterToggle.addEventListener('click', () => filterOptions.classList.toggle('hidden'));

// ── Battle search/select ──
let battlePicks = { 1: null, 2: null };

function setupBattleSearch(side) {
  const input = document.getElementById(`battle-search-${side}`);
  const dropdown = document.getElementById(`battle-dropdown-${side}`);

  const allSorted = [...RESTAURANTS].sort((a, b) => a.name.localeCompare(b.name, 'sv'));

  function renderOptions(filter) {
    const q = filter.toLowerCase().trim();
    const matches = q
      ? allSorted.filter(r => r.name.toLowerCase().includes(q) || r.address.toLowerCase().includes(q) || r.area.toLowerCase().includes(q))
      : allSorted;

    if (!matches.length) {
      dropdown.innerHTML = '<div class="search-select-option" style="color:var(--text-dim);cursor:default">Inga träffar</div>';
    } else {
      dropdown.innerHTML = matches.map(r =>
        `<div class="search-select-option" data-index="${RESTAURANTS.indexOf(r)}">${r.name} <span class="option-area">${r.area}</span></div>`
      ).join('');
    }
    dropdown.classList.remove('hidden');
  }

  input.addEventListener('focus', () => renderOptions(input.value));
  input.addEventListener('input', () => {
    battlePicks[side] = null;
    input.classList.remove('has-selection');
    renderOptions(input.value);
  });

  dropdown.addEventListener('click', (e) => {
    const opt = e.target.closest('.search-select-option');
    if (!opt || !opt.dataset.index) return;
    const r = RESTAURANTS[parseInt(opt.dataset.index)];
    battlePicks[side] = r;
    input.value = r.name;
    input.classList.add('has-selection');
    dropdown.classList.add('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest(`#search-select-${side}`)) {
      dropdown.classList.add('hidden');
    }
  });
}

setupBattleSearch(1);
setupBattleSearch(2);

// ── Battle ──
function updateVoteBars() {
  const total = battleVotes[1] + battleVotes[2];
  const pct1 = total ? (battleVotes[1] / total) * 100 : 0;
  const pct2 = total ? (battleVotes[2] / total) * 100 : 0;
  document.getElementById('vote-bar-1').style.width = pct1 + '%';
  document.getElementById('vote-bar-2').style.width = pct2 + '%';
}

function startBattle() {
  const pool = getFiltered();
  const randPick = () => pool[Math.floor(Math.random() * pool.length)];

  let r1 = battlePicks[1] || randPick();
  let r2 = battlePicks[2] || randPick();

  // Avoid same restaurant if possible
  if (r1.name === r2.name && pool.length >= 2) {
    let attempts = 0;
    while (r2.name === r1.name && attempts < 20) { r2 = randPick(); attempts++; }
  }

  battleRestaurants = { 1: r1, 2: r2 };
  battleVotes = { 1: 0, 2: 0 };
  winnerDeclared = false;

  document.getElementById('battle-name-1').textContent = r1.name;
  document.getElementById('battle-address-1').textContent = r1.address;
  document.getElementById('battle-tagline-1').textContent = getTagline();
  document.getElementById('vote-count-1').textContent = '0';
  document.getElementById('battle-arg-1').value = '';

  document.getElementById('battle-name-2').textContent = r2.name;
  document.getElementById('battle-address-2').textContent = r2.address;
  document.getElementById('battle-tagline-2').textContent = getTagline();
  document.getElementById('vote-count-2').textContent = '0';
  document.getElementById('battle-arg-2').value = '';

  updateVoteBars();
  battleArena.classList.remove('hidden');
  battleControls.classList.remove('hidden');
  battleWinner.classList.add('hidden');

  // Reset search inputs
  battlePicks = { 1: null, 2: null };
  document.getElementById('battle-search-1').value = '';
  document.getElementById('battle-search-1').classList.remove('has-selection');
  document.getElementById('battle-search-2').value = '';
  document.getElementById('battle-search-2').classList.remove('has-selection');
}

battleGenerateBtn.addEventListener('click', startBattle);

function vote(side) {
  if (winnerDeclared) return;
  battleVotes[side]++;
  document.getElementById(`vote-count-${side}`).textContent = battleVotes[side];
  updateVoteBars();
}

document.getElementById('vote-1').addEventListener('click', () => vote(1));
document.getElementById('vote-2').addEventListener('click', () => vote(2));

document.getElementById('battle-declare').addEventListener('click', () => {
  if (winnerDeclared) return;
  let winner;
  if (battleVotes[1] > battleVotes[2]) winner = battleRestaurants[1];
  else if (battleVotes[2] > battleVotes[1]) winner = battleRestaurants[2];
  else { winner = Math.random() > 0.5 ? battleRestaurants[1] : battleRestaurants[2]; showToast('Oavgjort — ödet avgör!'); }

  winnerDeclared = true;
  document.getElementById('winner-name').textContent = winner.name;

  // Transport info for winner
  const ti = getTransportInfo(winner);
  document.getElementById('winner-transport').innerHTML = `
    <div class="transport-row"><span class="transport-icon">🚂</span><span><strong>Från Helsingborg C:</strong> ${ti.walk} promenad</span></div>
    <div class="transport-row"><span class="transport-icon">${ti.icon}</span><span><strong>Närmaste hållplats:</strong> ${ti.transport}</span></div>
  `;
  document.getElementById('winner-map').innerHTML = `<iframe src="${getMapsEmbedUrl(winner)}" class="map-iframe" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;

  battleWinner.classList.remove('hidden');
  battleWinner.dataset.restaurant = JSON.stringify(winner);
  battleWinner.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

document.getElementById('winner-maps-btn').addEventListener('click', () => openMaps(JSON.parse(battleWinner.dataset.restaurant)));
document.getElementById('battle-reset').addEventListener('click', startBattle);

document.getElementById('battle-share').addEventListener('click', () => {
  const r1 = battleRestaurants[1], r2 = battleRestaurants[2];
  let text = `AW BATTLE\n\nA: ${r1.name} (${r1.address}) — ${battleVotes[1]} röster\nB: ${r2.name} (${r2.address}) — ${battleVotes[2]} röster`;
  if (winnerDeclared) text += `\n\nVinnare: ${document.getElementById('winner-name').textContent}`;
  text += '\n\nawgenerator.helsingborg';
  navigator.clipboard.writeText(text).then(() => showToast('Kopierat!')).catch(() => showToast('Kunde inte kopiera'));
});

// ── Calendar ──
function getAwDates() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY_DATES)) || []; }
  catch { return []; }
}

function saveAwDates(dates) {
  localStorage.setItem(STORAGE_KEY_DATES, JSON.stringify(dates));
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const weekdays = ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'];
  const months = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
  return `${weekdays[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
}

function formatTime(timeStr) {
  return timeStr || '16:30';
}

function getNextAw() {
  const now = new Date();
  const dates = getAwDates().filter(d => new Date(d.date + 'T' + (d.time || '16:30')) > now);
  dates.sort((a, b) => new Date(a.date) - new Date(b.date));
  return dates[0] || null;
}

function generateICS(awDate) {
  const dt = new Date(awDate.date + 'T' + (awDate.time || '16:30'));
  const end = new Date(dt.getTime() + 2 * 60 * 60 * 1000);
  const fmt = d => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const note = awDate.note ? awDate.note + ' — ' : '';
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AW Generator//Stadsbyggnadsförvaltningen//SV',
    'BEGIN:VEVENT',
    `DTSTART:${fmt(dt)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:AW — Stadsbyggnadsförvaltningen`,
    `DESCRIPTION:${note}After Work med Stadsbyggnadsförvaltningen Helsingborg`,
    `LOCATION:Helsingborg`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
  return ics;
}

function downloadICS(awDate) {
  const ics = generateICS(awDate);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `aw-${awDate.date}.ics`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Kalenderhändelse nedladdad!');
}

function updateCountdown() {
  const next = getNextAw();
  const card = document.getElementById('next-aw-card');

  if (!next) {
    card.innerHTML = '<p class="no-aw">Inga planerade AW. Lägg till ett datum nedan!</p>';
    return;
  }

  document.getElementById('next-aw-date').textContent = formatDate(next.date) + ' kl ' + formatTime(next.time);

  const diff = new Date(next.date + 'T' + (next.time || '16:30')) - new Date();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  let countdown = '';
  if (days > 0) countdown = `${days} dagar och ${hours} timmar kvar`;
  else if (hours > 0) countdown = `${hours} timmar kvar`;
  else countdown = 'Idag!';

  document.getElementById('next-aw-countdown').textContent = countdown;

  document.getElementById('add-next-to-calendar').onclick = () => downloadICS(next);
}

function renderCalendar() {
  const dates = getAwDates();
  dates.sort((a, b) => new Date(a.date) - new Date(b.date));
  const list = document.getElementById('aw-list');
  const now = new Date();

  if (!dates.length) {
    list.innerHTML = '<p class="no-dates">Inga datum tillagda an.</p>';
    updateCountdown();
    return;
  }

  list.innerHTML = dates.map((d, i) => {
    const isPast = new Date(d.date + 'T23:59') < now;
    return `
      <div class="aw-date-item ${isPast ? 'past' : ''}">
        <div class="aw-date-info">
          <span class="aw-date-text">${formatDate(d.date)}</span>
          <span class="aw-date-time">kl ${formatTime(d.time)}</span>
          ${d.note ? `<span class="aw-date-note">${d.note}</span>` : ''}
        </div>
        <div class="aw-date-actions">
          <button class="btn-icon" onclick="downloadICS(getAwDates()[${i}])" title="Lägg till i kalender">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </button>
          <button class="btn-icon btn-icon-danger" onclick="removeAwDate(${i})" title="Ta bort">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>`;
  }).join('');

  updateCountdown();
}

function removeAwDate(index) {
  const dates = getAwDates();
  dates.splice(index, 1);
  saveAwDates(dates);
  renderCalendar();
  showToast('Datum borttaget');
}

// Make functions available globally for inline handlers
window.downloadICS = downloadICS;
window.getAwDates = getAwDates;
window.removeAwDate = removeAwDate;

// Add AW date form
document.getElementById('add-aw-btn').addEventListener('click', () => {
  document.getElementById('add-aw-form').classList.remove('hidden');
});

document.getElementById('cancel-aw-btn').addEventListener('click', () => {
  document.getElementById('add-aw-form').classList.add('hidden');
});

document.getElementById('save-aw-btn').addEventListener('click', () => {
  const date = document.getElementById('new-aw-date').value;
  const time = document.getElementById('new-aw-time').value || '16:30';
  const note = document.getElementById('new-aw-note').value;

  if (!date) { showToast('Välj ett datum'); return; }

  const dates = getAwDates();
  dates.push({ date, time, note });
  saveAwDates(dates);

  document.getElementById('new-aw-date').value = '';
  document.getElementById('new-aw-note').value = '';
  document.getElementById('add-aw-form').classList.add('hidden');

  renderCalendar();
  showToast('AW-datum tillagt!');
});

// ── Keyboard shortcut ──
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && currentMode === 'random' && !isSpinning && document.activeElement.tagName !== 'TEXTAREA' && document.activeElement.tagName !== 'INPUT') {
    e.preventDefault();
    spin();
  }
});
