// === AW GENERATOR - Helsingborgs Stad ===

// State
let currentMode = 'random';
let isSpinning = false;
let battleVotes = { 1: 0, 2: 0 };
let battleRestaurants = { 1: null, 2: null };
let winnerDeclared = false;

// DOM Elements
const btnRandom = document.getElementById('btn-random');
const btnBattle = document.getElementById('btn-battle');
const randomMode = document.getElementById('random-mode');
const battleMode = document.getElementById('battle-mode');
const slotDisplay = document.getElementById('slot-display');
const spinBtn = document.getElementById('spin-btn');
const resultCard = document.getElementById('result-card');
const resultName = document.getElementById('result-name');
const resultAddress = document.getElementById('result-address');
const resultTagline = document.getElementById('result-tagline');
const mapsBtn = document.getElementById('maps-btn');
const againBtn = document.getElementById('again-btn');
const filterToggle = document.getElementById('filter-toggle');
const filterOptions = document.getElementById('filter-options');
const battleGenerateBtn = document.getElementById('battle-generate-btn');
const battleArena = document.getElementById('battle-arena');
const battleControls = document.getElementById('battle-controls');
const battleWinner = document.getElementById('battle-winner');

// === UTILITY FUNCTIONS ===

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomTagline() {
  return getRandomItem(FUN_TAGLINES);
}

function getFilteredRestaurants() {
  const checked = [...document.querySelectorAll('.filter-chip input:checked')]
    .map(cb => cb.value);
  if (checked.length === 0) return RESTAURANTS;
  return RESTAURANTS.filter(r => checked.includes(r.area));
}

function getTwoRandom() {
  const pool = getFilteredRestaurants();
  if (pool.length < 2) return [pool[0], pool[0]];
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1]];
}

function openMaps(restaurant) {
  const query = encodeURIComponent(`${restaurant.name}, ${restaurant.address}, Helsingborg`);
  window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
}

function createConfetti(container) {
  const colors = ['#ff6b35', '#ffc857', '#ff4757', '#3b82f6', '#10b981', '#a855f7'];
  for (let i = 0; i < 40; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + '%';
    piece.style.background = getRandomItem(colors);
    piece.style.animationDelay = Math.random() * 0.5 + 's';
    piece.style.animationDuration = (2 + Math.random() * 2) + 's';
    const size = 6 + Math.random() * 10;
    piece.style.width = size + 'px';
    piece.style.height = size + 'px';
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    container.appendChild(piece);
    setTimeout(() => piece.remove(), 4000);
  }
}

function showToast(message) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 2500);
}

// === MODE SWITCHING ===

function switchMode(mode) {
  currentMode = mode;
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.mode-section').forEach(s => s.classList.remove('active'));

  if (mode === 'random') {
    btnRandom.classList.add('active');
    randomMode.classList.add('active');
  } else {
    btnBattle.classList.add('active');
    battleMode.classList.add('active');
  }
}

btnRandom.addEventListener('click', () => switchMode('random'));
btnBattle.addEventListener('click', () => switchMode('battle'));

// === RANDOM / SLOT MACHINE MODE ===

function spin() {
  if (isSpinning) return;
  isSpinning = true;

  resultCard.classList.add('hidden');
  spinBtn.classList.add('spinning');

  const pool = getFilteredRestaurants();
  if (pool.length === 0) {
    slotDisplay.innerHTML = '<div style="color: var(--red);">Inga restauranger matchar filtret!</div>';
    isSpinning = false;
    spinBtn.classList.remove('spinning');
    return;
  }

  let ticks = 0;
  const totalTicks = 25 + Math.floor(Math.random() * 10);
  let speed = 60;

  const interval = setInterval(() => {
    const rand = getRandomItem(pool);
    slotDisplay.innerHTML = `<div class="spinning-name">${rand.name}</div>`;
    ticks++;

    if (ticks > totalTicks * 0.7) {
      speed += 20;
    }

    if (ticks >= totalTicks) {
      clearInterval(interval);
      showResult(getRandomItem(pool));
    }
  }, speed);

  // Use dynamic speed by clearing and restarting
  let currentTick = 0;
  let currentSpeed = 60;
  clearInterval(interval);

  function doTick() {
    const rand = getRandomItem(pool);
    slotDisplay.innerHTML = `<div class="spinning-name">${rand.name}</div>`;
    currentTick++;

    if (currentTick > totalTicks * 0.6) {
      currentSpeed = Math.min(currentSpeed + 15, 300);
    }

    if (currentTick >= totalTicks) {
      showResult(getRandomItem(pool));
      return;
    }

    setTimeout(doTick, currentSpeed);
  }

  doTick();
}

function showResult(restaurant) {
  isSpinning = false;
  spinBtn.classList.remove('spinning');

  const tagline = getRandomTagline();

  slotDisplay.innerHTML = `<div class="spinning-name" style="animation: none; color: var(--primary);">${restaurant.name}</div>`;

  resultCard.classList.remove('hidden');
  resultName.textContent = restaurant.name;
  resultAddress.textContent = `📍 ${restaurant.address}, Helsingborg`;
  resultTagline.textContent = tagline;

  createConfetti(document.getElementById('confetti-container'));

  // Store for maps
  resultCard.dataset.restaurant = JSON.stringify(restaurant);
}

spinBtn.addEventListener('click', spin);

mapsBtn.addEventListener('click', () => {
  const r = JSON.parse(resultCard.dataset.restaurant);
  openMaps(r);
});

againBtn.addEventListener('click', spin);

// === FILTER ===

filterToggle.addEventListener('click', () => {
  filterOptions.classList.toggle('hidden');
  filterToggle.textContent = filterOptions.classList.contains('hidden')
    ? '⚙️ Filtrera områden'
    : '⚙️ Dölj filter';
});

// === BATTLE MODE ===

function startBattle() {
  const [r1, r2] = getTwoRandom();
  battleRestaurants = { 1: r1, 2: r2 };
  battleVotes = { 1: 0, 2: 0 };
  winnerDeclared = false;

  document.getElementById('battle-name-1').textContent = r1.name;
  document.getElementById('battle-address-1').textContent = `📍 ${r1.address}`;
  document.getElementById('battle-tagline-1').textContent = getRandomTagline();
  document.getElementById('vote-count-1').textContent = '0';
  document.getElementById('battle-arg-1').value = '';

  document.getElementById('battle-name-2').textContent = r2.name;
  document.getElementById('battle-address-2').textContent = `📍 ${r2.address}`;
  document.getElementById('battle-tagline-2').textContent = getRandomTagline();
  document.getElementById('vote-count-2').textContent = '0';
  document.getElementById('battle-arg-2').value = '';

  battleArena.classList.remove('hidden');
  battleControls.classList.remove('hidden');
  battleWinner.classList.add('hidden');
  battleGenerateBtn.querySelector('.spin-text').textContent = '⚔️ NY BATTLE!';
}

battleGenerateBtn.addEventListener('click', startBattle);

// Voting
document.getElementById('vote-1').addEventListener('click', () => vote(1));
document.getElementById('vote-2').addEventListener('click', () => vote(2));

function vote(side) {
  if (winnerDeclared) return;
  battleVotes[side]++;
  document.getElementById(`vote-count-${side}`).textContent = battleVotes[side];

  const btn = document.getElementById(`vote-${side}`);
  btn.classList.add('voted');
  setTimeout(() => btn.classList.remove('voted'), 400);
}

// Declare winner
document.getElementById('battle-declare').addEventListener('click', () => {
  if (winnerDeclared) return;

  let winner;
  if (battleVotes[1] > battleVotes[2]) {
    winner = battleRestaurants[1];
  } else if (battleVotes[2] > battleVotes[1]) {
    winner = battleRestaurants[2];
  } else {
    // Tie — random!
    winner = Math.random() > 0.5 ? battleRestaurants[1] : battleRestaurants[2];
    showToast('Oavgjort! Ödet fick avgöra... 🎲');
  }

  winnerDeclared = true;
  document.getElementById('winner-name').textContent = winner.name;
  battleWinner.classList.remove('hidden');
  battleWinner.dataset.restaurant = JSON.stringify(winner);

  // Scroll to winner
  battleWinner.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

document.getElementById('winner-maps-btn').addEventListener('click', () => {
  const r = JSON.parse(battleWinner.dataset.restaurant);
  openMaps(r);
});

// Reset battle
document.getElementById('battle-reset').addEventListener('click', startBattle);

// Share/Copy
document.getElementById('battle-share').addEventListener('click', () => {
  const r1 = battleRestaurants[1];
  const r2 = battleRestaurants[2];
  const arg1 = document.getElementById('battle-arg-1').value;
  const arg2 = document.getElementById('battle-arg-2').value;

  let text = `⚔️ AW BATTLE - Helsingborg ⚔️\n\n`;
  text += `🔴 ${r1.name} (${r1.address})\n`;
  text += `   Röster: ${battleVotes[1]}`;
  if (arg1) text += `\n   "${arg1}"`;
  text += `\n\n🔵 ${r2.name} (${r2.address})\n`;
  text += `   Röster: ${battleVotes[2]}`;
  if (arg2) text += `\n   "${arg2}"`;

  if (winnerDeclared) {
    const winnerName = document.getElementById('winner-name').textContent;
    text += `\n\n🏆 VINNARE: ${winnerName}!`;
  }

  text += '\n\n🍻 Genererad med AW Generator Helsingborg';

  navigator.clipboard.writeText(text).then(() => {
    showToast('Kopierat till urklipp! 📋');
  }).catch(() => {
    showToast('Kunde inte kopiera, försök igen');
  });
});

// === KEYBOARD SHORTCUT — SPACE TO SPIN ===
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && currentMode === 'random' && !isSpinning) {
    // Don't spin if user is typing in battle mode textareas
    if (document.activeElement.tagName === 'TEXTAREA') return;
    e.preventDefault();
    spin();
  }
});

// === FUN EASTER EGG — Konami-ish (type "aw") ===
let konamiBuffer = '';
document.addEventListener('keydown', (e) => {
  if (document.activeElement.tagName === 'TEXTAREA') return;
  konamiBuffer += e.key.toLowerCase();
  if (konamiBuffer.length > 10) konamiBuffer = konamiBuffer.slice(-10);
  if (konamiBuffer.endsWith('aw')) {
    showToast('🍻 AW-läge aktiverat! Let\'s gooo!');
    document.querySelector('.title-aw').style.animation = 'shimmer 0.5s linear infinite';
    setTimeout(() => {
      document.querySelector('.title-aw').style.animation = 'shimmer 3s linear infinite';
    }, 3000);
  }
});
