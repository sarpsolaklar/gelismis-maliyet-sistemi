const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const html = fs.readFileSync('index.html', 'utf-8');

const virtualConsole = new jsdom.VirtualConsole();
virtualConsole.sendTo(console);

const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable', virtualConsole });
dom.window.Sortable = function() {};
dom.window.Sortable.create = function() {};
dom.window.html2pdf = function() { return { set: function(){ return this; }, from: function(){ return this; }, save: function(){} }; };
dom.window.XLSX = { utils: { book_new: function(){}, aoa_to_sheet: function(){}, book_append_sheet: function(){} }, writeFile: function(){} };

dom.window.addEventListener('load', () => {
    setTimeout(() => {
        const results = dom.window.document.getElementById('factorySummaryResults').innerHTML;
        console.log("--- RESULTS ---");
        console.log(results);
    }, 1000);
});
