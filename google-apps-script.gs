const SPREADSHEET_ID = '1TnUJxij2NXL05-TKsQJcDgY1Sf_apnRGgM4-4uSssvA';
const SYNC_TOKEN = 'REPLACE_WITH_YOUR_OWN_LONG_RANDOM_TOKEN';
const SHEET_NAME = 'Unity Coach Data';

function doGet(e) {
  const p = (e && e.parameter) || {};
  const callback = String(p.callback || '');
  if (!/^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback)) {
    return ContentService.createTextOutput('Missing or invalid callback.').setMimeType(ContentService.MimeType.TEXT);
  }
  let result;
  try {
    checkToken_(p.token);
    if (p.action !== 'load') throw new Error('Unknown action.');
    result = { ok: true, data: readData_() };
  } catch (err) {
    result = { ok: false, error: String(err.message || err) };
  }
  return ContentService.createTextOutput(callback + '(' + JSON.stringify(result) + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function doPost(e) {
  try {
    const raw = e && e.parameter && e.parameter.payload;
    if (!raw) throw new Error('Missing payload.');
    const payload = JSON.parse(raw);
    checkToken_(payload.token);
    if (payload.action !== 'save') throw new Error('Unknown action.');
    writeData_(payload.data || {});
    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err.message || err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function checkToken_(token) {
  if (!SYNC_TOKEN || SYNC_TOKEN.indexOf('REPLACE_WITH_') === 0) throw new Error('Set SYNC_TOKEN in Apps Script first.');
  if (String(token || '') !== SYNC_TOKEN) throw new Error('Invalid sync token.');
}

function sheet_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.getRange(1, 1, 1, 3).setValues([['key', 'updated_at', 'json_value']]);
    sh.setFrozenRows(1);
  }
  return sh;
}

function readData_() {
  const sh = sheet_();
  const values = sh.getDataRange().getValues();
  const out = { _hasData: values.length > 1 };
  for (let i = 1; i < values.length; i++) {
    const key = String(values[i][0] || '');
    const raw = String(values[i][2] || '');
    if (!key || !raw) continue;
    try {
      const value = JSON.parse(raw);
      if (key === 'meta') Object.assign(out, value);
      else if (key.indexOf('chat:') === 0) (out.chat || (out.chat = [])).push(value);
      else if (key.indexOf('note:') === 0) (out.notes || (out.notes = [])).push(value);
    } catch (err) {}
  }
  out.chat = out.chat || [];
  out.notes = out.notes || [];
  out.chat.sort((a, b) => Number(a.at || 0) - Number(b.at || 0));
  return out;
}

function writeData_(data) {
  const sh = sheet_();
  const now = new Date().toISOString();
  const rows = [['key', 'updated_at', 'json_value']];
  const meta = {
    memory: String(data.memory || ''),
    model: String(data.model || 'gemini-2.5-flash'),
    talkStyle: String(data.talkStyle || 'clear'),
    customInstructions: String(data.customInstructions || ''),
    codeMode: String(data.codeMode || 'hints'),
    detailLevel: String(data.detailLevel || 'balanced')
  };
  rows.push(['meta', now, JSON.stringify(meta)]);
  (Array.isArray(data.notes) ? data.notes : []).forEach((note, i) => {
    rows.push(['note:' + String(note.id || i), now, JSON.stringify(note)]);
  });
  (Array.isArray(data.chat) ? data.chat : []).forEach((message, i) => {
    rows.push(['chat:' + String(message.at || i) + ':' + i, now, JSON.stringify(message)]);
  });
  if (rows.length > sh.getMaxRows()) sh.insertRowsAfter(sh.getMaxRows(), rows.length - sh.getMaxRows());
  sh.clearContents();
  sh.getRange(1, 1, rows.length, 3).setValues(rows);
  sh.setFrozenRows(1);
  sh.getRange(1, 1, 1, 3).setFontWeight('bold');
}

function testConnection() {
  const data = readData_();
  Logger.log('Connected to spreadsheet. Chat messages: ' + data.chat.length + '; notes: ' + data.notes.length);
}