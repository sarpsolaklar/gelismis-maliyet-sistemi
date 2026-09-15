const fs = require('fs');
let code = fs.readFileSync('script.js', 'utf-8');
code = code.replace('function renderFactorySummary() {', 'function renderFactorySummary() { try {');
code = code.replace("document.getElementById('factorySummaryResults').innerHTML = html;", "document.getElementById('factorySummaryResults').innerHTML = html; } catch(e) { console.error('RENDER ERROR', e); }");
fs.writeFileSync('script_debug.js', code);
