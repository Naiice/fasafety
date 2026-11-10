/**
 * ============================================================================
 * Final Assembly - Safety Survey | Google Apps Script Backend (Code.gs)
 * ============================================================================
 * Spreadsheet ID: 1bM68aArN9WAbwrvFrKC1hpAy335SSgzZPZBtDp-Znpc
 * URL: https://docs.google.com/spreadsheets/d/1bM68aArN9WAbwrvFrKC1hpAy335SSgzZPZBtDp-Znpc/edit
 *
 * รองรับการทำงาน 2 รูปแบบ:
 * 1. เป็น Backend API ให้กับเว็บแอพบน GitHub Pages (ผ่าน doGet / doPost)
 * 2. รันหน้าเว็บแอพโดยตรงผ่าน google.script.run (หากสร้างไฟล์ index.html ใน Apps Script)
 * ============================================================================
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
  if (!qSheet) {
    qSheet = ss.insertSheet(SHEET_QUESTIONS);
  }

  let sSheet = ss.getSheetByName(SHEET_SURVEYS);
  if (!sSheet) {
    sSheet = ss.insertSheet(SHEET_SURVEYS);
    sSheet.getRange('B2:H2').setValues([[
      'Date', 'Employee ID', 'Name', 'Line', 'Score', 'Note', 'Details_JSON'
    ]]).setFontWeight('bold');
  }
  return { status: 'ok', message: 'Sheets ready' };
}

/**
 * รองรับ GET Request จากเว็บแอพ (GitHub Pages / Mobile / Notebook)
 */
function doGet(e) {
  try {
    setupSheets();
    const callback = (e && e.parameter && e.parameter.callback) ? e.parameter.callback : null;

    let resultPayload;
    // รองรับการส่งคำสั่งบันทึก/แก้ไขผ่านพารามิเตอร์ payload (JSONP / GET) เพื่อไม่ให้ติด CORS เวลาเปิดจาก file:// หรือ GitHub Pages
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

/**
 * รองรับ POST Request: เพิ่ม/แก้ไข/ลบคำถามในชีต "Question" และบันทึกคะแนนลงชีต "Survey list"
 */
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

/**
 * ฟังก์ชันกลางสำหรับประมวลผลคำสั่ง (รองรับทั้ง doPost และ google.script.run)
 */
function processActionPayload(payload) {
  setupSheets();
  const action = payload.action;

  if (action === 'getAll') {
    return {
      status: 'ok',
      questions: getQuestionsData(),
      surveys: getSurveysData()
    };
  }

  if (action === 'saveQuestion') {
    saveQuestionToSheet(payload.question, payload.allQuestions);
    return { status: 'ok', questions: getQuestionsData() };
  }

  if (action === 'deleteQuestion') {
    if (Array.isArray(payload.allQuestions)) {
      writeQuestionsTable(payload.allQuestions);
    }
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

/**
 * อ่านข้อมูลคำถามจากชีต "Question" (คอลัมน์ B = Category/คำถามไทย, C = Score, D = จีน, E = พม่า)
 */
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
  if (idx !== -1) {
    currentList[idx] = question;
  } else {
    currentList.push(question);
  }
  writeQuestionsTable(currentList);
}

function writeQuestionsTable(questions) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_QUESTIONS);
  const lastRow = sheet.getLastRow();
  if (lastRow >= 2) {
    sheet.getRange(2, 2, Math.max(12, lastRow), 4).clearContent();
  }

  const rows = [
    ['Category', 'Score', 'Question_ZH (中文)', 'Question_MY (မြန်မာ)']
  ];

  const grouped = {};
  const categoryOrder = [];
  questions.forEach(q => {
    if (q.active === false) return;
    const cat = q.category || 'หมวดทั่วไป';
    if (!grouped[cat]) {
      grouped[cat] = {
        cat_th: cat,
        cat_zh: q.category_zh || cat,
        cat_my: q.category_my || cat,
        items: [],
        sumScore: 0
      };
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
      rows.push([
        q.text_th || '',
        Number(q.max_score) || 1,
        q.text_zh || q.text_th || '',
        q.text_my || q.text_th || ''
      ]);
    });
  });

  rows.push(['', grandTotal, '', '']);
  sheet.getRange(2, 2, rows.length, 4).setValues(rows);
}

/**
 * อ่านข้อมูลจากชีต "Survey list" (B2: Date | Employee ID | Name | Line | Score)
 */
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

    if (!empId && !empName && (scoreVal === '' || scoreVal === null)) {
      continue;
    }

    let dateStr = '';
    if (rawDate instanceof Date) {
      dateStr = Utilities.formatDate(rawDate, tz, 'yyyy-MM-dd');
    } else if (rawDate) {
      const str = String(rawDate).trim();
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
        const parts = str.split('/');
        dateStr = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
      } else {
        dateStr = str.slice(0, 10);
      }
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

    surveys.push({
      survey_id: extra.survey_id || ('SV-ROW-' + (i + 3)),
      date: dateStr,
      timestamp: extra.timestamp || dateStr,
      employee_id: empId || '-',
      employee_name: empName || empId || '-',
      line: line || 'Line1',
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

/**
 * บันทึกผลสำรวจใหม่ลงชีต "Survey list" (B = Date, C = Employee ID, D = Name, E = Line, F = Score)
 */
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

  return {
    ...s,
    survey_id: surveyId,
    date: dateStr
  };
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
