/* ═══════════════════════════════════════════════════
   LIFE JOURNAL — app.js  (النسخة النهائية)
   ✦ يحسب العمر تلقائياً ويعرض مرحلة واحدة فقط
   ✦ تحديث تلقائي فوري عند تغيير تاريخ الميلاد
   ✦ يُخفي أزرار المراحل الأخرى من الـ topbar
═══════════════════════════════════════════════════ */

/* ══════════════════════════════════════════
   ★ إعدادات الشخص — غيّر هنا فقط ★
══════════════════════════════════════════ */
window.LJ_PERSON = {
  nameAr:     'محمد عبدالله',
  nameEn:     'Mohammed Abdullah',
  birthYear:  2025,
  birthMonth: 3,
  birthDay:   15
};

/* ══ حساب العمر ══ */
function calcAge() {
  var p = window.LJ_PERSON;
  var t = new Date();
  var age = t.getFullYear() - p.birthYear;
  var dm = (t.getMonth() + 1) - p.birthMonth;
  if (dm < 0 || (dm === 0 && t.getDate() < p.birthDay)) age--;
  return age;
}

/* ══ تحديد المرحلة ══ */
function getStageFromAge(age) {
  if (age < 13) return 'childhood';
  if (age < 20) return 'adolescence';
  return 'adulthood';
}

/* ══ بيانات المراحل ══ */
var STAGE_INFO = {
  childhood:   { ar:'الطفولة',  en:'Childhood',   emoji:'🌱' },
  adolescence: { ar:'المراهقة', en:'Adolescence', emoji:'🌿' },
  adulthood:   { ar:'الشباب',   en:'Adulthood',   emoji:'🌳' }
};

/* ══ روابط صفحات كل مرحلة ══ */
var STAGE_PAGES = {
  childhood: {
    profile:'profile.html', height:'height_childhood.html',
    certs:'certs_childhood.html', edu:'edu_childhood.html', timeline:'timeline_childhood.html'
  },
  adolescence: {
    profile:'profile_teen.html', height:'height_adolescence.html',
    certs:'certs_adolescence.html', edu:'edu_adolescence.html', timeline:'timeline_adolescence.html'
  },
  adulthood: {
    profile:'profile_adult.html', height:'height_adulthood.html',
    certs:'certs_adulthood.html', edu:'edu_adulthood.html', timeline:'timeline_adulthood.html'
  }
};

/* ══ حساب وحفظ المرحلة ══ */
function getCurrentStage() {
  var age   = calcAge();
  var stage = getStageFromAge(age);
  localStorage.setItem('lj_stage', stage);
  localStorage.setItem('lj_age', age);
  return stage;
}

/* ══════════════════════════════════════════════════
   AUTO-DETECT CHANGE
   كل ما يُشغَّل app.js (عند تحميل أي صفحة)،
   بيحسب العمر الحالي ويقارنه بالمرحلة المحفوظة.
   لو اختلفوا → يوجّه فوراً للصفحة الصحيحة.
══════════════════════════════════════════════════ */
(function autoDetectStageChange() {
  var currentAge   = calcAge();
  var currentStage = getStageFromAge(currentAge);

  /* المرحلة المحفوظة من آخر زيارة */
  var savedStage = localStorage.getItem('lj_stage') || '';

  /* لو المرحلة اتغيرت → وجّه للصفحة الصحيحة فوراً */
  if (savedStage && savedStage !== currentStage) {
    localStorage.setItem('lj_stage', currentStage);
    localStorage.setItem('lj_age', currentAge);
    var newPage = STAGE_PAGES[currentStage].profile;
    /* تحقق إننا مش بالفعل على الصفحة الصح */
    var currentFile = window.location.pathname.split('/').pop();
    if (currentFile !== newPage) {
      window.location.replace(newPage);
      return; /* وقّف بقية الكود */
    }
  }

  /* حفّظ المرحلة الحالية */
  localStorage.setItem('lj_stage', currentStage);
  localStorage.setItem('lj_age', currentAge);
})();

/* ══════════════════════════════════════════════════
   fixTopbar — يعرض مرحلة واحدة فقط في الـ topbar
══════════════════════════════════════════════════ */
function fixTopbar(stage) {
  var pages = STAGE_PAGES[stage];

  document.querySelectorAll('.tb-stage-pill').forEach(function(pill) {
    var href = pill.getAttribute('href') || '';

    var isThisStage =
      (stage === 'childhood'   && href.includes('profile.html') && !href.includes('teen') && !href.includes('adult')) ||
      (stage === 'adolescence' && (href.includes('profile_teen') || href.includes('teen'))) ||
      (stage === 'adulthood'   && (href.includes('profile_adult') || href.includes('adult')));

    if (isThisStage) {
      pill.style.display = '';
      pill.classList.add('active');
      pill.href = pages.profile;
    } else {
      pill.style.display = 'none';
      pill.classList.remove('active');
    }
  });
}

/* ══════════════════════════════════════════════════
   fixAllLinks — يوجّه كل الروابط للمرحلة الصحيحة
══════════════════════════════════════════════════ */
function fixAllLinks(stage) {
  var pages = STAGE_PAGES[stage];
  if (!pages) return;

  document.querySelectorAll('.page-tab').forEach(function(tab) {
    var href = tab.getAttribute('href') || '';
    var id   = tab.id || '';
    var dp   = (tab.dataset && tab.dataset.page) ? tab.dataset.page : '';

    if      (dp === 'home')                                  tab.href = pages.profile;
    else if (id === 'tab-height' || href.includes('height')) tab.href = pages.height;
    else if (id === 'tab-certs'  || href.includes('certs'))  tab.href = pages.certs;
    else if (id === 'tab-edu'    || href.includes('edu'))    tab.href = pages.edu;
    else if (href.includes('timeline'))                      tab.href = pages.timeline;
    else if (href.includes('profile'))                       tab.href = pages.profile;
  });

  document.querySelectorAll('.mobile-nav-link').forEach(function(link) {
    var href = link.getAttribute('href') || '';
    var id   = link.id || '';
    var dp   = (link.dataset && link.dataset.page) ? link.dataset.page : '';

    if      (dp === 'home')                                   link.href = pages.profile;
    else if (id === 'mob-height' || href.includes('height'))  link.href = pages.height;
    else if (id === 'mob-certs'  || href.includes('certs'))   link.href = pages.certs;
    else if (id === 'mob-edu'    || href.includes('edu'))     link.href = pages.edu;
    else if (href.includes('timeline'))                       link.href = pages.timeline;
  });
}

/* ══════════════════════════════════════════════════
   fixMobileStageLinks — يخفي مراحل الموبايل الزائدة
══════════════════════════════════════════════════ */
function fixMobileStageLinks(stage) {
  var stageHrefs = {
    childhood:'profile.html', adolescence:'profile_teen.html', adulthood:'profile_adult.html'
  };
  var current = stageHrefs[stage];

  document.querySelectorAll('.mobile-menu-panel .mobile-nav-link').forEach(function(link) {
    var href = link.getAttribute('href') || '';
    var isStageLink = (href === 'profile.html' || href === 'profile_teen.html' || href === 'profile_adult.html');
    if (!isStageLink) return;
    link.style.display = (href === current) ? '' : 'none';
  });
}

/* ══ الثيمات ══ */
var THEMES = [
  {id:'orange', name:'برتقالي',   nameEn:'Orange',     sc:'#E8630A',sa:'#FFD166',sbg:'#FFF5EE',scd:'#B34E08',rgb:'232,99,10'},
  {id:'indigo', name:'أزرق ملكي',nameEn:'Royal Blue', sc:'#4338CA',sa:'#A5B4FC',sbg:'#EEF2FF',scd:'#3730A3',rgb:'67,56,202'},
  {id:'violet', name:'بنفسجي',   nameEn:'Violet',     sc:'#7C3AED',sa:'#C4B5FD',sbg:'#F5F3FF',scd:'#5B21B6',rgb:'124,58,237'},
  {id:'blue',   name:'أزرق',     nameEn:'Blue',       sc:'#2563EB',sa:'#93C5FD',sbg:'#EEF7FF',scd:'#1D4ED8',rgb:'37,99,235'},
  {id:'sky',    name:'سماوي',    nameEn:'Sky',        sc:'#0284C7',sa:'#7DD3FC',sbg:'#F0F9FF',scd:'#0369A1',rgb:'2,132,199'},
  {id:'teal',   name:'فيروزي',   nameEn:'Teal',       sc:'#0891B2',sa:'#67E8F9',sbg:'#ECFEFF',scd:'#0E7490',rgb:'8,145,178'},
  {id:'green',  name:'أخضر',     nameEn:'Green',      sc:'#16A34A',sa:'#86EFAC',sbg:'#F0FDF4',scd:'#15803D',rgb:'22,163,74'},
  {id:'emerald',name:'زمردي',    nameEn:'Emerald',    sc:'#059669',sa:'#6EE7B7',sbg:'#ECFDF5',scd:'#047857',rgb:'5,150,105'},
  {id:'pink',   name:'وردي',     nameEn:'Pink',       sc:'#DB2777',sa:'#F9A8D4',sbg:'#FFF0F7',scd:'#BE185D',rgb:'219,39,119'},
  {id:'rose',   name:'قرمزي',    nameEn:'Rose',       sc:'#E11D48',sa:'#FDA4AF',sbg:'#FFF1F2',scd:'#BE123C',rgb:'225,29,72'},
  {id:'amber',  name:'عنبري',    nameEn:'Amber',      sc:'#D97706',sa:'#FCD34D',sbg:'#FFFBEB',scd:'#B45309',rgb:'217,119,6'}
];

var _theme = localStorage.getItem('lj_theme') || 'orange';
var _lang  = localStorage.getItem('lj_lang')  || 'ar';

/* ══ تطبيق اللون ══ */
function applyTheme(id) {
  var th = THEMES[0];
  for (var i = 0; i < THEMES.length; i++) { if (THEMES[i].id === id) { th = THEMES[i]; break; } }
  _theme = th.id;
  localStorage.setItem('lj_theme', id);
  var r = document.documentElement;
  r.style.setProperty('--sc', th.sc);
  r.style.setProperty('--sa', th.sa);
  r.style.setProperty('--sbg', th.sbg);
  r.style.setProperty('--scd', th.scd);
  r.style.setProperty('--sc-rgb', th.rgb);
  var s = document.getElementById('__thcss');
  if (!s) { s = document.createElement('style'); s.id = '__thcss'; document.head.appendChild(s); }
  s.textContent = [
    '.tb-logo-ring{background:linear-gradient(135deg,'+th.sc+','+th.sa+')!important;box-shadow:0 4px 14px '+th.sc+'55!important}',
    '.tb-stage-pill.active{background:'+th.sc+'!important;border-color:'+th.sc+'!important;box-shadow:0 4px 16px '+th.sc+'4D!important;color:#fff!important}',
    '.page-tab.active{color:'+th.sc+'!important;border-bottom-color:'+th.sc+'!important}',
    '.color-icon-btn{background:'+th.sbg+'!important;border-color:'+th.sc+'44!important;color:'+th.sc+'!important}',
    '.color-icon-btn:hover{background:'+th.sc+'!important;color:#fff!important}',
    '.cib-dot{background:'+th.sc+'!important}',
    '.pn{color:'+th.sc+'!important}',
    '.pf-badge{background:'+th.sc+'18!important;color:'+th.sc+'!important}',
    '.pf-stage-lbl{background:'+th.sc+'!important}',
    '.pstat:hover{border-color:'+th.sc+'!important;background:'+th.sbg+'!important}',
    '.qi-icon{background:'+th.sc+'18!important}',
    '.qi-icon i,.bdi-ic i,.fp-meta i,.sw-title i,.chart-title i{color:'+th.sc+'!important}',
    '.bdi-ic{background:'+th.sc+'18!important}',
    '.mobile-nav-link.active{background:'+th.sc+'!important}',
    '.en-tab.active{background:'+th.sc+'!important;box-shadow:0 4px 14px '+th.sc+'44!important}',
    '.gc-dot{background:'+th.sc+'!important;box-shadow:0 0 0 3px '+th.sc+'22!important}',
    '.grade-card.open{border-color:'+th.sc+'!important}',
    '.gc-header:hover,.grade-card.open .gc-header{background:'+th.sbg+'!important}',
    '::-webkit-scrollbar-thumb{background:'+th.sc+'!important}',
    '.today-badge{background:'+th.sc+'18!important;color:'+th.sc+'!important}',
    '.cbadge{background:'+th.sc+'18!important;color:'+th.sc+'!important}'
  ].join('\n');
  document.querySelectorAll('.tm-card').forEach(function(c) {
    c.classList.toggle('active', c.dataset.tid === id);
  });
}

/* ══ تطبيق اللغة ══ */
function applyLang(lang) {
  _lang = lang;
  localStorage.setItem('lj_lang', lang);
  var isEn = lang === 'en';
  document.documentElement.lang = isEn ? 'en' : 'ar';
  document.documentElement.dir  = isEn ? 'ltr' : 'rtl';
  document.body.classList.toggle('ltr', isEn);
  var lbl = document.getElementById('langLabel');
  if (lbl) lbl.textContent = isEn ? 'ع' : 'EN';
  document.querySelectorAll('[data-ar]').forEach(function(el) {
    el.textContent = isEn ? (el.dataset.en || el.dataset.ar) : el.dataset.ar;
  });
  var bs = document.getElementById('bsLink');
  if (bs) bs.href = isEn
    ? 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css'
    : 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.rtl.min.css';
}
function toggleLang() { applyLang(_lang === 'ar' ? 'en' : 'ar'); }

/* ══ مودال الألوان ══ */
function openThemeModal() {
  var ov = document.getElementById('__thmov');
  if (!ov) {
    ov = document.createElement('div'); ov.id = '__thmov'; ov.className = 'theme-modal-overlay';
    ov.onclick = function(e) { if (e.target === ov) closeThemeModal(); };
    document.body.appendChild(ov);
  }
  var isEn = _lang === 'en';
  var cards = THEMES.map(function(th) {
    return '<div class="tm-card'+(th.id===_theme?' active':'')+'" data-tid="'+th.id+'" style="--card-c:'+th.sc+'" onclick="applyTheme(\''+th.id+'\');closeThemeModal()">'
      +'<div class="tm-check"><i class="bi bi-check2"></i></div>'
      +'<div class="tm-preview"><div class="tm-prev-cover" style="background:linear-gradient(135deg,'+th.sc+','+th.sa+')"></div>'
      +'<div class="tm-prev-body"><div class="tm-prev-av" style="background:'+th.sc+'"></div>'
      +'<div class="tm-prev-bar"><div class="tm-prev-line" style="width:65%"></div><div class="tm-prev-line" style="width:45%"></div></div>'
      +'<div class="tm-prev-btns"><div class="tm-prev-btn" style="background:'+th.sc+'"></div><div class="tm-prev-btn" style="background:#E5E7EB"></div></div>'
      +'</div></div><div class="tm-name">'+(isEn?th.nameEn:th.name)+'</div></div>';
  }).join('');
  ov.innerHTML = '<div class="theme-modal">'
    +'<div class="tm-header"><div><div class="tm-title">'+(isEn?'Page Color':'لون الصفحة')+'</div>'
    +'<div style="font-size:12px;color:var(--muted);margin-top:3px">'+(isEn?'Choose your preferred color':'اختر اللون المناسب لك')+'</div></div>'
    +'<button class="tm-close" onclick="closeThemeModal()"><i class="bi bi-x-lg"></i></button></div>'
    +'<div class="tm-grid">'+cards+'</div></div>';
  ov.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeThemeModal() {
  var o = document.getElementById('__thmov');
  if (o) { o.classList.remove('open'); document.body.style.overflow = ''; }
}

/* ══ القائمة الجانبية ══ */
function openMobileMenu()  { var o = document.getElementById('mobileMenuOverlay'); if (o) { o.classList.add('open');    document.body.style.overflow = 'hidden'; } }
function closeMobileMenu() { var o = document.getElementById('mobileMenuOverlay'); if (o) { o.classList.remove('open'); document.body.style.overflow = '';       } }

/* ══════════════════════════════════════════════════
   التهيئة الرئيسية
══════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function() {
  var stage = getCurrentStage();
  applyTheme(_theme);
  applyLang(_lang);
  fixTopbar(stage);
  fixAllLinks(stage);
  fixMobileStageLinks(stage);
  var ov = document.getElementById('mobileMenuOverlay');
  if (ov) ov.addEventListener('click', function(e) { if (e.target === ov) closeMobileMenu(); });
});
