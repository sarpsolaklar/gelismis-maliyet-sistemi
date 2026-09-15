const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

let html = fs.readFileSync('index.html', 'utf-8');
let scriptCode = fs.readFileSync('script.js', 'utf-8');

html = html.replace('<script src="script.js?v=140"></script>', '');

const dom = new JSDOM(html, { runScripts: 'outside-only' });
dom.window.Sortable = { create: () => {} };
dom.window.html2pdf = () => ({ set: () => dom.window.html2pdf(), from: () => dom.window.html2pdf(), save: () => {} });
dom.window.XLSX = { utils: { book_new: () => {}, aoa_to_sheet: () => {}, book_append_sheet: () => {} }, writeFile: () => {} };

const sampleData = [{ branchId: 'B1', branchName: 'Sube', subClasses: [], branchPazarlama: 100 }];
dom.window.localStorage.setItem('celmakData', JSON.stringify(sampleData));
dom.window.localStorage.setItem('celmakScenarios', JSON.stringify([{id:'1', name:'Ocak', data:sampleData}]));
dom.window.localStorage.setItem('activeScenarioId', '1');

dom.window.onerror = function(msg, url, line, col, err) {
    console.error("WINDOW ERROR:", msg, line, col, err ? err.stack : '');
};

dom.window.eval(scriptCode);
