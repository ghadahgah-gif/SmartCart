// ===== التخزين والحالة =====
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

const state = {
  cart: store.get('sc2_cart', {}),        // { productId: qty }
  order: store.get('sc2_order', []),      // آخر المنتجات المضافة (الأحدث أولاً)
  budget: store.get('sc2_budget', 150),
  cats: store.get('sc2_cats', []),        // الفئات المختارة للمسار
  started: store.get('sc2_started', null),
  last: store.get('sc2_last', null),      // ملخص آخر جلسة (لشاشة النجاح)
  user: store.get('sc2_user', null),      // { name, guest }
};
function save() {
  store.set('sc2_cart', state.cart); store.set('sc2_order', state.order); store.set('sc2_budget', state.budget);
  store.set('sc2_cats', state.cats); store.set('sc2_started', state.started); store.set('sc2_last', state.last);
  store.set('sc2_user', state.user);
}

const ui = { cat: 'all', shopQ: '', q: '', editBudget: false };
let nav = { s: state.user ? 'home' : 'login', p: {} };
const stack = [];

// ===== أدوات =====
const $app = document.getElementById('app');
const byId = id => PRODUCTS.find(p => p.id === +id);
const sec = id => SECTIONS.find(s => s.id === id);
const aisleNo = id => SECTIONS.findIndex(s => s.id === id) + 1;
const fmt = n => (Math.round(n * 100) / 100).toFixed(2);
const money = (n, cls = '') => `<span class="money ${cls}"><b>${fmt(n)}</b><small>ر.س</small></span>`;
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const items = () => Object.entries(state.cart).map(([id, q]) => ({ p: byId(id), q })).filter(x => x.p);
const count = () => Object.values(state.cart).reduce((a, b) => a + b, 0);
const total = () => items().reduce((t, { p, q }) => t + p.price * q, 0);
const pct = () => state.budget > 0 ? total() / state.budget * 100 : 0;
const tile = (p, size, out = !p.available) => `<div class="ptile ${size} ${out ? 'out' : ''}">${p.img ? `<img src="${p.img}" alt="${esc(p.name)}" loading="lazy">` : p.emoji}</div>`;

function norm(s) {
  return String(s).trim().toLowerCase()
    .replace(/[ً-ْ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي')
    .split(/\s+/).map(w => (w.startsWith('ال') && w.length > 3 ? w.slice(2) : w)).join(' ');
}
function matches(p, text) {
  const n = norm(text);
  if (n.length < 2) return false;
  const hay = [p.name, p.brand, sec(p.section).name, ...p.keywords].map(norm);
  return n.split(' ').every(w => hay.some(h => h.includes(w)));
}

// ===== أيقونات (خطّية) =====
const IC = {
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  cart: '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  list: '<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>',
  receipt: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M8 8h8"/><path d="M8 12h8"/><path d="M8 16h5"/>',
  map: '<path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/>',
  gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
  wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
  checkc: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  xc: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  nav: '<polygon points="3 11 22 2 13 21 11 13 3 11"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  route: '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
  minus: '<path d="M5 12h14"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
  pencil: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>',
  card: '<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>',
  barcode: '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M8 7v10"/><path d="M12 7v10"/><path d="M17 7v10"/>',
  pin: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  swap: '<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  wifi: '<path d="M12 20h.01"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M5 12.859a10 10 0 0 1 14 0"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  battery: '<rect width="16" height="10" x="2" y="7" rx="2"/><line x1="22" x2="22" y1="11" y2="13"/><line x1="6" x2="6" y1="11" y2="13"/><line x1="10" x2="10" y1="11" y2="13"/>',
};
const ic = n => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${IC[n]}</svg>`;

// ===== التنقل =====
function go(s, p = {}) { stack.push(nav); nav = { s, p }; ui.editBudget = false; render(true); }
function back() { nav = stack.pop() || { s: 'home', p: {} }; render(true); }
function home() { stack.length = 0; nav = { s: state.user ? 'home' : 'login', p: {} }; render(true); }

// ===== منطق العربة =====
// محاكاة الكاميرا: إذا كان المنتج يشبه منتجات أخرى تسأل الشاشة أيّها أضفت
function putInCart(id) {
  const p = byId(id);
  if (!p.available) return toast('هذا المنتج غير متوفر حالياً — جرّب البدائل', true);
  const look = p.look ? PRODUCTS.filter(x => x.look === p.look && x.available) : [];
  if (look.length > 1) return go('confirm', { id });
  addItem(id); go('recog', { id });
}
function addItem(id, silent) {
  const before = pct();
  state.cart[id] = (state.cart[id] || 0) + 1;
  state.order = [+id, ...state.order.filter(x => x !== +id)].slice(0, 12);
  if (!state.started) state.started = Date.now();
  save();
  const now = pct();
  if (now > 100 && before <= 100) toast(`⚠️ تجاوزت ميزانيتك بـ ${fmt(total() - state.budget)} ر.س`, true);
  else if (now >= 80 && before < 80) toast(`اقتربت من ميزانيتك — تبقّى ${fmt(state.budget - total())} ر.س`, true);
  else if (!silent) toast(`✓ أُضيف ${byId(id).name} إلى قائمتك`);
}
function changeQty(id, d) {
  state.cart[id] = (state.cart[id] || 0) + d;
  if (state.cart[id] <= 0) { delete state.cart[id]; state.order = state.order.filter(x => x !== +id); }
  save(); render();
}
function undoAdd(id) {
  changeQty(id, -1);
  toast('تم التراجع — أعِد المنتج إلى الرف');
  back();
}
function toggleCat(id) {
  state.cats = state.cats.includes(id) ? state.cats.filter(c => c !== id) : [...state.cats, id];
  save(); render();
}
function pay() {
  if (!count()) return toast('العربة فارغة', true);
  state.last = { total: total(), count: count(), mins: state.started ? Math.max(1, Math.round((Date.now() - state.started) / 60000)) : 1 };
  state.cart = {}; state.order = []; state.started = null; save();
  stack.length = 0; nav = { s: 'done', p: {} }; render(true);
}
function newSession() { state.cats = []; state.last = null; save(); home(); toast('جلسة تسوق جديدة 🛒'); }
function saveBudget() {
  const v = parseFloat(document.getElementById('budgetInput').value);
  if (!(v > 0)) return toast('اكتب مبلغاً أكبر من صفر', true);
  state.budget = Math.round(v * 100) / 100; ui.editBudget = false; save(); render();
  toast(`تم تحديث الميزانية إلى ${fmt(state.budget)} ر.س`);
}
function editBudget() {
  ui.editBudget = true; render();
  const i = document.getElementById('budgetInput'); if (i) { i.focus(); i.select(); }
}
function scanBarcode() {
  const pool = PRODUCTS.filter(p => p.available);
  const p = pool[Math.floor(Math.random() * pool.length)];
  addItem(p.id, true); go('recog', { id: p.id });
  toast(`تمت قراءة الباركود: ${p.name}`);
}
// بدائل متنوعة: منتج واحد من كل شكل في نفس النوع، ثم من نفس القسم
function alternativesFor(p) {
  const seen = new Set(), out = [];
  const pool = [
    ...PRODUCTS.filter(x => x.id !== p.id && x.available && x.group === p.group),
    ...PRODUCTS.filter(x => x.id !== p.id && x.available && x.section === p.section && x.group !== p.group),
  ];
  for (const x of pool) { const k = x.look || 'id' + x.id; if (!seen.has(k)) { seen.add(k); out.push(x); } }
  return out.slice(0, 3);
}
function startRoute(first) { toast(`ابدأ من موقعك الحالي واتبع الخط المتقطع — أول محطة: ${first}`); }

// ===== تسجيل الدخول =====
function login(e) {
  e.preventDefault();
  const u = document.getElementById('lgUser').value.trim();
  const p = document.getElementById('lgPass').value;
  const err = document.getElementById('lgErr');
  if (!u || !p) { err.textContent = 'اكتب البريد الإلكتروني أو رقم الجوال وكلمة المرور'; return; }
  if (p.length < 4) { err.textContent = 'كلمة المرور يجب أن تكون 4 أحرف على الأقل'; return; }
  const nm = u.includes('@') ? u.split('@')[0] : u;
  state.user = { name: nm.charAt(0).toUpperCase() + nm.slice(1), guest: false };
  save(); home(); toast(`أهلاً ${state.user.name} — العربة جاهزة 🛒`);
}
function guest() { state.user = { name: 'ضيف', guest: true }; save(); home(); }
function logout() {
  state.user = null; state.cart = {}; state.order = []; state.started = null; state.cats = []; save();
  stack.length = 0; nav = { s: 'login', p: {} }; render(true); toast('تم تسجيل الخروج');
}

// ===== التوست =====
function toast(msg, warn) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.className = 'toast show' + (warn ? ' warn' : '');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove('show'), 2800);
}

// ===== شريط الحالة =====
function clock() {
  const d = new Date(); let h = d.getHours(); const m = String(d.getMinutes()).padStart(2, '0');
  const ap = h < 12 ? 'ص' : 'م'; h = h % 12 || 12;
  return `${h}:${m} ${ap}`;
}
const statusbar = () => `
  <header class="statusbar">
    <div class="sb-brand">
      <button onclick="home()" aria-label="الرئيسية">${ic('home')}</button>
      <div class="logo">${ic('cart')}<b>Smart<span>Cart</span></b></div>
    </div>
    <div class="sb-sys">${ic('battery')}${ic('wifi')}<span id="clock">${clock()}</span>${state.user && nav.s !== 'login' ? `<button class="sb-out" onclick="logout()" title="تسجيل الخروج">${ic('logout')}<span>خروج</span></button>` : ''}</div>
  </header>`;
const titleBack = t => `<div class="title-row"><div class="back"><button onclick="back()" aria-label="رجوع">${ic('arrow')}</button><h1 class="h1">${t}</h1></div></div>`;

// ===== الشاشات =====
function sLogin() {
  return `
    <div class="login">
      <section class="login-hero">
        <div class="logo-mark">${ic('cart')}</div>
        <h1 class="login-title" dir="ltr">Smart<span>Cart</span></h1>
        <p class="login-tag">تجربة تسوق أسهل .. أسرع .. أذكى</p>
        <ul class="login-feats">
          <li><span class="icon-box">${ic('map')}</span>أسرع مسار لكل ما تحتاجه داخل المتجر</li>
          <li><span class="icon-box">${ic('list')}</span>قائمة مشتريات تتحدّث تلقائيًا مع كل منتج</li>
          <li><span class="icon-box">${ic('wallet')}</span>ميزانيتك وفاتورتك أمامك قبل الكاشير</li>
        </ul>
      </section>
      <form class="panel login-card" onsubmit="login(event)" novalidate>
        <div><h2 class="h1">تسجيل الدخول</h2><p class="sub">سجّل دخولك لتحفظ قائمتك وميزانيتك، أو تابع كضيف.</p></div>
        <label class="field"><span>البريد الإلكتروني أو رقم الجوال</span>
          <span class="inp">${ic('user')}<input id="lgUser" autocomplete="username" placeholder="example@mail.com" dir="auto"></span></label>
        <label class="field"><span>كلمة المرور</span>
          <span class="inp">${ic('lock')}<input id="lgPass" type="password" autocomplete="current-password" placeholder="••••••"></span></label>
        <p class="error" id="lgErr" role="alert"></p>
        <button class="btn primary block" type="submit">دخول</button>
        <div class="divider"><span>أو</span></div>
        <button class="btn outline block" type="button" onclick="guest()">المتابعة كضيف</button>
      </form>
    </div>`;
}

function sHome() {
  const spent = total();
  const tiles = [
    ['shop', 'cart', 'بدء التسوق', 'main'], ['list', 'list', 'قائمة مشترياتي'], ['search', 'search', 'البحث عن منتج'],
    ['route', 'map', 'عرض المسار'], ['bill', 'receipt', 'عرض السعر النهائي'], ['budget', 'gauge', 'ميزانيتي'],
  ];
  return `
    <div class="home-head">
      <div><h1 class="h1">${state.user && !state.user.guest ? `مرحبًا ${esc(state.user.name)} 👋` : 'مرحبًا بك 👋'}</h1><p class="sub">ماذا تريد أن تفعل اليوم؟</p></div>
      <button class="budget-pill" onclick="go('budget')">${ic('wallet')}
        <span><b>الميزانية المحددة: ${fmt(state.budget)} ر.س</b>
        <small>${count() ? `أنفقت ${fmt(spent)} ر.س · تبقّى ${fmt(state.budget - spent)}` : 'اضغط «بدء التسوق» للبدء'}</small></span>
      </button>
    </div>
    <div class="home-grid">
      ${tiles.map(([s, i, l, c]) => `<button class="tile-btn ${c || ''}" onclick="go('${s}')"><span class="icon-box">${ic(i)}</span>${l}</button>`).join('')}
    </div>`;
}

const openP = id => `onclick="go('product',{id:${id}})"`;
const prodCard = p => `
  <div class="pcard">
    <button class="plink" ${openP(p.id)} aria-label="تفاصيل ${esc(p.name)}">${tile(p, 'md')}</button>
    <div class="brand">${p.brand}</div>
    <button class="plink pname" ${openP(p.id)}>${p.name}</button>
    <div class="psize">${p.size}${p.available ? '' : ' · <span class="avail no">غير متوفر</span>'}</div>
    <div class="prow">
      <span>${money(p.price)}${p.per ? `<small class="psize"> / ${p.per}</small>` : ''}</span>
      ${p.available
        ? `<button class="add-btn" onclick="putInCart(${p.id})" aria-label="ضعه في العربة" title="ضعه في العربة">${ic('plus')}</button>`
        : `<button class="add-btn alt" onclick="go('alt',{id:${p.id}})" aria-label="عرض البدائل" title="عرض البدائل">${ic('swap')}</button>`}
    </div>
  </div>`;

function sShop() {
  const sideBtn = (id, name) => `<button class="${ui.cat === id ? 'on' : ''}" onclick="ui.cat='${id}';ui.shopQ='';render()">${name}${id !== 'all' && state.cats.includes(id) ? '<small>✓</small>' : ''}</button>`;
  return `
    <div class="shop">
      <nav class="panel side">${sideBtn('all', 'جميع الفئات')}${SECTIONS.map(s => sideBtn(s.id, s.name)).join('')}</nav>
      <div class="shop-main">
        <div class="shop-top">
          <label class="searchbar">${ic('search')}<input id="shopQ" type="search" placeholder="ابحث عن منتج..." value="${esc(ui.shopQ)}" oninput="ui.shopQ=this.value;drawShop()"></label>
          <button class="btn primary" onclick="toRoute()">${ic('map')}احصل على أسرع مسار</button>
        </div>
        <div id="shopBody" class="col-gap"></div>
      </div>
    </div>`;
}
function drawShop() {
  const box = document.getElementById('shopBody');
  if (!box) return;
  if (ui.shopQ.trim()) {
    const res = PRODUCTS.filter(p => matches(p, ui.shopQ));
    box.innerHTML = `<h2 class="h2">نتائج البحث (${res.length})</h2>` + (res.length
      ? `<div class="prod-grid">${res.map(prodCard).join('')}</div>`
      : `<p class="sub">ما لقينا نتائج لـ «${esc(ui.shopQ)}»</p>`);
    return;
  }
  if (ui.cat === 'all') {
    box.innerHTML = `
      <div class="title-row"><h2 class="h1">اختر الفئة</h2><span class="hint">اضغط على الفئات التي تحتاجها، وسنرسم لك أسرع مسار لها</span></div>
      <div class="cat-grid">${SECTIONS.map(s => `
        <div class="cat-card ${state.cats.includes(s.id) ? 'sel' : ''}" role="button" tabindex="0" aria-pressed="${state.cats.includes(s.id)}" onclick="toggleCat('${s.id}')" onkeydown="if(event.key==='Enter')toggleCat('${s.id}')">
          <div class="ptile">${s.tile}</div>
          <div class="name">${ic('checkc')}${s.name}</div>
          <button class="open" onclick="event.stopPropagation();ui.cat='${s.id}';render()">عرض المنتجات</button>
        </div>`).join('')}
      </div>`;
    return;
  }
  const s = sec(ui.cat), on = state.cats.includes(s.id), list = PRODUCTS.filter(p => p.section === s.id);
  box.innerHTML = `
    <div class="title-row">
      <div><h2 class="h1">${s.name}</h2><p class="sub">الممر ${aisleNo(s.id)} · ${list.length} منتجات</p></div>
      <button class="btn ${on ? 'outline' : 'primary'} sm" onclick="toggleCat('${s.id}')">${on ? `${ic('check')}ضمن مسارك` : `${ic('plus')}أضف الفئة لمساري`}</button>
    </div>
    <div class="prod-grid">${list.map(prodCard).join('')}</div>`;
}
function toRoute() {
  if (!state.cats.length) return toast('اختر فئة واحدة على الأقل ليظهر المسار', true);
  go('route');
}

// خريطة المتجر: 4 أعمدة × صفّين، والمسار يمر بالممر الأوسط
const MAP = { colX: [100, 240, 380, 520], rowY: [105, 255], corr: 185, low: 345, gaps: [170, 310, 450, 600] };
function routeOf(ids) {
  const stops = ids.map(sec).filter(Boolean).sort((a, b) => a.col - b.col || a.row - b.row);
  if (!stops.length) return { stops, xs: [], d: '', len: 0 };
  const xs = stops.map(s => {
    const twin = stops.filter(t => t.col === s.col).length > 1;
    return MAP.colX[s.col] + (twin ? (s.row ? 24 : -24) : 0);
  });
  const turn = MAP.gaps[Math.max(...stops.map(s => s.col))];
  const pts = [[40, 405], [40, MAP.corr], [turn, MAP.corr], [turn, MAP.low], [560, MAP.low], [560, 372]];
  let len = 0;
  for (let i = 1; i < pts.length; i++) len += Math.abs(pts[i][0] - pts[i - 1][0]) + Math.abs(pts[i][1] - pts[i - 1][1]);
  return { stops, xs, d: 'M' + pts.map(p => p.join(' ')).join(' L'), len };
}
function mapSVG(r, focus) {
  const used = new Set(r.stops.map(s => s.id));
  const F = 'font-family="Tajawal, sans-serif"';
  const blocks = SECTIONS.map(s => {
    const x = MAP.colX[s.col] - 60, y = MAP.rowY[s.row] - 24, on = s.id === focus, u = used.has(s.id);
    return `<rect x="${x}" y="${y}" width="120" height="48" rx="8" fill="${on ? '#7B5CFF' : u ? '#2A2F7A' : '#1C2160'}" stroke="${on ? '#A898FF' : '#3A4294'}"/>
      <text x="${MAP.colX[s.col]}" y="${MAP.rowY[s.row] + 6}" text-anchor="middle" font-size="15" font-weight="700" fill="${on || u ? '#FFFFFF' : '#A6ACDB'}" ${F}>${s.short}</text>`;
  }).join('');
  const markers = r.stops.map((s, i) => `<circle cx="${r.xs[i]}" cy="${MAP.corr}" r="15" fill="#7B5CFF" stroke="#FFFFFF" stroke-width="2.5"/><text x="${r.xs[i]}" y="${MAP.corr + 5}" text-anchor="middle" font-size="14" font-weight="800" fill="#FFFFFF" ${F}>${i + 1}</text>`).join('');
  return `<svg viewBox="0 0 640 440" direction="ltr" role="img" aria-label="خريطة المتجر مع المسار">
    <defs><pattern id="grid" width="22" height="22" patternUnits="userSpaceOnUse"><path d="M22 0H0V22" fill="none" stroke="#1A1F5A" stroke-width="1"/></pattern></defs>
    <rect width="640" height="440" fill="url(#grid)"/>
    ${blocks}
    <rect x="505" y="372" width="110" height="42" rx="8" fill="rgba(47,203,134,.15)" stroke="#2FCB86"/>
    <text x="560" y="398" text-anchor="middle" font-size="15" font-weight="700" fill="#2FCB86" ${F}>الكاشير</text>
    ${r.d ? `<path d="${r.d}" fill="none" stroke="rgba(123,92,255,.35)" stroke-width="14" stroke-linejoin="round"/>
    <path class="dash" d="${r.d}" fill="none" stroke="#B3A6FF" stroke-width="4" stroke-dasharray="12 9" stroke-linejoin="round"/>` : ''}
    ${markers}
    <circle cx="40" cy="405" r="16" fill="rgba(47,203,134,.25)"/><circle cx="40" cy="405" r="9" fill="#2FCB86" stroke="#FFFFFF" stroke-width="2"/>
    <text x="64" y="410" font-size="14" font-weight="700" fill="#FFFFFF" ${F}>موقعك الحالي</text>
  </svg>`;
}
function sRoute() {
  const focus = nav.p.focus, target = nav.p.pid ? byId(nav.p.pid) : null;
  const ids = focus && !state.cats.includes(focus) ? [...state.cats, focus] : state.cats;
  const r = routeOf(ids);
  const meters = Math.round(r.len * 0.16), mins = Math.max(1, Math.round(meters / 22 + r.stops.length * 1.2));
  return `
    <div class="route">
      <section class="panel route-side">
        <h2 class="h2">ترتيب الزيارة</h2>
        ${target ? `<div class="locate">${ic('pin')}<div><b>${target.name}</b><small>${sec(target.section).name} · الممر ${aisleNo(target.section)}</small></div></div>` : ''}
        ${r.stops.length ? r.stops.map((s, i) => `
          <div class="stop ${s.id === focus || (!focus && i === 0) ? 'on' : ''}"><span class="n">${i + 1}</span><div class="ptile xs">${s.icon}</div>${s.name}</div>`).join('')
          : `<p class="sub">لم تختر أي فئة بعد. اختر الفئات التي تحتاجها من «بدء التسوق».</p><button class="btn outline" onclick="go('shop')">اختيار الفئات</button>`}
        ${r.stops.length ? `
          <div class="stats">
            <div class="stat"><small>${ic('route')}المسافة التقديرية</small><b>${meters} م</b></div>
            <div class="stat"><small>${ic('clock')}الوقت المتوقع</small><b>${mins} دقائق</b></div>
          </div>
          <button class="btn primary block" style="margin-top:auto" onclick="startRoute('${r.stops[0].name}')">${ic('nav')}بدء المسار</button>` : ''}
      </section>
      <section class="panel col-gap">
        ${titleBack('أسرع مسار داخل المتجر')}
        <div class="mapbox">${mapSVG(r, focus)}</div>
      </section>
    </div>`;
}

const sideList = hl => {
  const its = state.order.map(id => ({ p: byId(id), q: state.cart[id] })).filter(x => x.p && x.q);
  return `
    <section class="panel side-col">
      <h2 class="h2">قائمتك</h2>
      <div class="mini-list grow">
        ${its.length ? its.map(({ p, q }) => `
          <div class="mini-item ${p.id === hl ? 'on' : ''}">${tile(p, 'sm')}
            <div class="t"><b>${p.name}</b><small>× ${q}</small></div><span class="amt">${fmt(p.price * q)}</span></div>`).join('')
          : '<p class="sub">قائمتك فاضية</p>'}
      </div>
      <div class="total-row"><span>المجموع</span>${money(total())}</div>
    </section>`;
};
function sRecog() {
  const p = byId(nav.p.id);
  return `
    <div class="split">
      <section class="panel hl recog">
        <div class="ok-title">${ic('checkc')}تم التعرّف على المنتج</div>
        ${tile(p, 'lg', false)}
        <div class="rname">${p.name}</div>
        <div class="rbrand">${p.brand} · ${sec(p.section).name}</div>
        ${money(p.price)}
        <div class="actions">
          <button class="btn green" onclick="back()">${ic('check')}أُضيف إلى قائمتك</button>
          <button class="btn outline" onclick="undoAdd(${p.id})">${ic('undo')}تراجع</button>
        </div>
      </section>
      ${sideList(p.id)}
    </div>`;
}
function sConfirm() {
  const p = byId(nav.p.id);
  const opts = [p, ...PRODUCTS.filter(x => x.look === p.look && x.available && x.id !== p.id)].slice(0, 3);
  return `
    <div class="center-head">
      <span class="icon-box">${ic('help')}</span>
      <h1 class="h1">أي منتج أضفت؟</h1>
      <p class="sub">وجدنا أكثر من منتج مطابق. اضغط على المنتج الصحيح.</p>
    </div>
    <div class="choice-grid">
      ${opts.map((o, i) => `
        <div class="panel choice ${i === 0 ? 'hl' : ''}">
          ${tile(o, '')}
          <div class="cname">${o.name}</div>
          ${money(o.price, 'big')}
          <button class="btn ${i === 0 ? 'primary' : 'outline'} block" onclick="pick(${o.id})">اختيار</button>
        </div>`).join('')}
    </div>
    <button class="link" onclick="back();toast('أعِد المنتج إلى الرف أو ابحث عنه بالاسم')">ليس أيًّا منها</button>`;
}
function pick(id) { addItem(id, true); nav = { s: 'recog', p: { id } }; render(true); }

function sList() {
  const its = items(), p = pct();
  const pc = p > 100 ? '#FF7A93' : p >= 80 ? 'var(--warn)' : 'var(--ok)';
  return `
    <div class="split wide">
      <section class="panel col-gap">
        <div class="title-row"><h1 class="h1">قائمة مشترياتي</h1><span class="sub">${its.length} منتجات</span></div>
        ${its.length ? `
          <div class="table">
            <div class="thead"><span>المنتج</span><span class="c">الكمية</span><span class="c">السعر</span><span class="tot">المجموع</span></div>
            ${its.map(({ p, q }) => `
              <div class="trow">
                <div class="prod">${tile(p, 'sm')}<span>${p.name}<small>${p.brand} · ${p.size}</small></span></div>
                <div class="qty"><button class="minus" onclick="changeQty(${p.id},-1)" aria-label="إنقاص">${ic('minus')}</button><b>${q}</b><button class="plus" onclick="changeQty(${p.id},1)" aria-label="زيادة">${ic('plus')}</button></div>
                <span class="c">${fmt(p.price)}</span>
                <span class="tot">${fmt(p.price * q)}</span>
              </div>`).join('')}
          </div>` : `<div class="empty"><span class="icon-box">${ic('cart')}</span><b>قائمتك فاضية</b><span>ضع أول منتج في العربة وسيظهر هنا تلقائيًا</span><button class="btn primary sm" onclick="go('shop')">بدء التسوق</button></div>`}
      </section>
      <section class="panel side-col">
        <h2 class="h2">الملخص</h2>
        <div class="summary-row"><span>عدد المنتجات</span><b>${count()}</b></div>
        <div class="summary-row"><span>المجموع</span></div>
        <div class="ltr-end">${money(total(), 'huge')}</div>
        <div class="summary-row"><span>الميزانية</span><b style="color:${pc}">${Math.round(p)}%</b></div>
        <div class="bar ${p > 100 ? 'over' : p >= 80 ? 'warn' : ''}"><div style="width:${Math.min(p, 100)}%"></div></div>
        <span class="sub" style="font-size:13px">استُخدم ${Math.round(p)}% من ${fmt(state.budget)} ر.س</span>
        <button class="btn primary block" style="margin-top:auto" onclick="go('bill')" ${count() ? '' : 'disabled'}>${ic('receipt')}عرض الفاتورة النهائية</button>
      </section>
    </div>`;
}

function sBudget() {
  const p = pct(), spent = total(), left = state.budget - spent;
  const color = p > 100 ? '#FF5E7E' : p >= 80 ? '#F2A23A' : '#2FCB86';
  const C = 2 * Math.PI * 80;
  const recent = state.order.map(id => ({ p: byId(id), q: state.cart[id] })).filter(x => x.p && x.q).slice(0, 5);
  const alert = p > 100
    ? `<div class="alert over"><div class="at">${ic('alert')}تجاوزت ميزانيتك</div><span>زاد إنفاقك ${fmt(-left)} ر.س عن الميزانية. راجع قائمتك قبل الكاشير.</span></div>`
    : p >= 80
      ? `<div class="alert warn"><div class="at">${ic('alert')}اقتربت من ميزانيتك</div><span>تبقّى ${fmt(left)} ر.س فقط. راجع قائمتك قبل إضافة المزيد.</span></div>`
      : `<div class="alert good"><div class="at">${ic('checkc')}أنت ضمن الميزانية</div><span>تبقّى ${fmt(left)} ر.س. سننبّهك عند وصولك إلى 80%.</span></div>`;
  return `
    <div class="split">
      <section class="panel">
        <h1 class="h2">ميزانيتي</h1>
        <div class="donut-wrap"><div class="donut">
          <svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="80" fill="none" stroke="#2E3684" stroke-width="22"/>
          <circle cx="100" cy="100" r="80" fill="none" stroke="${color}" stroke-width="22" stroke-linecap="round" stroke-dasharray="${C * Math.min(p, 100) / 100} ${C}"/></svg>
          <div class="lbl"><b>${Math.round(p)}%</b><small>مستخدم</small></div>
        </div></div>
        <div class="trio">
          <div><small>المُنفق</small><b>${fmt(spent)}</b></div>
          <div><small>المتبقي</small><b style="color:${color}">${fmt(left)}</b></div>
          <div><small>الميزانية</small><b>${fmt(state.budget)}</b></div>
        </div>
      </section>
      <section class="side-col">
        ${alert}
        <div class="panel grow">
          <p class="sub" style="margin-bottom:12px">أُضيف مؤخرًا</p>
          <div class="mini-list">${recent.length ? recent.map(({ p, q }) => `<div class="mini-item">${tile(p, 'sm')}<div class="t"><b>${p.name}</b><small>× ${q}</small></div><span class="amt">${fmt(p.price * q)}</span></div>`).join('') : '<p class="sub">لا توجد منتجات بعد</p>'}</div>
        </div>
        ${ui.editBudget
          ? `<div class="edit-budget"><input id="budgetInput" type="number" min="1" step="1" inputmode="decimal" value="${state.budget}" aria-label="الميزانية بالريال" onkeydown="if(event.key==='Enter')saveBudget()"><button class="btn primary" onclick="saveBudget()">حفظ</button><button class="btn outline" onclick="ui.editBudget=false;render()">إلغاء</button></div>`
          : `<div class="btn-pair"><button class="btn primary" onclick="editBudget()">${ic('pencil')}تعديل الميزانية</button><button class="btn outline" onclick="go('list')">عرض القائمة</button></div>`}
      </section>
    </div>`;
}

const resultCard = p => `
  <div class="rcard ${p.available ? '' : 'out'}">
    <button class="plink" ${openP(p.id)} aria-label="تفاصيل ${esc(p.name)}">${tile(p, '')}</button>
    <div class="rbody">
      <div class="rtop"><button class="plink rname" ${openP(p.id)}>${p.name}</button>
        ${p.available ? `<span class="avail ok">${ic('checkc')}متوفر</span>` : `<span class="avail no">${ic('xc')}غير متوفر</span>`}</div>
      <div class="rmeta">${p.brand} · ${sec(p.section).name} · الممر ${aisleNo(p.section)}</div>
      <div class="rbottom">
        ${money(p.price, 'big')}
        ${p.available
          ? `<span class="btn-row"><button class="btn outline sm" onclick="go('route',{focus:'${p.section}',pid:${p.id}})">${ic('pin')}عرض على الخريطة</button><button class="add-btn" onclick="putInCart(${p.id})" aria-label="ضعه في العربة">${ic('plus')}</button></span>`
          : `<button class="btn orange sm" onclick="go('alt',{id:${p.id}})">${ic('swap')}عرض البدائل</button>`}
      </div>
    </div>
  </div>`;
function sSearch() {
  return `
    <div class="searchbar big">${ic('search')}<input id="q" type="search" placeholder="اكتب اسم المنتج… جبن، حليب، رز" value="${esc(ui.q)}" oninput="ui.q=this.value;drawResults()" aria-label="البحث عن منتج">
      <button class="scan-btn" onclick="scanBarcode()" aria-label="مسح الباركود" title="مسح الباركود">${ic('barcode')}</button></div>
    <div id="results" class="col-gap"></div>`;
}
function drawResults() {
  const box = document.getElementById('results');
  if (!box) return;
  const q = ui.q.trim();
  const res = q ? PRODUCTS.filter(p => matches(p, q)) : PRODUCTS;
  box.innerHTML = `<div class="res-meta"><span>${q ? 'ابحث بالاسم أو الباركود' : 'كل منتجات المتجر — اكتب للبحث أو امسح الباركود'}</span><b>${res.length} نتائج</b></div>` +
    (res.length ? `<div class="result-grid">${res.map(resultCard).join('')}</div>` : `<div class="empty"><span class="icon-box">${ic('search')}</span>ما لقينا نتائج لـ «${esc(q)}»</div>`);
}

function sAlt() {
  const p = byId(nav.p.id), alts = alternativesFor(p);
  return `
    ${titleBack('البدائل المقترحة')}
    <div class="oos-banner">${tile(p, 'sm', true)}<div><b>${ic('xc')}${p.name} غير متوفر حاليًا</b><span class="sub">إليك منتجات مشابهة متوفرة في المتجر</span></div></div>
    <div class="choice-grid">
      ${alts.map((a, i) => `
        <div class="panel choice ${i === 0 ? 'hl' : ''}">
          ${tile(a, '')}
          <div class="cname">${a.name}</div>
          <div class="cnote">${a.note || `${a.brand} · ${sec(a.section).name}`}</div>
          ${money(a.price, 'big')}
          <button class="btn ${i === 0 ? 'primary' : 'outline'} block" onclick="putInCart(${a.id})">${ic('plus')}أضف للقائمة</button>
        </div>`).join('') || '<p class="sub">لا توجد بدائل حاليًا</p>'}
    </div>
    <button class="link" onclick="back()">العودة للبحث</button>`;
}

function sProduct() {
  const p = byId(nav.p.id), s = sec(p.section);
  return `
    ${titleBack('تفاصيل المنتج')}
    <div class="pdetail">
      <section class="panel imgside">${tile(p, 'lg')}</section>
      <section class="panel pinfo">
        ${p.available ? `<span class="avail ok">${ic('checkc')}متوفر</span>` : `<span class="avail no">${ic('xc')}غير متوفر حاليًا</span>`}
        <div><div class="brand-lbl">${p.brand}</div><h2 class="h1">${p.name}</h2></div>
        <p class="sub">${p.desc}</p>
        <div>${money(p.price, 'big')} <span class="sub">${p.per ? `لكل ${p.per}` : `للعبوة · ${p.size}`}</span></div>
        <div class="meta-grid">
          <div><small>الحجم / الوزن</small><b>${p.size}</b></div>
          <div><small>العلامة التجارية</small><b>${p.brand}</b></div>
          <div><small>بلد المنشأ</small><b>${p.origin}</b></div>
          <div><small>الكمية في عربتك</small><b>${state.cart[p.id] || 0}</b></div>
        </div>
        <button class="locate" onclick="go('route',{focus:'${p.section}',pid:${p.id}})">${ic('pin')}<div><b>${s.name} · الممر ${aisleNo(p.section)}</b><small>اعرض مكانه على الخريطة</small></div></button>
        ${p.available
          ? `<button class="btn primary block" onclick="putInCart(${p.id})">${ic('cart')}ضعه في العربة</button>`
          : `<button class="btn orange block" onclick="go('alt',{id:${p.id}})">${ic('swap')}عرض البدائل</button>`}
      </section>
    </div>`;
}

function sBill() {
  const its = items(), left = state.budget - total();
  return `
    <div class="split wide">
      <section class="panel col-gap" style="gap:6px">
        <h1 class="h1">الفاتورة النهائية</h1>
        <p class="sub">راجع مشترياتك قبل إتمام الدفع</p>
        ${its.length ? `<div class="bill-table">
          <div class="br bh"><span>المنتج</span><span class="c">الكمية</span><span class="t" style="font-weight:500">المجموع</span></div>
          ${its.map(({ p, q }) => `<div class="br"><span>${p.name} <span class="sub" style="font-size:13px">· ${p.brand}</span></span><span class="c">${q}</span><span class="t">${fmt(p.price * q)}</span></div>`).join('')}
        </div>` : `<div class="empty"><span class="icon-box">${ic('receipt')}</span>لا توجد منتجات في العربة بعد<button class="btn primary sm" onclick="go('shop')">بدء التسوق</button></div>`}
      </section>
      <section class="panel bill-side">
        <div class="summary-row"><span>عدد المنتجات</span><b>${count()}</b></div>
        <div class="summary-row"><span>المتبقي من الميزانية</span><b style="color:${left < 0 ? '#FF7A93' : 'var(--ok)'}">${fmt(left)}</b></div>
        <hr>
        <span class="sub">الإجمالي (شامل الضريبة)</span>
        <div class="ltr-end">${money(total(), 'giant')}</div>
        <button class="btn primary block" style="margin-top:auto" onclick="pay()" ${count() ? '' : 'disabled'}>${ic('card')}تأكيد الدفع (تجريبي)</button>
        <p class="note-sm">نموذج أولي: الدفع محاكاة فقط</p>
      </section>
    </div>`;
}

function sDone() {
  const l = state.last || { total: 0, count: 0, mins: 0 };
  return `
    <div class="done">
      <div class="badge"><div>${ic('check')}</div></div>
      <h1 class="h1" style="font-size:40px">تم التسوق بنجاح!</h1>
      <p class="sub">شكرًا لتسوقك مع SmartCart</p>
      <div class="done-stats">
        <div><small>المبلغ المدفوع</small>${money(l.total, 'big')}</div>
        <div><small>المنتجات</small><b>${l.count}</b></div>
        <div><small>المدة</small><b>${l.mins} دقيقة</b></div>
      </div>
      <p class="trial">دفع تجريبي — للعرض فقط</p>
      <button class="btn primary" style="min-width:min(280px,100%)" onclick="newSession()">جلسة جديدة</button>
    </div>`;
}

// ===== العرض =====
const SCREENS = { login: sLogin, home: sHome, shop: sShop, route: sRoute, recog: sRecog, confirm: sConfirm, list: sList, budget: sBudget, search: sSearch, alt: sAlt, product: sProduct, bill: sBill, done: sDone };
function render(top) {
  if (!state.user) nav = { s: 'login', p: {} };
  if (['recog', 'confirm', 'alt', 'product'].includes(nav.s) && !byId(nav.p.id)) nav = { s: 'home', p: {} };
  $app.innerHTML = statusbar() + `<main class="screen">${(SCREENS[nav.s] || sHome)()}</main>`;
  if (nav.s === 'shop') drawShop();
  if (nav.s === 'search') drawResults();
  if (top) window.scrollTo(0, 0);
}
setInterval(() => { const c = document.getElementById('clock'); if (c) c.textContent = clock(); }, 20000);
render();
