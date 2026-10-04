// ================= STATE =================
let notes = JSON.parse(localStorage.getItem('forest_notes') || '[]');
let feedbacks = JSON.parse(localStorage.getItem('forest_feedbacks') || '[]');
let garden = JSON.parse(localStorage.getItem('forest_garden') || '[]');
let currentFilter = 'all';
let searchQuery = '';

// ================= DOM =================
const titleInput = document.getElementById('title');
const categorySelect = document.getElementById('category');
const contentInput = document.getElementById('content');
const addBtn = document.getElementById('addBtn');
const clearBtn = document.getElementById('clearBtn');
const notesList = document.getElementById('notesList');
const searchInput = document.getElementById('search');
const countEl = document.getElementById('count');
const navBtns = document.querySelectorAll('.nav-btn');
const gardenEl = document.getElementById('garden');
const plantBtn = document.getElementById('plantBtn');
const waterAllBtn = document.getElementById('waterAllBtn');
const harvestBtn = document.getElementById('harvestBtn');
const treeCountEl = document.getElementById('treeCount');
const waterCountEl = document.getElementById('waterCount');
const feedbackForm = document.getElementById('feedbackForm');
const fbName = document.getElementById('fbName');
const fbMessage = document.getElementById('fbMessage');
const fbMood = document.getElementById('fbMood');
const feedbackList = document.getElementById('feedbackList');
const fbCount = document.getElementById('fbCount');
const cat = document.getElementById('cat');
const catSpeech = document.getElementById('catSpeech');
const grassContainer = document.getElementById('grassContainer');
const gokuBurst = document.getElementById('gokuBurst');

// ================= CONST =================
const CATEGORY_LABELS = { dev: '💻 Phát triển', tech: '⚙️ Công nghệ', forest: '🤡 Forest' };
const TREE_EMOJIS = ['🌱', '🌿', '🌾', '🌳', '🌲'];
const MAX_TREE_STAGE = 4;
const CAT_MEOWS = ['Meo meo 🐱', 'Meow~ 🐾', 'Ngủ ngon hong? 😴', 'Cho tui cá đi 🐟', 'Tui là mèo rừng 🌲', 'Purrr 🐾', 'Cưng quá 💚'];
const FEEDBACK_REPLIES = ['Cảm ơn bạn nhiều nhé! 🐱', 'Phản hồi đã gửi tới mèo trưởng 🌲', 'Mèo gật đầu lia lịa 🐾', 'Ghi nhận! Cây cũng vui 🌳'];
const GOKU_LINES = ['KAME...HAME...HA!!! 💥', 'Super Saiyan Meow 🐱⚡', 'Ta là mèo Goku! 🌟', 'Sức mạnh vô hạn!!! 🔥', 'Ahhhhhh!!! 💥💥💥'];
const GRASS_EMOJIS = ['🌿', '☘️', '🍀', '🌾'];
const GOKU_CATS = ['🐱', '😼', '😻'];
let grassEaten = 0;
let catIsGoku = false;

// ================= STORAGE =================
function save() {
  localStorage.setItem('forest_notes', JSON.stringify(notes));
  localStorage.setItem('forest_feedbacks', JSON.stringify(feedbacks));
  localStorage.setItem('forest_garden', JSON.stringify(garden));
}

// ================= UTILS =================
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
function formatDate(ts) {
  return new Date(ts).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ================= NOTES =================
function renderNotes() {
  let filtered = notes;
  if (currentFilter !== 'all') filtered = filtered.filter(n => n.category === currentFilter);
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
  }
  filtered = [...filtered].sort((a, b) => b.createdAt - a.createdAt);
  countEl.textContent = `${filtered.length} ghi chú`;
  if (filtered.length === 0) {
    notesList.innerHTML = '<div class="empty"><span class="emoji">🌲</span>Chưa có ghi chú nào!</div>';
    return;
  }
  notesList.innerHTML = filtered.map(note => `
    <article class="note" data-cat="${note.category}">
      <div class="note-header">
        <div class="note-title">${escapeHtml(note.title)}</div>
        <span class="note-tag">${CATEGORY_LABELS[note.category] || note.category}</span>
      </div>
      <div class="note-content">${escapeHtml(note.content)}</div>
      <div class="note-footer">
        <span>🕒 ${formatDate(note.createdAt)}</span>
        <button class="delete-btn" data-id="${note.id}" title="Xóa">🗑️</button>
      </div>
    </article>
  `).join('');
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteNote(btn.dataset.id));
  });
}

function addNote() {
  const title = titleInput.value.trim();
  const content = contentInput.value.trim();
  const category = categorySelect.value;
  if (!title && !content) { showCatSpeech('Nhập gì đó trước đã! 🤡'); return; }
  notes.push({ id: Date.now().toString(), title: title || 'Không có tiêu đề', content: content || '(Trống)', category, createdAt: Date.now() });
  save(); renderNotes();
  titleInput.value = ''; contentInput.value = ''; titleInput.focus();
  showCatSpeech('Note mới ngon lành! ✍️');
}

function deleteNote(id) {
  if (!confirm('Xóa ghi chú này?')) return;
  notes = notes.filter(n => n.id !== id);
  save(); renderNotes();
}

// ================= 🌳 GARDEN =================
function plantTree() {
  if (garden.length >= 12) { showCatSpeech('Vườn đầy rồi! ✂️'); return; }
  garden.push({ id: Date.now().toString() + Math.random().toString(36).slice(2, 6), stage: 0, water: 0, plantedAt: Date.now() });
  save(); renderGarden();
  showCatSpeech('Trồng cây mới! 🌱');
}

function waterTree(id) {
  const tree = garden.find(t => t.id === id);
  if (!tree) return;
  if (tree.stage >= MAX_TREE_STAGE) { showCatSpeech('Cây lớn hết cỡ rồi! ✂️'); return; }
  tree.water += 1;
  if (tree.water >= 2) { tree.water = 0; tree.stage += 1; }
  save(); renderGarden();
  if (tree.stage === MAX_TREE_STAGE) showCatSpeech('Cây lớn rồi nè! 🎉');
}

function waterAll() {
  const watered = garden.filter(t => t.stage < MAX_TREE_STAGE);
  if (watered.length === 0) { showCatSpeech('Không còn cây nào cần tưới 💧'); return; }
  watered.forEach(tree => {
    tree.water += 1;
    if (tree.water >= 2) { tree.water = 0; tree.stage += 1; }
  });
  save(); renderGarden();
  showCatSpeech(`Đã tưới ${watered.length} cây 💧`);
}

function harvest() {
  const bigTrees = garden.filter(t => t.stage === MAX_TREE_STAGE);
  if (bigTrees.length === 0) { showCatSpeech('Chưa có cây lớn ✂️'); return; }
  if (!confirm(`Chặt ${bigTrees.length} cây lớn?`)) return;
  garden = garden.filter(t => t.stage < MAX_TREE_STAGE);
  save(); renderGarden();
  showCatSpeech(`Đã chặt ${bigTrees.length} cây 🪓`);
}

function renderGarden() {
  treeCountEl.textContent = `${garden.length} 🌳`;
  const totalWater = garden.reduce((sum, t) => sum + t.water, 0);
  waterCountEl.textContent = `${totalWater} 💧`;
  if (garden.length === 0) {
    gardenEl.innerHTML = '<div class="garden-empty">🌱 Chưa có cây nào!</div>';
    return;
  }
  gardenEl.innerHTML = garden.map(tree => {
    const progress = tree.stage >= MAX_TREE_STAGE ? 100 : (tree.water / 2) * 100;
    return `
      <div class="tree tree-stage-${tree.stage}" data-id="${tree.id}" title="Click để tưới 💧">
        <div class="tree-emoji">${TREE_EMOJIS[tree.stage]}</div>
        <div class="tree-bar"><div class="tree-bar-fill" style="width: ${progress}%"></div></div>
        <div class="tree-label">${tree.stage >= MAX_TREE_STAGE ? 'Lớn 🌳' : `💧 ${tree.water}/2`}</div>
      </div>
    `;
  }).join('');
  document.querySelectorAll('.tree').forEach(el => {
    el.addEventListener('click', () => waterTree(el.dataset.id));
  });
}

// ================= 📬 FEEDBACK =================
function renderFeedback() {
  fbCount.textContent = feedbacks.length;
  if (feedbacks.length === 0) {
    feedbackList.innerHTML = '<div class="fb-empty">Chưa có phản hồi nào. Bạn là người đầu tiên! 🐱</div>';
    return;
  }
  const sorted = [...feedbacks].sort((a, b) => b.createdAt - a.createdAt);
  feedbackList.innerHTML = sorted.map(fb => `
    <div class="fb-item">
      <div class="fb-item-header">
        <span class="fb-name">${escapeHtml(fb.name)}</span>
        <div class="fb-meta">
          <span class="fb-mood">${fb.mood}</span>
          <span>${formatDate(fb.createdAt)}</span>
          <button class="fb-delete" data-id="${fb.id}" title="Xóa">🗑️</button>
        </div>
      </div>
      <div class="fb-message">${escapeHtml(fb.message)}</div>
    </div>
  `).join('');
  document.querySelectorAll('.fb-delete').forEach(btn => {
    btn.addEventListener('click', () => deleteFeedback(btn.dataset.id));
  });
}

function addFeedback(e) {
  e.preventDefault();
  const name = fbName.value.trim();
  const message = fbMessage.value.trim();
  const mood = fbMood.value;
  if (!name || !message) return;
  feedbacks.push({ id: Date.now().toString(), name, message, mood, createdAt: Date.now() });
  save(); renderFeedback();
  fbName.value = ''; fbMessage.value = ''; fbMood.value = '😊';
  const reply = FEEDBACK_REPLIES[Math.floor(Math.random() * FEEDBACK_REPLIES.length)];
  showCatSpeech(reply);
}

function deleteFeedback(id) {
  if (!confirm('Xóa phản hồi này?')) return;
  feedbacks = feedbacks.filter(f => f.id !== id);
  save(); renderFeedback();
}

// ================= 🐱 CAT =================
let catX = 0, catY = 0, catDir = 1;

function moveCat() {
  const maxX = window.innerWidth - 60;
  const maxY = window.innerHeight - 60;
  catX += catDir * (Math.random() * 3 + 1);
  if (catX <= 0) { catX = 0; catDir = 1; cat.style.transform = 'scaleX(1)'; }
  else if (catX >= maxX) { catX = maxX; catDir = -1; cat.style.transform = 'scaleX(-1)'; }
  if (Math.random() < 0.1) catY = Math.random() * (maxY - 100) + 50;
  cat.style.left = catX + 'px';
  cat.style.top = catY + 'px';
}

function startCatRoaming() {
  catX = Math.random() * (window.innerWidth - 100);
  catY = Math.random() * (window.innerHeight - 200) + 100;
  cat.style.left = catX + 'px';
  cat.style.top = catY + 'px';
  setInterval(moveCat, 100);
}

function showCatSpeech(text) {
  catSpeech.textContent = text;
  const catRect = cat.getBoundingClientRect();
  let speechX = catRect.left + 50;
  let speechY = catRect.top - 50;
  if (speechX + 200 > window.innerWidth) speechX = window.innerWidth - 220;
  if (speechY < 10) speechY = catRect.bottom + 10;
  catSpeech.style.left = speechX + 'px';
  catSpeech.style.top = speechY + 'px';
  catSpeech.classList.add('show');
  clearTimeout(catSpeech._timer);
  catSpeech._timer = setTimeout(() => catSpeech.classList.remove('show'), 2200);
}

function onCatClick() {
  const meow = CAT_MEOWS[Math.floor(Math.random() * CAT_MEOWS.length)];
  showCatSpeech(meow);
  cat.style.transform = 'scale(1.5) rotate(-15deg)';
  setTimeout(() => { cat.style.transform = catDir === 1 ? 'scale(1)' : 'scaleX(-1)'; }, 200);
}

// ================= 🌿 GRASS + GOKU =================
function spawnGrass() {
  if (document.querySelectorAll('.grass').length >= 6) return;
  const grass = document.createElement('div');
  grass.className = 'grass';
  grass.textContent = GRASS_EMOJIS[Math.floor(Math.random() * GRASS_EMOJIS.length)];
  const x = Math.random() * (window.innerWidth - 100) + 50;
  const y = Math.random() * (window.innerHeight - 150) + 80;
  grass.style.left = x + 'px';
  grass.style.top = y + 'px';
  grass.dataset.x = x;
  grass.dataset.y = y;
  grass.addEventListener('click', () => eatGrass(grass, x + 30, y + 30));
  grassContainer.appendChild(grass);
}

function eatGrass(grassEl, x, y) {
  if (!grassEl || grassEl.dataset.eaten) return;
  grassEl.dataset.eaten = '1';
  grassEl.style.opacity = '0';
  setTimeout(() => grassEl.remove(), 500);
  grassEaten++;
  updateGrassHUD();
  catX = x - 30; catY = y - 30;
  cat.style.left = catX + 'px'; cat.style.top = catY + 'px';
  showCatSpeech('Nom nom cỏ ngon ghê 🌿');
  transformToGoku(x, y);
}

function transformToGoku(x, y) {
  if (catIsGoku) return;
  catIsGoku = true;
  cat.classList.add('goku');
  const line = GOKU_LINES[Math.floor(Math.random() * GOKU_LINES.length)];
  const flash = document.createElement('div');
  flash.className = 'goku-flash';
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 700);
  const text = document.createElement('div');
  text.className = 'goku-burst-text';
  text.textContent = line;
  text.style.left = x + 'px'; text.style.top = y + 'px';
  gokuBurst.appendChild(text);
  setTimeout(() => text.remove(), 1600);
  setTimeout(() => {
    for (let i = 0; i < 3; i++) {
      const miniCat = document.createElement('div');
      miniCat.className = 'goku-split-cat';
      miniCat.textContent = GOKU_CATS[i];
      miniCat.style.left = x + 'px'; miniCat.style.top = y + 'px';
      const angles = [-120, 120, -90];
      const dist = 300;
      const angleRad = (angles[i] * Math.PI) / 180;
      const flyX = Math.cos(angleRad) * dist;
      const flyY = Math.sin(angleRad) * dist;
      miniCat.style.setProperty('--fly-x', flyX + 'px');
      miniCat.style.setProperty('--fly-y', flyY + 'px');
      document.body.appendChild(miniCat);
      setTimeout(() => miniCat.remove(), 1500 + i * 100);
    }
  }, 300);
  setTimeout(() => {
    cat.classList.remove('goku');
    catIsGoku = false;
    showCatSpeech('Chill... mệt quá 🥵');
  }, 4000);
}

function updateGrassHUD() {
  let hud = document.querySelector('.grass-hud');
  if (!hud) {
    hud = document.createElement('div');
    hud.className = 'grass-hud';
    document.body.appendChild(hud);
  }
  hud.textContent = `🌿 Đã ăn: ${grassEaten} cỏ | 🐱⚡ Goku: ${grassEaten >= 1 ? 'ON' : 'OFF'}`;
}

function catSeekGrass() {
  if (catIsGoku) return;
  const grasses = document.querySelectorAll('.grass:not([data-eaten])');
  if (grasses.length === 0) return;
  let nearest = null, minDist = Infinity;
  grasses.forEach(g => {
    const gx = parseFloat(g.dataset.x);
    const gy = parseFloat(g.dataset.y);
    const dx = gx - catX, dy = gy - catY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < minDist) { minDist = dist; nearest = g; }
  });
  if (!nearest) return;
  const gx = parseFloat(nearest.dataset.x);
  const gy = parseFloat(nearest.dataset.y);
  cat.style.transition = 'left 1.2s ease, top 1.2s ease';
  catX = gx; catY = gy;
  cat.style.left = catX + 'px'; cat.style.top = catY + 'px';
  setTimeout(() => {
    eatGrass(nearest, gx + 30, gy + 30);
    setTimeout(() => { cat.style.transition = ''; }, 100);
  }, 1200);
}

// ================= EVENTS =================
addBtn.addEventListener('click', addNote);

clearBtn.addEventListener('click', () => {
  if (notes.length === 0) return;
  if (confirm('Xóa TẤT CẢ ghi chú?')) {
    notes = [];
    save(); renderNotes();
    showCatSpeech('Sạch bóng ghi chú 🧹');
  }
});

document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') addNote();
});

navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    navBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.cat;
    renderNotes();
  });
});

searchInput.addEventListener('input', (e) => { searchQuery = e.target.value; renderNotes(); });
plantBtn.addEventListener('click', plantTree);
waterAllBtn.addEventListener('click', waterAll);
harvestBtn.addEventListener('click', harvest);
feedbackForm.addEventListener('submit', addFeedback);
cat.addEventListener('click', onCatClick);

// ================= INIT =================
if (notes.length === 0) {
  notes = [
    { id: '1', title: 'Chào mừng đến Forest Notes 🌲', content: 'Ghi chú mẫu. Nhấn Ctrl + Enter để thêm nhanh!', category: 'forest', createdAt: Date.now() - 1000 },
    { id: '2', title: 'Cách dùng the forest 🤡', content: '1. Mở app\n2. Chặt cây\n3. Xây nhà\n4. Sống sót 🤡', category: 'forest', createdAt: Date.now() - 2000 },
    { id: '3', title: 'Git cơ bản', content: 'git init\ngit add .\ngit commit -m "init"', category: 'dev', createdAt: Date.now() - 3000 }
  ];
}

if (feedbacks.length === 0) {
  feedbacks = [
    { id: '1', name: 'Mèo Con 🐱', message: 'Web xịn quá!', mood: '🤩', createdAt: Date.now() - 5000 },
    { id: '2', name: 'Người Rừng 🌲', message: 'Cây lớn nhanh ghê 🌳', mood: '😊', createdAt: Date.now() - 8000 }
  ];
}

save();
renderNotes();
renderGarden();
renderFeedback();
startCatRoaming();

setTimeout(() => showCatSpeech('Chào bro! Tui là mèo canh web 🐱'), 800);
setTimeout(() => showCatSpeech('Có cỏ kìa! Để tui ăn thử 🌿'), 5000);

for (let i = 0; i < 3; i++) setTimeout(spawnGrass, i * 500);
setInterval(spawnGrass, 8000);
setInterval(catSeekGrass, 6000);
updateGrassHUD();
