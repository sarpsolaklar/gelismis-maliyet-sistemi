const fs = require('fs');
let indexHtml = fs.readFileSync('index.html', 'utf-8');

const selectA = '<select id="compareSelectA" class="class-input" style="width: 100%; margin-bottom: 2rem;"></select>';
const listA = '<div id="compareListA" class="compare-checkbox-list" style="max-height: 150px; overflow-y: auto; background: rgba(0, 0, 0, 0.2); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 10px; margin-bottom: 2rem; display: flex; flex-direction: column; gap: 8px;"></div>';
indexHtml = indexHtml.replace(selectA, listA);

const selectB = '<select id="compareSelectB" class="class-input" style="width: 100%; margin-bottom: 2rem;"></select>';
const listB = '<div id="compareListB" class="compare-checkbox-list" style="max-height: 150px; overflow-y: auto; background: rgba(0, 0, 0, 0.2); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 10px; margin-bottom: 2rem; display: flex; flex-direction: column; gap: 8px;"></div>';
indexHtml = indexHtml.replace(selectB, listB);

if (!indexHtml.includes('.compare-checkbox-list label')) {
    const cssToInject = `
    .compare-checkbox-list label { display: flex; align-items: center; gap: 10px; cursor: pointer; color: var(--text-primary); font-size: 0.9rem; }
    .compare-checkbox-list input[type="checkbox"] { accent-color: var(--accent-1); width: 16px; height: 16px; cursor: pointer; }
    `;
    indexHtml = indexHtml.replace('</style>', cssToInject + '\n</style>');
}
indexHtml = indexHtml.replace(/script\.js\?v=\d+/, 'script.js?v=145');
fs.writeFileSync('index.html', indexHtml);
console.log("index.html updated successfully.");
