const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

let html = fs.readFileSync('index.html', 'utf-8');
let scriptCode = fs.readFileSync('script.js', 'utf-8');

// Replace loadData with a try/catch version
scriptCode = scriptCode.replace('function loadData() {', 'function loadData() { try {');
scriptCode = scriptCode.replace('updateGlobalResults();\n}', 'updateGlobalResults(); } catch(e) { console.error("MY_ERROR:", e.stack); } }');

html = html.replace('<script src="script.js?v=140"></script>', '');

const dom = new JSDOM(html, { runScripts: 'dangerously' });
dom.window.Sortable = { create: () => {} };
dom.window.html2pdf = () => ({ set: () => dom.window.html2pdf(), from: () => dom.window.html2pdf(), save: () => {} });
dom.window.XLSX = { utils: { book_new: () => {}, aoa_to_sheet: () => {}, book_append_sheet: () => {} }, writeFile: () => {} };

const sampleData = [{ branchId: 'B1', branchName: 'Sube', subClasses: [], branchPazarlama: 100 }];
dom.window.localStorage.setItem('celmakData', JSON.stringify(sampleData));
dom.window.localStorage.setItem('celmakScenarios', JSON.stringify([{id:'1', name:'Ocak', data:sampleData}]));
dom.window.localStorage.setItem('activeScenarioId', '1');

const scriptEl = dom.window.document.createElement('script');
scriptEl.textContent = scriptCode;
dom.window.document.body.appendChild(scriptEl);
