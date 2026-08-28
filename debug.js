const fs = require('fs');
const js = fs.readFileSync('script.js', 'utf8');
const { JSDOM } = require('jsdom');
const dom = new JSDOM(`<html><body>
<div id="branches-container"></div>
<div id="globalNetCost"></div>
<div id="globalNetProfit"></div>
<div id="globalNetTotal"></div>
<select id="scenario-selector"></select>
<button id="btn-new-scenario"></button>
<input id="shared-expense" value="0">
<input id="global-gug" value="0">
<input id="global-pazarlama" value="0">
<input id="global-yonetim" value="0">
<input id="global-arge" value="0">
<input id="global-finansman" value="0">
<input id="rate-usd" value="0">
<input id="rate-eur" value="0">
<div id="total-base-units"></div>
<button id="btn-add-branch"></button>
<button id="btn-back-to-main"></button>
<button id="btn-add-class"></button>
<div id="detail-branch-name"></div>
<div id="detail-shared-expense"></div>
<div id="detailLaborExpense"></div>
<div id="detail-total-base-units"></div>
<div id="detail-dist-multiplier"></div>
<div id="detail-classes-container"></div>
<div id="main-view"></div>
<div id="detail-view"></div>
<button id="btnCompareScenarios"></button>
<button id="btnBackFromCompare"></button>
<div id="comparison-view"></div>
<select id="compareSelectA"></select>
<select id="compareSelectB"></select>
<div id="compareResultsA"></div>
<div id="compareResultsB"></div>
<input id="excelFileInput">
<button id="btnExcel"></button>
<canvas id="costChart"></canvas>
</body></html>`);
global.window = dom.window;
global.document = dom.window.document;
global.localStorage = { getItem: () => null, setItem: () => {} };
global.prompt = () => 'test';
global.alert = () => {};
global.Chart = class { destroy(){} };
try {
  eval(js);
  console.log('Parsed successfully, now simulating DOMContentLoaded...');
  const event = document.createEvent('Event');
  event.initEvent('DOMContentLoaded', true, true);
  document.dispatchEvent(event);
  console.log('DOMContentLoaded fired without errors.');
} catch (e) {
  console.error('ERROR CAUGHT:', e);
}
