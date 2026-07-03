const pages = [
  { img: 'assets/page1.png', title: 'زيارة بيت الدب', text: 'في يومٍ مشمس، قررت مسك أن تزور صديقها الدب في بيته داخل الغابة. طرقت الباب وقالت: مرحبًا يا دب! هل أنت هنا؟' },
  { img: 'assets/page2.png', title: 'الشاي والعسل', text: 'فتح الدب الباب بفرح وقال: أهلاً بك يا مسك! تفضلي، لقد أعددت لك بعض الشاي والعسل.' },
  { img: 'assets/page3.png', title: 'الفراشات الجميلة', text: 'بعد الشاي قالت مسك: لنستكشف الغابة! وانطلقا معًا بين الأشجار والزهور، يبحثان عن الفراشات الجميلة.', game: true },
  { img: 'assets/page4.png', title: 'المطر والمظلة', text: 'فجأة بدأت الغيوم تتجمع، وقرر الدب أن يعودا إلى المنزل قبل المطر. قالت مسك: كان يومًا رائعًا! شكرًا لك يا دب.' },
  { img: 'assets/page5.png', title: 'الصداقة أجمل', text: 'عادا إلى البيت وجلسا قرب النافذة يشاهدان المطر. قال الدب: الصداقة مثل المطر، تجعل حياتنا أجمل. ابتسمت مسك وقالت: نعم، ومعك يا دب كل يوم مغامرة جميلة.' }
];

const COLORING_VERSION = 'v5';
const colorImgs = [
  `assets/coloring/coloring1.png?${COLORING_VERSION}`,
  `assets/coloring/coloring2.png?${COLORING_VERSION}`,
  `assets/coloring/coloring3.png?${COLORING_VERSION}`,
  `assets/coloring/coloring4.png?${COLORING_VERSION}`,
  `assets/coloring/coloring5.png?${COLORING_VERSION}`
];

let current = 0;
let earned = 0;
let currentAudio = null;
let canvas, ctx, drawing = false, brushColor = '#d94c8a', brushSize = 16, colorIndex = 0, coloringReady = false;

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

function showScreen(id) {
  $$('.screen').forEach(x => x.classList.remove('active'));
  const screen = $('#' + id);
  if (screen) screen.classList.add('active');

  $$('.tab').forEach(b => {
    if (b.dataset.screen) b.classList.toggle('active', b.dataset.screen === id);
  });

  if (id === 'story') renderPage(current);
  if (id === 'coloring') setTimeout(loadColoring, 60);
}

function renderPage(i) {
  current = Math.max(0, Math.min(pages.length - 1, i));
  const p = pages[current];

  const pageImg = $('#pageImg');
  if (pageImg) {
    pageImg.src = p.img;
    pageImg.classList.remove('misk-walk', 'bear-wave', 'tea-steam', 'butterfly-scene', 'rain-scene', 'hug-scene');
    if (current === 0) pageImg.classList.add('bear-wave');
    if (current === 1) pageImg.classList.add('tea-steam');
    if (current === 2) pageImg.classList.add('butterfly-scene');
    if (current === 3) pageImg.classList.add('rain-scene');
    if (current === 4) pageImg.classList.add('hug-scene');
  }

  if ($('#pageBadge')) $('#pageBadge').textContent = `الصفحة ${current + 1} من ${pages.length}`;
  if ($('#pageTitle')) $('#pageTitle').textContent = p.title;
  if ($('#pageText')) $('#pageText').textContent = p.text;
  if ($('#progressBar')) $('#progressBar').style.width = ((current + 1) / pages.length * 100) + '%';
  if ($('#prevBtn')) $('#prevBtn').disabled = current === 0;
  if ($('#nextBtn')) $('#nextBtn').textContent = current === pages.length - 1 ? 'النهاية' : 'التالي';

  earned = Math.max(earned, current + 1);
  if ($('#stars')) $('#stars').textContent = '★ '.repeat(earned) + '☆ '.repeat(Math.max(0, 5 - earned));
  setupGame(!!p.game);
}

function setupGame(on) {
  const box = $('#gameBox');
  if (!box) return;
  box.hidden = !on;
  if (!on) return;

  box.innerHTML = '<b>🦋 التقطي 3 فراشات:</b><br>';
  let caught = 0;

  for (let i = 0; i < 3; i++) {
    const btn = document.createElement('button');
    btn.className = 'butterfly butterfly-fly';
    btn.textContent = '🦋';
    btn.onclick = () => {
      if (btn.classList.contains('caught')) return;
      btn.classList.add('caught');
      caught++;
      if (caught === 3) {
        box.insertAdjacentHTML('beforeend', '<p>أحسنتِ! حصلتِ على كل النجوم ⭐</p>');
        earned = 5;
        if ($('#stars')) $('#stars').textContent = '★ ★ ★ ★ ★';
      }
    };
    box.appendChild(btn);
  }
}

function loadColoring() {
  if (coloringReady) return;
  coloringReady = true;
  canvas = $('#paintCanvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d', { willReadFrequently: true });
  buildColorButtons();
  loadColorPage(0);
  bindPaint();
}

function buildColorButtons() {
  const cp = $('#colorPages');
  if (cp) {
    cp.innerHTML = '';
    colorImgs.forEach((_, i) => {
      const b = document.createElement('button');
      b.textContent = `صفحة ${i + 1}`;
      b.onclick = () => loadColorPage(i);
      cp.appendChild(b);
    });
  }

  const palette = ['#111111', '#ffffff', '#d94c8a', '#8b5cf6', '#3b82f6', '#22c55e', '#facc15', '#f97316', '#ef4444', '#8b5a2b'];
  const cs = $('#colors');
  if (cs) {
    cs.innerHTML = '';
    palette.forEach((c, i) => {
      const s = document.createElement('button');
      s.className = 'swatch' + (i === 2 ? ' active' : '');
      s.style.background = c;
      s.title = c;
      s.onclick = () => {
        brushColor = c;
        $$('.swatch').forEach(x => x.classList.remove('active'));
        s.classList.add('active');
      };
      cs.appendChild(s);
    });
  }

  if ($('#brush')) $('#brush').oninput = e => brushSize = +e.target.value;
  if ($('#eraserBtn')) $('#eraserBtn').onclick = () => brushColor = '#ffffff';
  if ($('#clearBtn')) $('#clearBtn').onclick = () => loadColorPage(colorIndex);
  if ($('#saveBtn')) $('#saveBtn').onclick = () => {
    const a = document.createElement('a');
    a.download = `misk-coloring-${colorIndex + 1}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  };
}

function loadColorPage(i) {
  if (!canvas || !ctx) return;
  colorIndex = i;
  $$('#colorPages button').forEach((b, k) => b.classList.toggle('active', k === i));

  const img = new Image();
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
  };
  img.src = colorImgs[i];
}

function point(e) {
  const r = canvas.getBoundingClientRect();
  const t = e.touches ? e.touches[0] : e;
  return {
    x: (t.clientX - r.left) * (canvas.width / r.width),
    y: (t.clientY - r.top) * (canvas.height / r.height)
  };
}

function bindPaint() {
  function start(e) {
    e.preventDefault();
    drawing = true;
    const p = point(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + .1, p.y + .1);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  function move(e) {
    if (!drawing) return;
    e.preventDefault();
    const p = point(e);
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = brushColor;
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }

  function end() { drawing = false; }

  canvas.addEventListener('mousedown', start);
  canvas.addEventListener('mousemove', move);
  window.addEventListener('mouseup', end);
  canvas.addEventListener('touchstart', start, { passive: false });
  canvas.addEventListener('touchmove', move, { passive: false });
  window.addEventListener('touchend', end);
}

document.addEventListener('DOMContentLoaded', () => {
  $$('[data-screen]').forEach(b => b.addEventListener('click', () => showScreen(b.dataset.screen)));

  const startBtn = $('#startBtn');
  if (startBtn) startBtn.addEventListener('click', () => {
    current = 0;
    showScreen('story');
  });

  const prevBtn = $('#prevBtn');
  if (prevBtn) prevBtn.addEventListener('click', () => renderPage(current - 1));

  const nextBtn = $('#nextBtn');
  if (nextBtn) nextBtn.addEventListener('click', () => {
    if (current >= pages.length - 1) {
      showScreen('home');
    } else {
      renderPage(current + 1);
    }
  });

  const readBtn = $('#readBtn');
  if (readBtn) readBtn.addEventListener('click', () => {
    const p = pages[current];
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    currentAudio = new Audio(`audio/page${current + 1}.mp3`);
    currentAudio.play().catch(() => {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(p.text);
      u.lang = 'ar';
      u.rate = .9;
      speechSynthesis.speak(u);
    });
  });

  renderPage(0);
});
