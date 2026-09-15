const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('index.html', 'utf-8');

const virtualConsole = new jsdom.VirtualConsole();
virtualConsole.on("error", (err) => {
  console.error("JSDOM ERROR:", err);
});
virtualConsole.on("jsdomError", (err) => {
  console.error("JSDOM ERROR:", err.message);
});

const dom = new JSDOM(html, {
  runScripts: "dangerously",
  resources: "usable",
  virtualConsole
});

dom.window.addEventListener("load", () => {
    console.log("Window loaded.");
    setTimeout(() => {
        const results = dom.window.document.getElementById('factorySummaryResults').innerHTML;
        if (results.trim() === '') {
            console.log("factorySummaryResults IS EMPTY!");
        } else {
            console.log("factorySummaryResults HAS CONTENT.");
        }
    }, 1000);
});
