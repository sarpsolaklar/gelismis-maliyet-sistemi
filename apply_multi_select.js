const fs = require('fs');

// --- UPDATE index.html ---
let indexHtml = fs.readFileSync('index.html', 'utf-8');

const selectA = '<select id="compareSelectA" class="class-input" style="width: 100%; margin-bottom: 2rem;"></select>';
const listA = '<div id="compareListA" class="compare-checkbox-list" style="max-height: 150px; overflow-y: auto; background: rgba(0, 0, 0, 0.2); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 10px; margin-bottom: 2rem; display: flex; flex-direction: column; gap: 8px;"></div>';
indexHtml = indexHtml.replace(selectA, listA);

const selectB = '<select id="compareSelectB" class="class-input" style="width: 100%; margin-bottom: 2rem;"></select>';
const listB = '<div id="compareListB" class="compare-checkbox-list" style="max-height: 150px; overflow-y: auto; background: rgba(0, 0, 0, 0.2); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 10px; margin-bottom: 2rem; display: flex; flex-direction: column; gap: 8px;"></div>';
indexHtml = indexHtml.replace(selectB, listB);

// Inject some quick CSS for the checkboxes if not there
if (!indexHtml.includes('.compare-checkbox-list label')) {
    const cssToInject = `
    .compare-checkbox-list label { display: flex; align-items: center; gap: 10px; cursor: pointer; color: var(--text-primary); font-size: 0.9rem; }
    .compare-checkbox-list input[type="checkbox"] { accent-color: var(--accent-1); width: 16px; height: 16px; cursor: pointer; }
    `;
    indexHtml = indexHtml.replace('</style>', cssToInject + '\n</style>');
}
indexHtml = indexHtml.replace(/script\.js\?v=\d+/, 'script.js?v=143');
fs.writeFileSync('index.html', indexHtml);
console.log('index.html updated');

// --- UPDATE script.js ---
let scriptJs = fs.readFileSync('script.js', 'utf-8');

// 1. Remove old event listeners
scriptJs = scriptJs.replace("document.getElementById('compareSelectA').addEventListener('change', calculateComparison);", "");
scriptJs = scriptJs.replace("document.getElementById('compareSelectB').addEventListener('change', calculateComparison);", "");

// 2. Update updateCompareSelects
const oldUpdateSelectsStart = scriptJs.indexOf('function updateCompareSelects()');
const oldUpdateSelectsEnd = scriptJs.indexOf('}', oldUpdateSelectsStart) + 1;
const newUpdateSelects = `function updateCompareSelects() {
    const listA = document.getElementById('compareListA');
    const listB = document.getElementById('compareListB');
    if (!listA || !listB) return;
    
    let html = '';
    Object.values(scenarios).forEach(s => {
        html += \`<label><input type="checkbox" value="\${s.id}" onchange="calculateComparison()"> \${s.name}</label>\`;
    });
    
    listA.innerHTML = html;
    listB.innerHTML = html;
}`;
scriptJs = scriptJs.substring(0, oldUpdateSelectsStart) + newUpdateSelects + scriptJs.substring(oldUpdateSelectsEnd);

// 3. Update calculateComparison
const oldCalculateStart = scriptJs.indexOf('function calculateComparison()');
const oldCalculateEnd = scriptJs.indexOf('}', oldCalculateStart) + 1;
const newCalculate = `function calculateComparison() {
    const listA = document.getElementById('compareListA');
    const listB = document.getElementById('compareListB');
    if (!listA || !listB) return;
    
    const selectedA = Array.from(listA.querySelectorAll('input:checked')).map(cb => cb.value);
    const selectedB = Array.from(listB.querySelectorAll('input:checked')).map(cb => cb.value);
    
    renderCompareResults(selectedA, document.getElementById('compareResultsA'));
    renderCompareResults(selectedB, document.getElementById('compareResultsB'));
}`;
scriptJs = scriptJs.substring(0, oldCalculateStart) + newCalculate + scriptJs.substring(oldCalculateEnd);

// 4. Update renderCompareResults
const renderCompareStart = scriptJs.indexOf('function renderCompareResults(');
const renderCompareEnd = scriptJs.indexOf('document.getElementById(\'factorySummaryResults\').innerHTML = html;', renderCompareStart); 
// Wait, renderCompareResults doesn't use factorySummaryResults! It uses `container.innerHTML = html;`
const endOfRenderCompare = scriptJs.indexOf('container.innerHTML = html;', renderCompareStart) + 'container.innerHTML = html;'.length;

const newRenderCompare = `function renderCompareResults(scenarioKeys, container) {
    if (!scenarioKeys || scenarioKeys.length === 0) {
        container.innerHTML = '<p style="opacity:0.7;">Lütfen dönem seçin</p>';
        return;
    }

    let totalHammadde = 0;
    let totalEsitIscilik = 0;
    let totalDirektIscilik = 0;
    let totalGUG = 0;
    let totalPazarlama = 0;
    let totalYonetim = 0;
    let totalArge = 0;
    let totalFinansman = 0;
    let totalCiro = 0;
    let brutKar = 0;

    scenarioKeys.forEach(scenarioKey => {
        const s = scenarios[scenarioKey];
        if (s && s.branchData) {
            s.branchData.forEach(branch => {
                totalHammadde += branch.branchBaseTotal || 0;
                totalEsitIscilik += branch.branchShare || 0;
                totalDirektIscilik += branch.laborCost || 0;
                totalGUG += branch.branchGUG || 0;
                totalPazarlama += branch.branchPazarlama || 0;
                totalYonetim += branch.branchYonetim || 0;
                totalArge += branch.branchArge || 0;
                totalFinansman += branch.branchFinansman || 0;
                brutKar += branch.branchTotalProfit || 0;
                if (branch.subClasses) {
                    branch.subClasses.forEach(cls => {
                        totalCiro += (cls.quantity || 0) * (cls.salePrice || 0);
                    });
                }
            });
        }
    });

    const totalIscilik = totalEsitIscilik + totalDirektIscilik;
    const totalFaaliyet = totalPazarlama + totalYonetim + totalArge;
    const netMaliyet = totalHammadde + totalEsitIscilik + totalDirektIscilik + totalGUG + totalPazarlama + totalYonetim + totalArge;

    const netKar = brutKar - totalFaaliyet - totalFinansman;
    const faaliyetKari = brutKar - totalFaaliyet;

    const netMaliyetText = numberToTurkishText(netMaliyet);
    const netKarText = (netKar < 0 ? "Eksi " : "") + numberToTurkishText(Math.abs(netKar));
    const faaliyetKariText = (faaliyetKari < 0 ? "Eksi " : "") + numberToTurkishText(Math.abs(faaliyetKari));
    const brutKarText = (brutKar < 0 ? "Eksi " : "") + numberToTurkishText(Math.abs(brutKar));

    const html = \`
        <div class="result-row total">
            <span style="margin-top: 4px;">Toplam Satış Geliri (Ciro):</span>
            <div style="display: flex; flex-direction: column; align-items: flex-end;">
                <span style="color: var(--success); font-weight: 600;">\${formatCurrency(totalCiro)}</span>
                <span style="font-size: 0.75rem; color: var(--text-secondary); opacity: 0.8; font-weight: normal; margin-top: 2px;">(\${numberToTurkishText(totalCiro)})</span>
            </div>
        </div>
        
        <div class="result-row total accordion-header" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('active')" style="margin-top: 0.5rem; border-left-color: var(--success); background: linear-gradient(90deg, rgba(16, 185, 129, 0.1) 0%, transparent 100%); align-items: flex-start; cursor: pointer;">
            <span style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">Brüt Kâr: <span class="chevron">▼</span></span>
            <div style="display: flex; flex-direction: column; align-items: flex-end;">
                <span style="color: \${brutKar >= 0 ? 'var(--success)' : 'var(--danger)'};">\${formatWithPercent(brutKar, netMaliyet)}</span>
                <span style="font-size: 0.75rem; color: var(--text-secondary); opacity: 0.8; font-weight: normal; margin-top: 2px;">(\${brutKarText})</span>
            </div>
        </div>
        <div class="accordion-content">
            <div class="result-row" style="padding-left: 1rem;">
                <span>Hammadde Toplamı:</span>
                <span>\${formatWithPercent(totalHammadde, netMaliyet)}</span>
            </div>
            
            <div class="result-row accordion-header" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('active')" style="padding-left: 1rem; cursor: pointer;">
                <span style="display: flex; align-items: center; gap: 8px;">Toplam İşçilik Payı: <span class="chevron">▼</span></span>
                <span style="color: var(--warning);">\${formatWithPercent(totalIscilik, netMaliyet)}</span>
            </div>
            <div class="accordion-content">
                <div class="result-row" style="padding-left: 2rem;">
                    <span>Eşit Dağıtılan İşçilik Payı:</span>
                    <span style="color: var(--warning);">\${formatWithPercent(totalEsitIscilik, netMaliyet)}</span>
                </div>
                <div class="result-row" style="padding-left: 2rem;">
                    <span>Direkt İşçilik Maliyeti:</span>
                    <span style="color: var(--warning);">\${formatWithPercent(totalDirektIscilik, netMaliyet)}</span>
                </div>
            </div>
            
            <div class="result-row" style="padding-left: 1rem;">
                <span>Genel Üretim Gideri Payı:</span>
                <span style="color: var(--accent-4);">\${formatWithPercent(totalGUG, netMaliyet)}</span>
            </div>
        </div>

        <div class="result-row total accordion-header" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('active')" style="margin-top: 0.5rem; border-left-color: var(--accent-1); background: linear-gradient(90deg, rgba(56, 189, 248, 0.1) 0%, transparent 100%); align-items: flex-start; cursor: pointer;">
            <span style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">Faaliyet Kârı: <span class="chevron">▼</span></span>
            <div style="display: flex; flex-direction: column; align-items: flex-end;">
                <span style="color: \${faaliyetKari >= 0 ? 'var(--success)' : 'var(--danger)'};">\${formatWithPercent(faaliyetKari, netMaliyet)}</span>
                <span style="font-size: 0.75rem; color: var(--text-secondary); opacity: 0.8; font-weight: normal; margin-top: 2px;">(\${faaliyetKariText})</span>
            </div>
        </div>
        <div class="accordion-content">
            <div class="result-row" style="padding-left: 1rem;">
                <span>Pazarlama Gideri Payı:</span>
                <span style="color: var(--accent-1);">\${formatWithPercent(totalPazarlama, netMaliyet)}</span>
            </div>
            <div class="result-row" style="padding-left: 1rem;">
                <span>Genel Yönetim Gideri Payı:</span>
                <span style="color: var(--accent-1);">\${formatWithPercent(totalYonetim, netMaliyet)}</span>
            </div>
            <div class="result-row" style="padding-left: 1rem;">
                <span>AR-GE Gideri Payı:</span>
                <span style="color: var(--accent-1);">\${formatWithPercent(totalArge, netMaliyet)}</span>
            </div>
        </div>

        <div class="result-row total accordion-header open" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('active')" style="margin-top: 1rem; border-left-color: #8b5cf6; background: linear-gradient(90deg, rgba(139, 92, 246, 0.1) 0%, transparent 100%); align-items: flex-start; cursor: pointer;">
            <span style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">Net Kâr: <span class="chevron">▼</span></span>
            <div style="display: flex; flex-direction: column; align-items: flex-end;">
                <span style="color: \${netKar >= 0 ? 'var(--success)' : 'var(--danger)'};">\${formatWithPercent(netKar, netMaliyet)}</span>
                <span style="font-size: 0.75rem; color: var(--text-secondary); opacity: 0.8; font-weight: normal; margin-top: 2px;">(\${netKarText})</span>
            </div>
        </div>
        <div class="accordion-content active">
            <div class="result-row" style="padding-left: 1rem;">
                <span>Finansman (Gelir/Gider) Payı:</span>
                <span style="color: \${totalFinansman < 0 ? 'var(--success)' : 'var(--danger)'};">\${formatWithPercent(totalFinansman, netMaliyet)}</span>
            </div>
            <div style="font-size: 0.75rem; color: var(--text-secondary); opacity: 0.7; margin-top: 4px; padding-right: 10px; text-align: right;">ℹ Finansman kalemi Net Maliyet hesaplamasından bağımsız olduğu için oranların toplamı %100\\'ü aşabilir.</div>
        </div>

        <div class="result-row total" style="background: linear-gradient(90deg, rgba(236, 72, 153, 0.1) 0%, transparent 100%); border-left-color: var(--accent-2); align-items: flex-start; margin-top: 1rem;">
            <span style="margin-top: 4px;">Net Maliyet:</span>
            <div style="display: flex; flex-direction: column; align-items: flex-end;">
                <span>\${formatCurrency(netMaliyet)}</span>
                <span style="font-size: 0.75rem; color: var(--text-secondary); opacity: 0.8; font-weight: normal; margin-top: 2px;">(\${netMaliyetText})</span>
            </div>
        </div>
    \`;

    container.innerHTML = html;`;

scriptJs = scriptJs.substring(0, renderCompareStart) + newRenderCompare + scriptJs.substring(endOfRenderCompare);

// Remove the end brace that might be missing?
// Wait, I replaced from `function renderCompareResults(` up to `container.innerHTML = html;`
// So the `}` of the function is STILL THERE in `scriptJs`!
// Let's verify by checking what comes after `container.innerHTML = html;`
// Usually it is `\n    }\n`

fs.writeFileSync('script.js', scriptJs);
console.log('script.js updated');
