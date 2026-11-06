/**
 * ============================================================================
 * Final Assembly - Safety Survey | Main Application Logic (app.js)
 * ============================================================================
 * Google Sheets ID: 1bM68aArN9WAbwrvFrKC1hpAy335SSgzZPZBtDp-Znpc
 * Sheet 1: "Question"
 * Sheet 2: "Survey list"
 * ============================================================================
 */

const SPREADSHEET_ID = '1bM68aArN9WAbwrvFrKC1hpAy335SSgzZPZBtDp-Znpc';
const SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit?gid=0#gid=0`;

// ลิงก์ Apps Script Web App URL ที่ฝังไว้ในโค้ดโดยตรง
const DEFAULT_GAS_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbw1BNxTbZwXfMHiNLgstqi-53N_evg_Ow7WO_WF5jAVyJ1b-jUiNwLA1zMfi3fqFhU7/exec';

const STORAGE_KEYS = {
  LANG: 'fa_safety_lang',
  GAS_URL: 'fa_safety_gas_url',
  QUESTIONS: 'fa_safety_questions_v3',
  SURVEYS: 'fa_safety_surveys_v3'
};

const PRODUCTION_LINES = [
  'FA-Line 1',
  'FA-Line 2',
  'FA-Line 3',
  'FA-Line 4',
  'Sub-Assy Line',
  'Packing & QA'
];

const LINE_COLORS = {
  'FA-Line 1': '#0d9488',
  'FA-Line 2': '#2563eb',
  'FA-Line 3': '#7c3aed',
  'FA-Line 4': '#ea580c',
  'Sub-Assy Line': '#db2777',
  'Packing & QA': '#059669'
};

// State ของแอปพลิเคชัน
const state = {
  lang: localStorage.getItem(STORAGE_KEYS.LANG) || 'th',
  gasUrl: localStorage.getItem(STORAGE_KEYS.GAS_URL) || DEFAULT_GAS_WEBAPP_URL,
  activeTab: 'dashboard',
  questions: [],
  surveys: [],
  currentScores: {},
  editingQuestionId: null,
  filters: {
    line: 'ALL',
    dateFrom: '',
    dateTo: '',
    search: ''
  },
  empChartLineFilter: 'ALL',
  isSyncing: false,
  isConnectedToCloud: false
};

// Chart.js Instances
let dailyChartInstance = null;
let lineChartInstance = null;
let empChartInstance = null;

/**
 * เริ่มต้นการทำงานเมื่อเปิดหน้าเว็บ
 */
document.addEventListener('DOMContentLoaded', async () => {
  // ล้างแคชข้อมูลจำลองเดิมออกทั้งหมด และบังคับใช้ DEFAULT_GAS_WEBAPP_URL เสมอหากยังไม่มีลิงก์ที่ถูกต้อง
  localStorage.removeItem('fa_safety_surveys_v1');
  localStorage.removeItem('fa_safety_surveys_v2');
  if (!state.gasUrl || !state.gasUrl.startsWith('https://script.google.com/')) {
    state.gasUrl = DEFAULT_GAS_WEBAPP_URL;
    localStorage.setItem(STORAGE_KEYS.GAS_URL, DEFAULT_GAS_WEBAPP_URL);
  }

  loadLocalData();
  initFormDefaults();
  applyTranslations();
  renderAll();

  // ซิงค์ข้อมูลจริงจาก Google Sheets อัตโนมัติเมื่อเปิดหน้าเว็บ
  await syncFromGoogleSheets(true);
});

/**
 * โหลดข้อมูลจาก LocalStorage (เฉพาะข้อมูลจริงจากชีต ไม่ใช้ข้อมูลจำลอง)
 */
function loadLocalData() {
  try {
    const savedQ = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    if (savedQ) {
      const parsed = JSON.parse(savedQ);
      state.questions = Array.isArray(parsed) && parsed.length > 0 ? parsed : [...DEFAULT_QUESTIONS];
    } else {
      state.questions = [...DEFAULT_QUESTIONS];
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(state.questions));
    }

    const savedS = localStorage.getItem(STORAGE_KEYS.SURVEYS);
    if (savedS) {
      const parsedS = JSON.parse(savedS);
      state.surveys = Array.isArray(parsedS)
        ? parsedS.filter(s => !String(s.survey_id || '').startsWith('SV-DEMO-'))
        : [];
    } else {
      state.surveys = [];
      localStorage.setItem(STORAGE_KEYS.SURVEYS, JSON.stringify(state.surveys));
    }
  } catch (e) {
    console.warn('Error loading localStorage data:', e);
    state.questions = [...DEFAULT_QUESTIONS];
    state.surveys = [];
  }
}

/**
 * บันทึกข้อมูลลง LocalStorage
 */
function saveLocalData() {
  localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(state.questions));
  localStorage.setItem(STORAGE_KEYS.SURVEYS, JSON.stringify(state.surveys));
}

/**
 * ตั้งค่าวันที่ปัจจุบันและตัวเลือกไลน์ผลิตในฟอร์ม
 */
function initFormDefaults() {
  const todayStr = new Date().toISOString().slice(0, 10);
  const dateInput = document.getElementById('survey-date');
  if (dateInput) dateInput.value = todayStr;

  const gasInput = document.getElementById('input-gas-url');
  if (gasInput) gasInput.value = state.gasUrl;

  populateLineOptions();
}

/**
 * สร้างตัวเลือกไลน์การผลิตทั้งในตัวกรองและในฟอร์ม
 */
function populateLineOptions() {
  const allLines = new Set(PRODUCTION_LINES);
  state.surveys.forEach(s => {
    if (s.line) allLines.add(s.line);
  });
  const lineArray = Array.from(allLines);

  // 1. Filter Dropdown บน Dashboard
  const filterSelect = document.getElementById('filter-line');
  if (filterSelect) {
    const currentVal = state.filters.line;
    const t = I18N[state.lang] || I18N.th;
    filterSelect.innerHTML = `<option value="ALL">${t.filter_all_lines}</option>` +
      lineArray.map(l => `<option value="${escapeHtml(l)}">${escapeHtml(l)}</option>`).join('');
    filterSelect.value = lineArray.includes(currentVal) ? currentVal : 'ALL';
  }

  // 2. Line Datalist / Select ในฟอร์มทำแบบสำรวจ
  const formSelect = document.getElementById('survey-line');
  if (formSelect) {
    const currentFormVal = formSelect.value || lineArray[0];
    formSelect.innerHTML = lineArray.map(l => `<option value="${escapeHtml(l)}">${escapeHtml(l)}</option>`).join('');
    formSelect.value = lineArray.includes(currentFormVal) ? currentFormVal : lineArray[0];
  }

  // 3. ปุ่มกรองไลน์ในกราฟคะแนนรายบุคคล
  renderEmpChartLinePills(lineArray);
}

/**
 * สลับภาษา (ไทย / จีน / พม่า)
 */
function setLanguage(lang) {
  if (!I18N[lang]) return;
  state.lang = lang;
  localStorage.setItem(STORAGE_KEYS.LANG, lang);
  document.body.setAttribute('data-lang', lang);

  applyTranslations();
  renderAll();
}

/**
 * อัปเดตข้อความ UI ทั้งหมดตามภาษาที่เลือก
 */
function applyTranslations() {
  const t = I18N[state.lang] || I18N.th;
  document.body.setAttribute('data-lang', state.lang);

  // อัปเดตปุ่มเลือกภาษา
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === state.lang);
  });

  // อัปเดต element ที่มี data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) {
      el.textContent = t[key];
    }
  });

  // อัปเดต placeholder ที่มี data-i18n-placeholder
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (t[key]) {
      el.setAttribute('placeholder', t[key]);
    }
  });

  updateConnectionBadge();
  populateLineOptions();
}

/**
 * สลับแท็บหน้าจอ (Dashboard / Survey Form / Question Manager / Survey List)
 */
function switchTab(tabId) {
  state.activeTab = tabId;

  document.querySelectorAll('.tab-section').forEach(sec => {
    sec.classList.toggle('hidden', sec.id !== `tab-${tabId}`);
  });

  document.querySelectorAll('.nav-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });

  document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });

  if (tabId === 'dashboard') {
    renderDashboard();
  } else if (tabId === 'survey') {
    renderSurveyFormQuestions();
  } else if (tabId === 'questions') {
    renderQuestionsManager();
  } else if (tabId === 'records') {
    renderRecordsTable();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * เรนเดอร์ทุกส่วนของแอป
 */
function renderAll() {
  renderDashboard();
  renderSurveyFormQuestions();
  renderQuestionsManager();
  renderRecordsTable();
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

/**
 * ============================================================================
 * GOOGLE SHEETS SYNC (google.script.run + Apps Script Web App + JSONP gviz)
 * ============================================================================
 */
async function syncFromGoogleSheets(silent = false) {
  state.isSyncing = true;
  updateConnectionBadge();

  let syncedQuestions = null;
  let syncedSurveys = null;

  // 0. ถ้ารันอยู่ในสภาพแวดล้อม Google Apps Script HtmlService โดยตรง ใช้ google.script.run ได้ทันที
  if (typeof google !== 'undefined' && google.script && google.script.run) {
    try {
      const data = await new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler(resolve)
          .withFailureHandler(reject)
          .processActionPayload({ action: 'getAll' });
      });
      if (data && data.status === 'ok') {
        if (Array.isArray(data.questions) && data.questions.length > 0) syncedQuestions = data.questions;
        if (Array.isArray(data.surveys)) syncedSurveys = data.surveys;
        state.isConnectedToCloud = true;
      }
    } catch (err) {
      console.warn('google.script.run warning:', err);
    }
  }

  // 1. หากผู้ใช้ตั้งค่า Apps Script Web App URL ไว้ ให้ดึงผ่าน Apps Script (รองรับทั้ง JSONP และ fetch)
  if (!syncedQuestions && state.gasUrl && state.gasUrl.startsWith('https://script.google.com/')) {
    try {
      const data = await new Promise((resolve, reject) => {
        const cbName = `__gas_sync_cb_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
        const script = document.createElement('script');
        const timer = setTimeout(() => {
          cleanup();
          reject(new Error('GAS sync JSONP timeout'));
        }, 8000);

        function cleanup() {
          clearTimeout(timer);
          delete window[cbName];
          if (script.parentNode) script.parentNode.removeChild(script);
        }

        window[cbName] = (res) => {
          cleanup();
          resolve(res);
        };

        script.onerror = () => {
          cleanup();
          reject(new Error('GAS sync JSONP error'));
        };

        const sep = state.gasUrl.includes('?') ? '&' : '?';
        script.src = `${state.gasUrl}${sep}action=getAll&callback=${cbName}&t=${Date.now()}`;
        document.head.appendChild(script);
      });

      if (data && data.status === 'ok') {
        if (Array.isArray(data.questions) && data.questions.length > 0) {
          syncedQuestions = data.questions;
        }
        if (Array.isArray(data.surveys)) {
          syncedSurveys = data.surveys;
        }
        state.isConnectedToCloud = true;
      }
    } catch (err) {
      try {
        const res = await fetch(`${state.gasUrl}?action=getAll&t=${Date.now()}`, {
          method: 'GET',
          redirect: 'follow'
        });
        const data = await res.json();
        if (data && data.status === 'ok') {
          if (Array.isArray(data.questions) && data.questions.length > 0) {
            syncedQuestions = data.questions;
          }
          if (Array.isArray(data.surveys)) {
            syncedSurveys = data.surveys;
          }
          state.isConnectedToCloud = true;
        }
      } catch (err2) {
        console.warn('GAS Web App fetch warning:', err2);
      }
    }
  }

  // 2. หากยังไม่ได้ตั้งค่า GAS URL หรือดึงไม่สำเร็จ ให้ดึงข้อมูลโดยตรงจากชีต "Question" และ "Survey list" (รองรับทั้ง fetch และ JSONP สำหรับ file://)
  if (!syncedQuestions) {
    try {
      const qFromSheet = await fetchSheetViaGviz('Question');
      if (qFromSheet && qFromSheet.length > 0) {
        syncedQuestions = qFromSheet;
        state.isConnectedToCloud = true;
      }
    } catch (e) {
      // ชีตอาจยังไม่ได้ตั้งค่าสาธารณะ หรือยังไม่มีข้อมูล
    }
  }

  if (syncedSurveys === null) {
    try {
      const sFromSheet = await fetchSheetViaGviz('Survey list');
      if (Array.isArray(sFromSheet)) {
        syncedSurveys = sFromSheet;
        state.isConnectedToCloud = true;
      }
    } catch (e) {
      // ชีตอาจยังไม่ได้ตั้งค่าสาธารณะ หรือยังไม่มีข้อมูล
    }
  }

  if (syncedQuestions && syncedQuestions.length > 0) {
    state.questions = syncedQuestions;
  }
  if (Array.isArray(syncedSurveys)) {
    state.surveys = syncedSurveys;
  }

  saveLocalData();
  state.isSyncing = false;
  updateConnectionBadge();
  populateLineOptions();
  renderAll();

  if (!silent) {
    showToast(
      state.isConnectedToCloud
        ? (I18N[state.lang].status_connected)
        : (I18N[state.lang].status_demo),
      'success'
    );
  }
}

/**
 * อ่านข้อมูลโดยตรงจาก Google Sheets ผ่าน gviz endpoint (รองรับ JSONP script tag จึงทำงานได้แม้เปิดจาก file://)
 */
async function fetchSheetViaGviz(sheetName) {
  let json = null;

  // ลองใช้ JSONP ผ่าน <script> tag ก่อนเพื่อให้ทำงานได้ทั้งบน file:// และ GitHub Pages โดยไม่ติด CORS
  try {
    json = await new Promise((resolve, reject) => {
      const cbName = `__gviz_cb_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      const script = document.createElement('script');
      const timer = setTimeout(() => {
        cleanup();
        reject(new Error('gviz timeout'));
      }, 6000);

      function cleanup() {
        clearTimeout(timer);
        delete window[cbName];
        if (script.parentNode) script.parentNode.removeChild(script);
      }

      window[cbName] = (response) => {
        cleanup();
        resolve(response);
      };

      script.onerror = () => {
        cleanup();
        reject(new Error('gviz script error'));
      };

      script.src = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?sheet=${encodeURIComponent(sheetName)}&tqx=responseHandler:${cbName}`;
      document.head.appendChild(script);
    });
  } catch (err) {
    // Fallback ไปใช้ fetch ปกติ
    const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const text = await response.text();
    const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]+)\);?/);
    if (match && match[1]) {
      json = JSON.parse(match[1]);
    }
  }

  if (!json || !json.table || !json.table.rows || json.table.rows.length === 0) return null;

  const rows = json.table.rows;
  if (sheetName === 'Question') {
    const parsed = [];
    let currentCatTh = 'หมวดทั่วไป';
    let currentCatZh = '常规安全';
    let currentCatMy = 'အထွေထွေ လုံခြုံရေး';
    let qCounter = 1;

    rows.forEach((r) => {
      const c = r.c || [];
      const val = (i) => (c[i] && c[i].v !== null && c[i].v !== undefined) ? c[i].v : '';
      const colB = String(val(1) || val(0) || '').trim();
      const colC = val(2);
      const colD = String(val(3) || '').trim();
      const colE = String(val(4) || '').trim();

      if (!colB || colB.toLowerCase() === 'category' || colB.toLowerCase() === 'id') return;

      if (colB.indexOf('หมวดที่') === 0) {
        currentCatTh = colB;
        currentCatZh = colD || colB;
        currentCatMy = colE || colB;
        return;
      }

      parsed.push({
        id: `Q${qCounter}`,
        category: currentCatTh,
        category_zh: currentCatZh,
        category_my: currentCatMy,
        text_th: colB,
        text_zh: colD || colB,
        text_my: colE || colB,
        max_score: Number(colC) || 1,
        active: true
      });
      qCounter++;
    });
    return parsed.length > 0 ? parsed : null;
  }

  if (sheetName === 'Survey list') {
    const parsed = [];
    rows.forEach((r, idx) => {
      const c = r.c || [];
      const val = (i) => (c[i] && c[i].v !== null && c[i].v !== undefined) ? c[i].v : '';
      const rawDate = String(c[1]?.f || val(1) || '').trim();
      const empId = String(val(2) || '').trim();
      const empName = String(val(3) || '').trim();
      const line = String(val(4) || '').trim();
      const scoreVal = val(5);
      const note = String(val(6) || '').trim();
      const detailsJson = String(val(7) || '').trim();

      if (!empId && !empName && (scoreVal === '' || scoreVal === null)) return;
      if (rawDate.toLowerCase() === 'date' || empId.toLowerCase() === 'employee id') return;

      let dateStr = rawDate.slice(0, 10);
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(rawDate)) {
        const parts = rawDate.split('/');
        dateStr = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
      }

      let extra = {};
      try {
        extra = detailsJson ? JSON.parse(detailsJson) : {};
      } catch (e) {
        extra = {};
      }

      const totalScore = Number(scoreVal) || 0;
      const maxScore = Number(extra.max_score) || 10;
      const pct = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

      parsed.push({
        survey_id: extra.survey_id || `SV-${idx + 1}`,
        date: dateStr,
        timestamp: extra.timestamp || dateStr,
        employee_id: empId || '-',
        employee_name: empName || empId || '-',
        line: line || 'FA-Line 1',
        auditor: extra.auditor || '',
        total_score: totalScore,
        max_score: maxScore,
        percentage: pct,
        answers: extra.answers || {},
        note: note
      });
    });
    return parsed;
  }

  return null;
}

/**
 * ส่งคำสั่งบันทึกข้อมูลไปยัง Google Sheets ผ่าน POST (doPost)
 */
async function postToGoogleSheets(payload) {
  // 1. ถ้ารันบน Google Apps Script โดยตรง
  if (typeof google !== 'undefined' && google.script && google.script.run) {
    try {
      state.isSyncing = true;
      updateConnectionBadge();
      const res = await new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler(resolve)
          .withFailureHandler(reject)
          .processActionPayload(payload);
      });
      state.isConnectedToCloud = true;
      state.isSyncing = false;
      updateConnectionBadge();
      return res;
    } catch (err) {
      state.isSyncing = false;
      updateConnectionBadge();
      return { status: 'error', message: err.toString() };
    }
  }

  // 2. ใช้ลิงก์ GAS Web App URL ที่ฝังไว้ในโค้ด
  const targetUrl = (state.gasUrl && state.gasUrl.startsWith('https://script.google.com/'))
    ? state.gasUrl
    : DEFAULT_GAS_WEBAPP_URL;

  state.isSyncing = true;
  updateConnectionBadge();

  try {
    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      redirect: 'follow'
    });
    const data = await res.json();
    if (data && data.status === 'ok') {
      if (Array.isArray(data.questions) && data.questions.length > 0) {
        state.questions = data.questions;
      }
      if (Array.isArray(data.surveys)) {
        state.surveys = data.surveys;
      }
      saveLocalData();
      renderAll();
    }
    state.isConnectedToCloud = true;
    state.isSyncing = false;
    updateConnectionBadge();
    return data;
  } catch (err) {
    console.warn('POST to GAS warning:', err);
    state.isSyncing = false;
    updateConnectionBadge();
    return { status: 'error', message: err.toString() };
  }
}

/**
 * อัปเดตสถานะการเชื่อมต่อบน Header
 */
function updateConnectionBadge() {
  const t = I18N[state.lang] || I18N.th;
  const dot = document.getElementById('conn-status-dot');
  const text = document.getElementById('conn-status-text');
  if (!dot || !text) return;

  if (state.isSyncing) {
    dot.className = 'w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping';
    text.textContent = t.status_syncing;
  } else if (state.isConnectedToCloud || (state.gasUrl && state.gasUrl.startsWith('https://script.google.com/'))) {
    dot.className = 'w-2.5 h-2.5 rounded-full bg-emerald-400';
    text.textContent = t.status_connected;
  } else {
    dot.className = 'w-2.5 h-2.5 rounded-full bg-teal-400';
    text.textContent = t.status_demo;
  }
}

/**
 * ============================================================================
 * DASHBOARD & CHARTS
 * ============================================================================
 */
function getFilteredSurveys() {
  return state.surveys.filter(s => {
    if (state.filters.line && state.filters.line !== 'ALL' && s.line !== state.filters.line) {
      return false;
    }
    if (state.filters.dateFrom && s.date < state.filters.dateFrom) {
      return false;
    }
    if (state.filters.dateTo && s.date > state.filters.dateTo) {
      return false;
    }
    if (state.filters.search) {
      const q = state.filters.search.toLowerCase();
      const matchId = (s.employee_id || '').toLowerCase().includes(q);
      const matchName = (s.employee_name || '').toLowerCase().includes(q);
      const matchLine = (s.line || '').toLowerCase().includes(q);
      const matchAuditor = (s.auditor || '').toLowerCase().includes(q);
      if (!matchId && !matchName && !matchLine && !matchAuditor) return false;
    }
    return true;
  });
}

function applyDashboardFilters() {
  state.filters.line = document.getElementById('filter-line')?.value || 'ALL';
  state.filters.dateFrom = document.getElementById('filter-date-from')?.value || '';
  state.filters.dateTo = document.getElementById('filter-date-to')?.value || '';
  state.filters.search = document.getElementById('filter-search')?.value.trim() || '';

  renderDashboard();
  renderRecordsTable();
}

function resetDashboardFilters() {
  state.filters = { line: 'ALL', dateFrom: '', dateTo: '', search: '' };
  const lineEl = document.getElementById('filter-line');
  const fromEl = document.getElementById('filter-date-from');
  const toEl = document.getElementById('filter-date-to');
  const searchEl = document.getElementById('filter-search');
  if (lineEl) lineEl.value = 'ALL';
  if (fromEl) fromEl.value = '';
  if (toEl) toEl.value = '';
  if (searchEl) searchEl.value = '';

  renderDashboard();
  renderRecordsTable();
}

function renderDashboard() {
  const filtered = getFilteredSurveys();
  const todayStr = new Date().toISOString().slice(0, 10);

  // คำนวณ KPI
  const totalCount = filtered.length;
  const todayCount = filtered.filter(s => s.date === todayStr).length;
  const avgPct = totalCount > 0
    ? (filtered.reduce((acc, s) => acc + (Number(s.percentage) || 0), 0) / totalCount).toFixed(1)
    : '0.0';
  const passCount = filtered.filter(s => (Number(s.percentage) || 0) >= 80).length;
  const passRate = totalCount > 0 ? Math.round((passCount / totalCount) * 100) : 0;

  setText('kpi-total-val', totalCount);
  setText('kpi-today-val', todayCount);
  setText('kpi-avg-val', `${avgPct}%`);
  setText('kpi-pass-val', `${passRate}%`);

  renderDailyChart(filtered);
  renderLineChart(filtered);
  renderEmployeeScoreChart(filtered);
  renderDashboardMiniTable(filtered);
}

/**
 * กราฟที่ 1: สรุปจำนวนพนักงานที่ถูก Survey ในแต่ละวัน + คะแนนเฉลี่ยรายวัน
 */
function renderDailyChart(surveys) {
  const ctx = document.getElementById('chart-daily');
  if (!ctx) return;

  const t = I18N[state.lang] || I18N.th;
  const byDate = {};

  surveys.forEach(s => {
    const d = s.date || 'Unknown';
    if (!byDate[d]) {
      byDate[d] = { count: 0, sumPct: 0 };
    }
    byDate[d].count += 1;
    byDate[d].sumPct += Number(s.percentage) || 0;
  });

  const sortedDates = Object.keys(byDate).sort();
  const counts = sortedDates.map(d => byDate[d].count);
  const avgPcts = sortedDates.map(d => Math.round(byDate[d].sumPct / byDate[d].count));

  if (dailyChartInstance) {
    dailyChartInstance.destroy();
  }

  dailyChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sortedDates,
      datasets: [
        {
          type: 'bar',
          label: t.chart_label_count,
          data: counts,
          backgroundColor: 'rgba(13, 148, 136, 0.82)',
          borderColor: '#0f766e',
          borderWidth: 1.5,
          borderRadius: 8,
          yAxisID: 'yCount',
          barPercentage: 0.55
        },
        {
          type: 'line',
          label: t.chart_label_avg_pct,
          data: avgPcts,
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.15)',
          borderWidth: 3,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#f59e0b',
          pointBorderWidth: 2.5,
          pointRadius: 5,
          tension: 0.3,
          yAxisID: 'yPct'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 8 } },
        tooltip: {
          padding: 10,
          cornerRadius: 8
        }
      },
      scales: {
        yCount: {
          type: 'linear',
          position: 'left',
          beginAtZero: true,
          ticks: { stepSize: 1, precision: 0 },
          title: { display: true, text: t.chart_label_count }
        },
        yPct: {
          type: 'linear',
          position: 'right',
          min: 0,
          max: 100,
          grid: { drawOnChartArea: false },
          title: { display: true, text: '%' }
        }
      }
    }
  });
}

/**
 * กราฟที่ 2: แสดง Score เฉลี่ยและจำนวนคนแยกตามแต่ละไลน์การผลิต
 */
function renderLineChart(surveys) {
  const ctx = document.getElementById('chart-line');
  if (!ctx) return;

  const t = I18N[state.lang] || I18N.th;
  const byLine = {};

  surveys.forEach(s => {
    const ln = s.line || 'Other';
    if (!byLine[ln]) {
      byLine[ln] = { count: 0, sumPct: 0, sumScore: 0 };
    }
    byLine[ln].count += 1;
    byLine[ln].sumPct += Number(s.percentage) || 0;
    byLine[ln].sumScore += Number(s.total_score) || 0;
  });

  const lines = Object.keys(byLine);
  const avgPcts = lines.map(l => Math.round(byLine[l].sumPct / byLine[l].count));
  const counts = lines.map(l => byLine[l].count);
  const colors = lines.map(l => LINE_COLORS[l] || '#0284c7');

  if (lineChartInstance) {
    lineChartInstance.destroy();
  }

  lineChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: lines,
      datasets: [
        {
          label: t.chart_label_avg_pct,
          data: avgPcts,
          backgroundColor: colors,
          borderRadius: 8,
          yAxisID: 'yPct',
          barPercentage: 0.55
        },
        {
          label: t.chart_label_count,
          data: counts,
          backgroundColor: 'rgba(100, 116, 139, 0.25)',
          borderColor: '#475569',
          borderWidth: 1.5,
          borderRadius: 8,
          yAxisID: 'yCount',
          barPercentage: 0.45
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 8 } }
      },
      scales: {
        yPct: {
          type: 'linear',
          position: 'left',
          min: 0,
          max: 100,
          title: { display: true, text: '%' }
        },
        yCount: {
          type: 'linear',
          position: 'right',
          beginAtZero: true,
          grid: { drawOnChartArea: false },
          ticks: { stepSize: 1, precision: 0 },
          title: { display: true, text: t.chart_label_count }
        }
      }
    }
  });
}

/**
 * ปุ่มเลือกกรองเฉพาะไลน์สำหรับกราฟคะแนนรายบุคคล
 */
function renderEmpChartLinePills(lines) {
  const container = document.getElementById('emp-chart-line-pills');
  if (!container) return;
  const t = I18N[state.lang] || I18N.th;

  const pillsHtml = [
    `<button type="button" onclick="setEmpChartLine('ALL')" class="px-3 py-1 rounded-full text-xs font-semibold transition ${state.empChartLineFilter === 'ALL' ? 'bg-teal-700 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">${t.filter_all_lines}</button>`,
    ...lines.map(ln => {
      const active = state.empChartLineFilter === ln;
      return `<button type="button" onclick="setEmpChartLine('${escapeHtml(ln)}')" class="px-3 py-1 rounded-full text-xs font-semibold transition ${active ? 'bg-teal-700 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">${escapeHtml(ln)}</button>`;
    })
  ].join('');

  container.innerHTML = pillsHtml;
}

function setEmpChartLine(line) {
  state.empChartLineFilter = line;
  populateLineOptions();
  renderEmployeeScoreChart(getFilteredSurveys());
}

/**
 * กราฟที่ 3: แสดง Score ของพนักงานแต่ละคน และแยกตามไลน์
 */
function renderEmployeeScoreChart(surveys) {
  const ctx = document.getElementById('chart-employee');
  if (!ctx) return;

  const t = I18N[state.lang] || I18N.th;
  let dataList = [...surveys];
  if (state.empChartLineFilter !== 'ALL') {
    dataList = dataList.filter(s => s.line === state.empChartLineFilter);
  }

  // เรียงตามวันที่ล่าสุดและแสดงสูงสุด 25 รายการเพื่อให้กราฟอ่านง่ายบนมือถือและโน้ตบุ๊ก
  const displayList = dataList.slice(-25);

  const labels = displayList.map(s => `${s.employee_name || s.employee_id} (${s.line})`);
  const scoresPct = displayList.map(s => Number(s.percentage) || 0);
  const bgColors = displayList.map(s => LINE_COLORS[s.line] || '#0d9488');

  if (empChartInstance) {
    empChartInstance.destroy();
  }

  empChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: t.chart_label_emp_score,
          data: scoresPct,
          backgroundColor: bgColors,
          borderRadius: 6,
          barPercentage: 0.65
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => {
              const item = displayList[context.dataIndex];
              if (!item) return '';
              return [
                `${item.employee_name} (${item.employee_id})`,
                `Line: ${item.line} | Date: ${item.date}`,
                `Score: ${item.total_score}/${item.max_score} (${item.percentage}%)`
              ];
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          title: { display: true, text: 'Score (%)' }
        },
        x: {
          ticks: {
            maxRotation: 40,
            minRotation: 25,
            font: { size: 11 }
          }
        }
      }
    }
  });
}

/**
 * ตารางสรุปคะแนนรายบุคคลและรายไลน์ด้านล่าง Dashboard
 */
function renderDashboardMiniTable(surveys) {
  const tbody = document.getElementById('dashboard-recent-tbody');
  if (!tbody) return;

  const recent = [...surveys].reverse().slice(0, 10);
  if (recent.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-slate-400">ยังไม่มีข้อมูลที่ตรงกับตัวกรอง</td></tr>`;
    return;
  }

  tbody.innerHTML = recent.map(s => {
    const pct = Number(s.percentage) || 0;
    const badgeColor = pct >= 80
      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
      : pct >= 60
        ? 'bg-amber-100 text-amber-800 border-amber-200'
        : 'bg-rose-100 text-rose-800 border-rose-200';
    const lineColor = LINE_COLORS[s.line] || '#0d9488';

    return `
      <tr class="border-b border-slate-100 hover:bg-slate-50/80 transition">
        <td class="py-3 px-4 text-xs font-medium text-slate-600 whitespace-nowrap">${escapeHtml(s.date)}</td>
        <td class="py-3 px-4 whitespace-nowrap">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold text-white" style="background-color: ${lineColor}">
            ${escapeHtml(s.line)}
          </span>
        </td>
        <td class="py-3 px-4 text-xs font-mono font-semibold text-slate-700 whitespace-nowrap">${escapeHtml(s.employee_id)}</td>
        <td class="py-3 px-4 text-sm font-medium text-slate-900">${escapeHtml(s.employee_name)}</td>
        <td class="py-3 px-4 text-center font-bold text-slate-800 whitespace-nowrap">${s.total_score} / ${s.max_score}</td>
        <td class="py-3 px-4 text-center whitespace-nowrap">
          <span class="px-2.5 py-1 rounded-full text-xs font-bold border ${badgeColor}">${pct}%</span>
        </td>
        <td class="py-3 px-4 text-right whitespace-nowrap">
          <button type="button" onclick="openSurveyDetailModal('${escapeHtml(s.survey_id)}')" class="text-teal-700 hover:text-teal-900 text-xs font-semibold underline">
            ${I18N[state.lang].btn_view_detail}
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * ============================================================================
 * SURVEY FORM (บันทึกคะแนนลงชีต "Survey list")
 * ============================================================================
 */
function getQuestionTextByLang(q) {
  if (state.lang === 'zh') return q.text_zh || q.text_th;
  if (state.lang === 'my') return q.text_my || q.text_th;
  return q.text_th;
}

function getCategoryByLang(q) {
  if (state.lang === 'zh') return q.category_zh || q.category || '安全检查';
  if (state.lang === 'my') return q.category_my || q.category || 'လုံခြုံရေး';
  return q.category || 'หมวดทั่วไป';
}

function renderSurveyFormQuestions() {
  const container = document.getElementById('survey-questions-container');
  if (!container) return;

  const activeQuestions = state.questions.filter(q => q.active !== false);

  // ตั้งค่าคะแนนเริ่มต้นให้ครบทุกข้อหากยังไม่ได้เลือก (ค่าเริ่มต้น = คะแนนเต็มของข้อนั้น)
  activeQuestions.forEach(q => {
    if (state.currentScores[q.id] === undefined) {
      state.currentScores[q.id] = Number(q.max_score) || 1;
    }
  });

  container.innerHTML = activeQuestions.map((q) => {
    const maxScore = Number(q.max_score) || 1;
    const selectedScore = state.currentScores[q.id];
    const qText = getQuestionTextByLang(q);
    const catText = getCategoryByLang(q);

    // สร้างปุ่มกดคะแนนตั้งแต่ 0 ถึง maxScore (เช่น 0, 1 หรือ 0, 1, 2 ตามคะแนนเต็มในชีต Question)
    const buttons = [];
    for (let score = 0; score <= maxScore; score++) {
      let level = 5;
      if (score === 0) level = 1;
      else if (score < maxScore) level = 3;
      else level = 5;

      const colorClass = selectedScore === score
        ? `selected-${level}`
        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100';
      buttons.push(`
        <button
          type="button"
          onclick="selectQuestionScore('${escapeHtml(q.id)}', ${score})"
          class="score-btn flex-1 py-3 px-2 rounded-xl border font-bold text-base sm:text-lg flex flex-col items-center justify-center gap-0.5 ${colorClass}"
        >
          <span>${score}</span>
        </button>
      `);
    }

    return `
      <div class="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:border-teal-500/40 transition">
        <div class="flex items-start justify-between gap-3 mb-3">
          <div class="flex items-start gap-3">
            <span class="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-teal-50 text-teal-800 font-bold text-sm shrink-0 border border-teal-200">
              ${escapeHtml(q.id)}
            </span>
            <div>
              <span class="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-semibold mb-1">
                ${escapeHtml(catText)}
              </span>
              <p class="text-slate-900 font-semibold text-sm sm:text-base leading-relaxed">
                ${escapeHtml(qText)}
              </p>
            </div>
          </div>
          <span class="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg shrink-0">
            ${selectedScore !== undefined ? selectedScore : '-'} / ${maxScore}
          </span>
        </div>

        <div class="flex items-center gap-2 mt-3">
          ${buttons.join('')}
        </div>
      </div>
    `;
  }).join('');

  updateLiveSurveyScore();
}

function selectQuestionScore(qId, score) {
  state.currentScores[qId] = Number(score);
  renderSurveyFormQuestions();
}

function updateLiveSurveyScore() {
  const activeQuestions = state.questions.filter(q => q.active !== false);
  let total = 0;
  let max = 0;

  activeQuestions.forEach(q => {
    const qMax = Number(q.max_score) || 1;
    max += qMax;
    total += Number(state.currentScores[q.id] ?? 0);
  });

  const pct = max > 0 ? Math.round((total / max) * 100) : 0;
  setText('live-total-score', `${total} / ${max} (${pct}%)`);
}

function clearSurveyForm() {
  document.getElementById('survey-emp-id').value = '';
  document.getElementById('survey-emp-name').value = '';
  document.getElementById('survey-note').value = '';
  state.currentScores = {};
  renderSurveyFormQuestions();
}

async function handleSurveySubmit(event) {
  event.preventDefault();
  const t = I18N[state.lang] || I18N.th;

  const date = document.getElementById('survey-date').value || new Date().toISOString().slice(0, 10);
  const line = document.getElementById('survey-line').value.trim() || 'FA-Line 1';
  const empId = document.getElementById('survey-emp-id').value.trim();
  const empName = document.getElementById('survey-emp-name').value.trim();
  const auditor = document.getElementById('survey-auditor').value.trim() || 'Safety Inspector';
  const note = document.getElementById('survey-note').value.trim();

  if (!empId || !empName) {
    showToast(t.msg_please_fill_emp, 'error');
    return;
  }

  const activeQuestions = state.questions.filter(q => q.active !== false);
  let totalScore = 0;
  let maxScore = 0;
  const answers = {};

  for (const q of activeQuestions) {
    if (state.currentScores[q.id] === undefined) {
      showToast(t.msg_please_fill_emp, 'error');
      return;
    }
    const sc = Number(state.currentScores[q.id]);
    answers[q.id] = sc;
    totalScore += sc;
    maxScore += Number(q.max_score) || 1;
  }

  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  const newSurvey = {
    survey_id: `SV-${Date.now()}`,
    date,
    timestamp: new Date().toISOString(),
    employee_id: empId,
    employee_name: empName,
    line,
    auditor,
    total_score: totalScore,
    max_score: maxScore,
    percentage,
    answers,
    note
  };

  // 1. บันทึกลง State และ LocalStorage ทันที
  state.surveys.push(newSurvey);
  saveLocalData();
  populateLineOptions();
  renderAll();

  // 2. ส่งข้อมูลไปบันทึกลงชีต "Survey list" ใน Google Sheets
  await postToGoogleSheets({
    action: 'submitSurvey',
    survey: newSurvey
  });

  showToast(t.msg_survey_saved, 'success');
  clearSurveyForm();
  switchTab('dashboard');
}

/**
 * ============================================================================
 * QUESTION MANAGER (พิมพ์ / แก้ไข / เพิ่มคำถามในชีต "Question")
 * ============================================================================
 */
function renderQuestionsManager() {
  const listEl = document.getElementById('questions-manager-list');
  if (!listEl) return;

  const t = I18N[state.lang] || I18N.th;

  listEl.innerHTML = state.questions.map((q) => {
    const statusBadge = q.active !== false
      ? `<span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">${t.q_status_active}</span>`
      : `<span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-600">${t.q_status_inactive}</span>`;

    return `
      <div class="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div class="space-y-2 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="px-2.5 py-1 rounded-lg bg-teal-900 text-white font-mono font-bold text-xs">${escapeHtml(q.id)}</span>
            <span class="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-xs">${escapeHtml(q.category || 'General')}</span>
            <span class="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 font-semibold text-xs border border-amber-200">${t.q_col_max}: ${q.max_score || 5}</span>
            ${statusBadge}
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div class="text-[11px] font-bold text-slate-400 uppercase mb-0.5">🇹🇭 ภาษาไทย</div>
              <div class="text-sm text-slate-800 font-medium">${escapeHtml(q.text_th)}</div>
            </div>
            <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div class="text-[11px] font-bold text-slate-400 uppercase mb-0.5">🇨🇳 中文 (จีน)</div>
              <div class="text-sm text-slate-800 font-medium">${escapeHtml(q.text_zh || q.text_th)}</div>
            </div>
            <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div class="text-[11px] font-bold text-slate-400 uppercase mb-0.5">🇲🇲 မြန်မာ (พม่า)</div>
              <div class="text-sm text-slate-800 font-medium">${escapeHtml(q.text_my || q.text_th)}</div>
            </div>
          </div>
        </div>

        <div class="flex sm:flex-row lg:flex-col items-center justify-end gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
          <button
            type="button"
            onclick="openQuestionEditor('${escapeHtml(q.id)}')"
            class="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-teal-50 text-teal-800 hover:bg-teal-100 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
          >
            <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
            <span>${t.btn_edit}</span>
          </button>
          <button
            type="button"
            onclick="deleteQuestion('${escapeHtml(q.id)}')"
            class="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
          >
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            <span>${t.btn_delete}</span>
          </button>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}

function openQuestionEditor(qId = null) {
  const modal = document.getElementById('question-editor-modal');
  if (!modal) return;

  state.editingQuestionId = qId;
  const existing = qId ? state.questions.find(q => q.id === qId) : null;

  const nextNum = state.questions.length + 1;
  document.getElementById('q-edit-id').value = existing ? existing.id : `Q${nextNum}`;
  document.getElementById('q-edit-category').value = existing ? (existing.category || 'PPE') : 'PPE';
  document.getElementById('q-edit-th').value = existing ? existing.text_th : '';
  document.getElementById('q-edit-zh').value = existing ? existing.text_zh : '';
  document.getElementById('q-edit-my').value = existing ? existing.text_my : '';
  document.getElementById('q-edit-max').value = existing ? (existing.max_score || 5) : 5;
  document.getElementById('q-edit-active').checked = existing ? (existing.active !== false) : true;

  modal.classList.remove('hidden');
}

function closeQuestionEditor() {
  const modal = document.getElementById('question-editor-modal');
  if (modal) modal.classList.add('hidden');
  state.editingQuestionId = null;
}

function handleAutoTranslateInEditor() {
  const thText = document.getElementById('q-edit-th').value.trim();
  if (!thText) return;

  const translated = smartTranslateQuestion(thText);
  const zhInput = document.getElementById('q-edit-zh');
  const myInput = document.getElementById('q-edit-my');

  if (!zhInput.value.trim()) zhInput.value = translated.zh;
  else zhInput.value = translated.zh;

  if (!myInput.value.trim()) myInput.value = translated.my;
  else myInput.value = translated.my;
}

async function saveQuestionFromEditor(event) {
  event.preventDefault();
  const t = I18N[state.lang] || I18N.th;

  const id = document.getElementById('q-edit-id').value.trim() || `Q${state.questions.length + 1}`;
  const category = document.getElementById('q-edit-category').value.trim() || 'Safety';
  const text_th = document.getElementById('q-edit-th').value.trim();
  let text_zh = document.getElementById('q-edit-zh').value.trim();
  let text_my = document.getElementById('q-edit-my').value.trim();
  const max_score = Number(document.getElementById('q-edit-max').value) || 5;
  const active = document.getElementById('q-edit-active').checked;

  if (!text_th) return;

  // หากไม่ได้กรอกภาษาจีนหรือพม่า ให้ช่วยเติมอัตโนมัติ
  if (!text_zh || !text_my) {
    const auto = smartTranslateQuestion(text_th);
    if (!text_zh) text_zh = auto.zh;
    if (!text_my) text_my = auto.my;
  }

  const questionObj = {
    id,
    category,
    text_th,
    text_zh,
    text_my,
    max_score,
    active,
    updated_at: new Date().toISOString()
  };

  const idx = state.questions.findIndex(q => q.id === (state.editingQuestionId || id));
  if (idx !== -1) {
    state.questions[idx] = questionObj;
  } else {
    state.questions.push(questionObj);
  }

  saveLocalData();
  closeQuestionEditor();
  renderAll();

  await postToGoogleSheets({
    action: 'saveQuestion',
    question: questionObj,
    allQuestions: state.questions
  });

  showToast(t.msg_question_saved, 'success');
}

async function deleteQuestion(qId) {
  const t = I18N[state.lang] || I18N.th;
  state.questions = state.questions.filter(q => q.id !== qId);
  saveLocalData();
  renderAll();

  await postToGoogleSheets({
    action: 'deleteQuestion',
    id: qId,
    allQuestions: state.questions
  });

  showToast(t.msg_question_deleted, 'info');
}

/**
 * ============================================================================
 * SURVEY LIST RECORDS TABLE & EXPORT CSV
 * ============================================================================
 */
function renderRecordsTable() {
  const tbody = document.getElementById('records-table-tbody');
  if (!tbody) return;

  const filtered = [...getFilteredSurveys()].reverse();
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="py-10 text-center text-slate-400">ไม่พบรายการสำรวจ</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(s => {
    const pct = Number(s.percentage) || 0;
    const badgeColor = pct >= 80
      ? 'bg-emerald-100 text-emerald-800'
      : pct >= 60
        ? 'bg-amber-100 text-amber-800'
        : 'bg-rose-100 text-rose-800';
    const lineColor = LINE_COLORS[s.line] || '#0d9488';

    return `
      <tr class="border-b border-slate-100 hover:bg-slate-50 transition">
        <td class="py-3.5 px-4 text-xs font-medium text-slate-600 whitespace-nowrap">${escapeHtml(s.date)}</td>
        <td class="py-3.5 px-4 whitespace-nowrap">
          <span class="px-2.5 py-1 rounded-full text-xs font-semibold text-white" style="background-color:${lineColor}">
            ${escapeHtml(s.line)}
          </span>
        </td>
        <td class="py-3.5 px-4 text-xs font-mono font-bold text-slate-700 whitespace-nowrap">${escapeHtml(s.employee_id)}</td>
        <td class="py-3.5 px-4 text-sm font-semibold text-slate-900">${escapeHtml(s.employee_name)}</td>
        <td class="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">${escapeHtml(s.auditor || '-')}</td>
        <td class="py-3.5 px-4 text-center font-bold text-slate-800 whitespace-nowrap">${s.total_score} / ${s.max_score}</td>
        <td class="py-3.5 px-4 text-center whitespace-nowrap">
          <span class="px-2.5 py-1 rounded-full text-xs font-bold ${badgeColor}">${pct}%</span>
        </td>
        <td class="py-3.5 px-4 text-xs text-slate-600 max-w-xs truncate">${escapeHtml(s.note || '-')}</td>
        <td class="py-3.5 px-4 text-right whitespace-nowrap">
          <button
            type="button"
            onclick="openSurveyDetailModal('${escapeHtml(s.survey_id)}')"
            class="px-3 py-1.5 rounded-lg bg-teal-50 text-teal-800 hover:bg-teal-100 text-xs font-semibold transition"
          >
            ${I18N[state.lang].btn_view_detail}
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function openSurveyDetailModal(surveyId) {
  const record = state.surveys.find(s => s.survey_id === surveyId);
  if (!record) return;

  const modal = document.getElementById('survey-detail-modal');
  const content = document.getElementById('survey-detail-content');
  if (!modal || !content) return;

  const answers = record.answers || {};
  const breakdownHtml = Object.keys(answers).map(qKey => {
    const qObj = state.questions.find(q => q.id === qKey);
    const qTitle = qObj ? getQuestionTextByLang(qObj) : qKey;
    const qMax = qObj ? (qObj.max_score || 5) : 5;
    return `
      <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
        <div class="text-xs sm:text-sm text-slate-800">
          <span class="font-bold text-teal-800 mr-1.5">[${escapeHtml(qKey)}]</span>
          ${escapeHtml(qTitle)}
        </div>
        <span class="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-bold text-sm text-slate-900 shrink-0">
          ${answers[qKey]} / ${qMax}
        </span>
      </div>
    `;
  }).join('');

  content.innerHTML = `
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
      <div class="p-3 rounded-xl bg-slate-100">
        <div class="text-[11px] text-slate-500">Employee</div>
        <div class="font-bold text-sm text-slate-900">${escapeHtml(record.employee_name)}</div>
        <div class="text-xs font-mono text-slate-600">${escapeHtml(record.employee_id)}</div>
      </div>
      <div class="p-3 rounded-xl bg-slate-100">
        <div class="text-[11px] text-slate-500">Line</div>
        <div class="font-bold text-sm text-teal-800">${escapeHtml(record.line)}</div>
      </div>
      <div class="p-3 rounded-xl bg-slate-100">
        <div class="text-[11px] text-slate-500">Date & Auditor</div>
        <div class="font-bold text-sm text-slate-900">${escapeHtml(record.date)}</div>
        <div class="text-xs text-slate-600">${escapeHtml(record.auditor || '-')}</div>
      </div>
      <div class="p-3 rounded-xl bg-teal-50 border border-teal-200">
        <div class="text-[11px] text-teal-700">Total Score</div>
        <div class="font-extrabold text-lg text-teal-900">${record.total_score}/${record.max_score} (${record.percentage}%)</div>
      </div>
    </div>
    <div class="space-y-2 max-h-72 overflow-y-auto pr-1">
      ${breakdownHtml}
    </div>
    ${record.note ? `<div class="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900"><strong>Note:</strong> ${escapeHtml(record.note)}</div>` : ''}
  `;

  modal.classList.remove('hidden');
}

function closeSurveyDetailModal() {
  const modal = document.getElementById('survey-detail-modal');
  if (modal) modal.classList.add('hidden');
}

function exportSurveysToCSV() {
  const rows = [
    ['survey_id', 'date', 'employee_id', 'employee_name', 'line', 'auditor', 'total_score', 'max_score', 'percentage', 'note']
  ];
  state.surveys.forEach(s => {
    rows.push([
      s.survey_id,
      s.date,
      s.employee_id,
      `"${(s.employee_name || '').replace(/"/g, '""')}"`,
      `"${(s.line || '').replace(/"/g, '""')}"`,
      `"${(s.auditor || '').replace(/"/g, '""')}"`,
      s.total_score,
      s.max_score,
      s.percentage,
      `"${(s.note || '').replace(/"/g, '""')}"`
    ]);
  });

  const csvContent = '\uFEFF' + rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `FA_Safety_Survey_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * ============================================================================
 * EMBEDDED GOOGLE APPS SCRIPT CODE (ฝังโค้ด Apps Script ไว้ในระบบโดยตรง)
 * ============================================================================
 */
const EMBEDDED_APPS_SCRIPT_CODE = `/**
 * Final Assembly - Safety Survey | Google Apps Script Backend (Code.gs)
 * Spreadsheet ID: 1bM68aArN9WAbwrvFrKC1hpAy335SSgzZPZBtDp-Znpc
 */
const SPREADSHEET_ID = '1bM68aArN9WAbwrvFrKC1hpAy335SSgzZPZBtDp-Znpc';
const SHEET_QUESTIONS = 'Question';
const SHEET_SURVEYS = 'Survey list';

function getSpreadsheet() {
  try {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch (e) {
    return SpreadsheetApp.getActiveSpreadsheet();
  }
}

function setupSheets() {
  const ss = getSpreadsheet();
  let qSheet = ss.getSheetByName(SHEET_QUESTIONS);
  if (!qSheet) qSheet = ss.insertSheet(SHEET_QUESTIONS);

  let sSheet = ss.getSheetByName(SHEET_SURVEYS);
  if (!sSheet) {
    sSheet = ss.insertSheet(SHEET_SURVEYS);
    sSheet.getRange('B2:H2').setValues([[
      'Date', 'Employee ID', 'Name', 'Line', 'Score', 'Note', 'Details_JSON'
    ]]).setFontWeight('bold');
  }
  return { status: 'ok', message: 'Sheets ready' };
}

function doGet(e) {
  try {
    setupSheets();
    const callback = (e && e.parameter && e.parameter.callback) ? e.parameter.callback : null;

    let resultPayload;
    if (e && e.parameter && e.parameter.payload) {
      const parsedPayload = JSON.parse(e.parameter.payload);
      resultPayload = processActionPayload(parsedPayload);
    } else {
      const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'getAll';
      if (action === 'getQuestions') {
        resultPayload = { status: 'ok', questions: getQuestionsData() };
      } else if (action === 'getSurveys') {
        resultPayload = { status: 'ok', surveys: getSurveysData() };
      } else {
        resultPayload = {
          status: 'ok',
          questions: getQuestionsData(),
          surveys: getSurveysData(),
          serverTime: new Date().toISOString()
        };
      }
    }

    if (callback) {
      return ContentService
        .createTextOutput(callback + '(' + JSON.stringify(resultPayload) + ');')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return jsonResponse(resultPayload);
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.toString() });
  }
}

function doPost(e) {
  try {
    setupSheets();
    let payload = {};
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      payload = e.parameter;
    }
    return jsonResponse(processActionPayload(payload));
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.toString() });
  }
}

function processActionPayload(payload) {
  setupSheets();
  const action = payload.action;
  if (action === 'getAll') {
    return { status: 'ok', questions: getQuestionsData(), surveys: getSurveysData() };
  }
  if (action === 'saveQuestion') {
    saveQuestionToSheet(payload.question, payload.allQuestions);
    return { status: 'ok', questions: getQuestionsData() };
  }
  if (action === 'deleteQuestion') {
    if (Array.isArray(payload.allQuestions)) writeQuestionsTable(payload.allQuestions);
    return { status: 'ok', questions: getQuestionsData() };
  }
  if (action === 'saveAllQuestions') {
    writeQuestionsTable(payload.questions || []);
    return { status: 'ok', questions: getQuestionsData() };
  }
  if (action === 'submitSurvey') {
    const saved = appendSurveyRow(payload.survey);
    return { status: 'ok', survey: saved, surveys: getSurveysData() };
  }
  return { status: 'error', message: 'Unknown action: ' + action };
}

function getQuestionsData() {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_QUESTIONS);
  const lastRow = sheet.getLastRow();
  if (lastRow < 3) return [];

  const maxCol = Math.max(5, sheet.getLastColumn());
  const values = sheet.getRange(2, 2, lastRow - 1, maxCol - 1).getValues();

  const questions = [];
  let currentCategoryTh = 'หมวดทั่วไป';
  let currentCategoryZh = '常规安全';
  let currentCategoryMy = 'အထွေထွေ လုံခြုံရေး';
  let qCounter = 1;

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const colB = String(row[0] || '').trim();
    const colC = row[1];
    const colD = String(row[2] || '').trim();
    const colE = String(row[3] || '').trim();

    if (!colB) continue;
    if (colB.indexOf('หมวดที่') === 0 || colB.toLowerCase().indexOf('category') === 0) {
      currentCategoryTh = colB;
      currentCategoryZh = colD || colB;
      currentCategoryMy = colE || colB;
      continue;
    }

    questions.push({
      id: 'Q' + qCounter,
      row_index: i + 2,
      category: currentCategoryTh,
      category_zh: currentCategoryZh,
      category_my: currentCategoryMy,
      text_th: colB,
      text_zh: colD || colB,
      text_my: colE || colB,
      max_score: Number(colC) || 1,
      active: true
    });
    qCounter++;
  }
  return questions;
}

function saveQuestionToSheet(question, allQuestions) {
  if (Array.isArray(allQuestions) && allQuestions.length > 0) {
    writeQuestionsTable(allQuestions);
    return;
  }
  const currentList = getQuestionsData();
  const idx = currentList.findIndex(q => q.id === question.id);
  if (idx !== -1) currentList[idx] = question;
  else currentList.push(question);
  writeQuestionsTable(currentList);
}

function writeQuestionsTable(questions) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_QUESTIONS);
  const lastRow = sheet.getLastRow();
  if (lastRow >= 2) sheet.getRange(2, 2, Math.max(12, lastRow), 4).clearContent();

  const rows = [['Category', 'Score', 'Question_ZH (中文)', 'Question_MY (မြန်မာ)']];
  const grouped = {};
  const categoryOrder = [];
  questions.forEach(q => {
    if (q.active === false) return;
    const cat = q.category || 'หมวดทั่วไป';
    if (!grouped[cat]) {
      grouped[cat] = { cat_th: cat, cat_zh: q.category_zh || cat, cat_my: q.category_my || cat, items: [], sumScore: 0 };
      categoryOrder.push(cat);
    }
    const sc = Number(q.max_score) || 1;
    grouped[cat].items.push(q);
    grouped[cat].sumScore += sc;
  });

  let grandTotal = 0;
  categoryOrder.forEach(catKey => {
    const group = grouped[catKey];
    grandTotal += group.sumScore;
    rows.push([group.cat_th, group.sumScore, group.cat_zh, group.cat_my]);
    group.items.forEach(q => {
      rows.push([q.text_th || '', Number(q.max_score) || 1, q.text_zh || q.text_th || '', q.text_my || q.text_th || '']);
    });
  });

  rows.push(['', grandTotal, '', '']);
  sheet.getRange(2, 2, rows.length, 4).setValues(rows);
}

function getSurveysData() {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_SURVEYS);
  const lastRow = sheet.getLastRow();
  if (lastRow <= 2) return [];

  const maxCol = Math.max(8, sheet.getLastColumn());
  const values = sheet.getRange(3, 2, lastRow - 2, maxCol - 1).getValues();
  const tz = Session.getScriptTimeZone() || 'Asia/Bangkok';

  const surveys = [];
  for (let i = 0; i < values.length; i++) {
    const r = values[i];
    const rawDate = r[0];
    const empId = String(r[1] || '').trim();
    const empName = String(r[2] || '').trim();
    const line = String(r[3] || '').trim();
    const scoreVal = r[4];
    const note = String(r[5] || '').trim();
    const detailsJson = String(r[6] || '').trim();

    if (!empId && !empName && (scoreVal === '' || scoreVal === null)) continue;

    let dateStr = '';
    if (rawDate instanceof Date) {
      dateStr = Utilities.formatDate(rawDate, tz, 'yyyy-MM-dd');
    } else if (rawDate) {
      const str = String(rawDate).trim();
      if (/^\\d{1,2}\\/\\d{1,2}\\/\\d{4}$/.test(str)) {
        const parts = str.split('/');
        dateStr = parts[2] + '-' + parts[0].padStart(2, '0') + '-' + parts[1].padStart(2, '0');
      } else {
        dateStr = str.slice(0, 10);
      }
    }

    let extra = {};
    try { extra = detailsJson ? JSON.parse(detailsJson) : {}; } catch (e) { extra = {}; }

    const totalScore = Number(scoreVal) || 0;
    const maxScore = Number(extra.max_score) || 10;
    const pct = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    surveys.push({
      survey_id: extra.survey_id || ('SV-ROW-' + (i + 3)),
      date: dateStr,
      timestamp: extra.timestamp || dateStr,
      employee_id: empId || '-',
      employee_name: empName || empId || '-',
      line: line || 'FA-Line 1',
      auditor: extra.auditor || '',
      total_score: totalScore,
      max_score: maxScore,
      percentage: pct,
      answers: extra.answers || {},
      note: note
    });
  }
  return surveys;
}

function appendSurveyRow(s) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_SURVEYS);
  const now = new Date();
  const tz = Session.getScriptTimeZone() || 'Asia/Bangkok';
  const dateStr = s.date || Utilities.formatDate(now, tz, 'yyyy-MM-dd');
  const surveyId = s.survey_id || ('SV-' + now.getTime());

  const detailsObj = {
    survey_id: surveyId,
    timestamp: now.toISOString(),
    auditor: s.auditor || '',
    max_score: Number(s.max_score) || 10,
    percentage: Number(s.percentage) || 0,
    answers: s.answers || {}
  };

  const lastRow = Math.max(2, sheet.getLastRow());
  let targetRow = lastRow + 1;
  if (lastRow >= 3) {
    const checkRange = sheet.getRange(3, 2, lastRow - 2, 5).getValues();
    for (let i = 0; i < checkRange.length; i++) {
      const empIdCell = String(checkRange[i][1] || '').trim();
      const nameCell = String(checkRange[i][2] || '').trim();
      const scoreCell = String(checkRange[i][4] || '').trim();
      if (!empIdCell && !nameCell && !scoreCell) {
        targetRow = i + 3;
        break;
      }
    }
  }

  sheet.getRange(targetRow, 2, 1, 7).setValues([[
    dateStr,
    s.employee_id || '',
    s.employee_name || '',
    s.line || '',
    Number(s.total_score) || 0,
    s.note || '',
    JSON.stringify(detailsObj)
  ]]);

  return { ...s, survey_id: surveyId, date: dateStr };
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}`;

/**
 * ============================================================================
 * SETTINGS & GOOGLE APPS SCRIPT CONNECTION MODAL
 * ============================================================================
 */
function openSettingsModal() {
  const modal = document.getElementById('settings-modal');
  const input = document.getElementById('input-gas-url');
  const codeBlock = document.getElementById('embedded-gas-code');
  if (input) input.value = state.gasUrl;
  if (codeBlock) codeBlock.textContent = EMBEDDED_APPS_SCRIPT_CODE;
  if (modal) modal.classList.remove('hidden');
}

function closeSettingsModal() {
  const modal = document.getElementById('settings-modal');
  if (modal) modal.classList.add('hidden');
}

async function saveSettingsModal() {
  const input = document.getElementById('input-gas-url');
  if (input) {
    state.gasUrl = input.value.trim();
    localStorage.setItem(STORAGE_KEYS.GAS_URL, state.gasUrl);
  }
  closeSettingsModal();
  await syncFromGoogleSheets(false);
}

/**
 * คัดลอกโค้ด Apps Script ที่ฝังอยู่ในระบบได้ทันที (ไม่ต้องโหลดไฟล์แยก)
 */
async function copyAppsScriptCode() {
  const t = I18N[state.lang] || I18N.th;
  try {
    await navigator.clipboard.writeText(EMBEDDED_APPS_SCRIPT_CODE);
    showToast(t.msg_copied_gas, 'success');
  } catch (e) {
    const textarea = document.createElement('textarea');
    textarea.value = EMBEDDED_APPS_SCRIPT_CODE;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast(t.msg_copied_gas, 'success');
  }
}

/**
 * Helper Utilities
 */
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const bg = type === 'error'
    ? 'bg-rose-600 text-white'
    : type === 'info'
      ? 'bg-slate-800 text-white'
      : 'bg-teal-700 text-white';

  const toast = document.createElement('div');
  toast.className = `${bg} px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 transition-all duration-300`;
  toast.innerHTML = `<span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
