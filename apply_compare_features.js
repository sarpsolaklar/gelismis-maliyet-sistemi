const fs = require('fs');
let code = fs.readFileSync('script.js', 'utf-8');

// 1. Inject getVarianceHtml before renderCompareResults
const getVarianceHtml = `
    function getVarianceHtml(current, previous, isExpense = false) {
        if (!previous || previous === 0) return '';
        const diff = current - previous;
        const percent = (diff / Math.abs(previous)) * 100;
        
        let color;
        if (diff > 0) {
            color = isExpense ? 'var(--danger)' : 'var(--success)';
        } else if (diff < 0) {
            color = isExpense ? 'var(--success)' : 'var(--danger)';
        } else {
            color = 'var(--text-secondary)';
        }
        
        const sign = diff > 0 ? '+' : '';
        return \`<span style="color: \${color}; font-size: 0.75rem; margin-left: 8px; font-weight: bold; background: rgba(0,0,0,0.2); padding: 2px 6px; border-radius: 4px;">\${sign}%\${Math.abs(percent).toFixed(1)}</span>\`;
    }

`;

const renderCompareStart = code.indexOf('function renderCompareResults(');
code = code.substring(0, renderCompareStart) + getVarianceHtml + code.substring(renderCompareStart);

// 2. Replace renderCompareResults
const newRenderCompareStart = code.indexOf('function renderCompareResults(');
const renderCompareEnd = code.indexOf('function updateComparison() {', newRenderCompareStart);

const newRenderCompare = `function renderCompareResults(scenarioKeys, container, branchFilter = 'ALL', baseTotals = null) {
        if (!scenarioKeys || scenarioKeys.length === 0) {
            container.innerHTML = '<p style="opacity:0.7;">Lütfen en az bir dönem seçin</p>';
            return null;
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
                    if (branchFilter !== 'ALL' && branch.name !== branchFilter) return;
                    
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

        const currentTotals = {
            totalCiro, brutKar, totalHammadde, totalIscilik, totalEsitIscilik, 
            totalDirektIscilik, totalGUG, totalPazarlama, totalYonetim, 
            totalArge, totalFinansman, faaliyetKari, netKar, netMaliyet
        };

        const varHtml = (key, isExpense = false) => {
            if (!baseTotals) return '';
            return getVarianceHtml(currentTotals[key], baseTotals[key], isExpense);
        };

        const netMaliyetText = numberToTurkishText(netMaliyet);
        const netKarText = (netKar < 0 ? "Eksi " : "") + numberToTurkishText(Math.abs(netKar));
        const faaliyetKariText = (faaliyetKari < 0 ? "Eksi " : "") + numberToTurkishText(Math.abs(faaliyetKari));
        const brutKarText = (brutKar < 0 ? "Eksi " : "") + numberToTurkishText(Math.abs(brutKar));

        const html = \`
            <div class="result-row total">
                <span style="margin-top: 4px;">Toplam Satış Geliri (Ciro):</span>
                <div style="display: flex; flex-direction: column; align-items: flex-end;">
                    <span style="color: var(--success); font-weight: 600; display: flex; align-items: center;">\${formatCurrency(totalCiro)} \${varHtml('totalCiro', false)}</span>
                    <span style="font-size: 0.75rem; color: var(--text-secondary); opacity: 0.8; font-weight: normal; margin-top: 2px;">(\${numberToTurkishText(totalCiro)})</span>
                </div>
            </div>
            
            <div class="result-row total accordion-header" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('active')" style="margin-top: 0.5rem; border-left-color: var(--success); background: linear-gradient(90deg, rgba(16, 185, 129, 0.1) 0%, transparent 100%); align-items: flex-start; cursor: pointer;">
                <span style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">Brüt Kâr: <span class="chevron">▼</span></span>
                <div style="display: flex; flex-direction: column; align-items: flex-end;">
                    <span style="color: \${brutKar >= 0 ? 'var(--success)' : 'var(--danger)'}; display: flex; align-items: center;">\${formatWithPercent(brutKar, netMaliyet)} \${varHtml('brutKar', false)}</span>
                    <span style="font-size: 0.75rem; color: var(--text-secondary); opacity: 0.8; font-weight: normal; margin-top: 2px;">(\${brutKarText})</span>
                </div>
            </div>
            <div class="accordion-content">
                <div class="result-row" style="padding-left: 1rem;">
                    <span>Hammadde Toplamı:</span>
                    <span style="display: flex; align-items: center;">\${formatWithPercent(totalHammadde, netMaliyet)} \${varHtml('totalHammadde', true)}</span>
                </div>
                
                <div class="result-row accordion-header" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('active')" style="padding-left: 1rem; cursor: pointer;">
                    <span style="display: flex; align-items: center; gap: 8px;">Toplam İşçilik Payı: <span class="chevron">▼</span></span>
                    <span style="color: var(--warning); display: flex; align-items: center;">\${formatWithPercent(totalIscilik, netMaliyet)} \${varHtml('totalIscilik', true)}</span>
                </div>
                <div class="accordion-content">
                    <div class="result-row" style="padding-left: 2rem;">
                        <span>Eşit Dağıtılan İşçilik Payı:</span>
                        <span style="color: var(--warning); display: flex; align-items: center;">\${formatWithPercent(totalEsitIscilik, netMaliyet)} \${varHtml('totalEsitIscilik', true)}</span>
                    </div>
                    <div class="result-row" style="padding-left: 2rem;">
                        <span>Direkt İşçilik Maliyeti:</span>
                        <span style="color: var(--warning); display: flex; align-items: center;">\${formatWithPercent(totalDirektIscilik, netMaliyet)} \${varHtml('totalDirektIscilik', true)}</span>
                    </div>
                </div>
                
                <div class="result-row" style="padding-left: 1rem;">
                    <span>Genel Üretim Gideri Payı:</span>
                    <span style="color: var(--accent-4); display: flex; align-items: center;">\${formatWithPercent(totalGUG, netMaliyet)} \${varHtml('totalGUG', true)}</span>
                </div>
            </div>

            <div class="result-row total accordion-header" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('active')" style="margin-top: 0.5rem; border-left-color: var(--accent-1); background: linear-gradient(90deg, rgba(56, 189, 248, 0.1) 0%, transparent 100%); align-items: flex-start; cursor: pointer;">
                <span style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">Faaliyet Kârı: <span class="chevron">▼</span></span>
                <div style="display: flex; flex-direction: column; align-items: flex-end;">
                    <span style="color: \${faaliyetKari >= 0 ? 'var(--success)' : 'var(--danger)'}; display: flex; align-items: center;">\${formatWithPercent(faaliyetKari, netMaliyet)} \${varHtml('faaliyetKari', false)}</span>
                    <span style="font-size: 0.75rem; color: var(--text-secondary); opacity: 0.8; font-weight: normal; margin-top: 2px;">(\${faaliyetKariText})</span>
                </div>
            </div>
            <div class="accordion-content">
                <div class="result-row" style="padding-left: 1rem;">
                    <span>Pazarlama Gideri Payı:</span>
                    <span style="color: var(--accent-1); display: flex; align-items: center;">\${formatWithPercent(totalPazarlama, netMaliyet)} \${varHtml('totalPazarlama', true)}</span>
                </div>
                <div class="result-row" style="padding-left: 1rem;">
                    <span>Genel Yönetim Gideri Payı:</span>
                    <span style="color: var(--accent-1); display: flex; align-items: center;">\${formatWithPercent(totalYonetim, netMaliyet)} \${varHtml('totalYonetim', true)}</span>
                </div>
                <div class="result-row" style="padding-left: 1rem;">
                    <span>AR-GE Gideri Payı:</span>
                    <span style="color: var(--accent-1); display: flex; align-items: center;">\${formatWithPercent(totalArge, netMaliyet)} \${varHtml('totalArge', true)}</span>
                </div>
            </div>

            <div class="result-row total accordion-header open" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('active')" style="margin-top: 1rem; border-left-color: #8b5cf6; background: linear-gradient(90deg, rgba(139, 92, 246, 0.1) 0%, transparent 100%); align-items: flex-start; cursor: pointer;">
                <span style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">Net Kâr: <span class="chevron">▼</span></span>
                <div style="display: flex; flex-direction: column; align-items: flex-end;">
                    <span style="color: \${netKar >= 0 ? 'var(--success)' : 'var(--danger)'}; display: flex; align-items: center;">\${formatWithPercent(netKar, netMaliyet)} \${varHtml('netKar', false)}</span>
                    <span style="font-size: 0.75rem; color: var(--text-secondary); opacity: 0.8; font-weight: normal; margin-top: 2px;">(\${netKarText})</span>
                </div>
            </div>
            <div class="accordion-content active">
                <div class="result-row" style="padding-left: 1rem;">
                    <span>Finansman (Gelir/Gider) Payı:</span>
                    <span style="color: \${totalFinansman < 0 ? 'var(--success)' : 'var(--danger)'}; display: flex; align-items: center;">\${formatWithPercent(totalFinansman, netMaliyet)} \${varHtml('totalFinansman', true)}</span>
                </div>
                <div style="font-size: 0.75rem; color: var(--text-secondary); opacity: 0.7; margin-top: 4px; padding-right: 10px; text-align: right;">ℹ Finansman kalemi Net Maliyet hesaplamasından bağımsız olduğu için oranların toplamı %100\\'ü aşabilir.</div>
            </div>

            <div class="result-row total" style="background: linear-gradient(90deg, rgba(236, 72, 153, 0.1) 0%, transparent 100%); border-left-color: var(--accent-2); align-items: flex-start; margin-top: 1rem;">
                <span style="margin-top: 4px;">Net Maliyet:</span>
                <div style="display: flex; flex-direction: column; align-items: flex-end;">
                    <span style="display: flex; align-items: center;">\${formatCurrency(netMaliyet)} \${varHtml('netMaliyet', true)}</span>
                    <span style="font-size: 0.75rem; color: var(--text-secondary); opacity: 0.8; font-weight: normal; margin-top: 2px;">(\${netMaliyetText})</span>
                </div>
            </div>
        \`;

        container.innerHTML = html;
        return currentTotals;
    }

    `;

code = code.substring(0, newRenderCompareStart) + newRenderCompare + code.substring(renderCompareEnd);

// 3. Update updateComparison
const updateCompStart = code.indexOf('function updateComparison() {');
const updateCompEnd = code.indexOf('}', updateCompStart) + 1;

const newUpdateComp = `function updateComparison() {
        const listA = document.getElementById('compareListA');
        const listB = document.getElementById('compareListB');
        const branchSelect = document.getElementById('compareBranchSelect');
        
        if (!listA || !listB) return;
        
        const selectedA = Array.from(listA.querySelectorAll('input:checked')).map(cb => cb.value);
        const selectedB = Array.from(listB.querySelectorAll('input:checked')).map(cb => cb.value);
        const branchFilter = branchSelect ? branchSelect.value : 'ALL';
        
        const totalsA = renderCompareResults(selectedA, compareResultsA, branchFilter, null);
        renderCompareResults(selectedB, compareResultsB, branchFilter, totalsA);
    }`;

code = code.substring(0, updateCompStart) + newUpdateComp + code.substring(updateCompEnd);

// 4. Inject updateCompareBranchSelect logic inside btnCompareScenarios.addEventListener('click')
// Find: const listA = document.getElementById('compareListA'); inside the click listener
const btnClickStart = code.indexOf("btnCompareScenarios.addEventListener('click', () => {");
const injectPoint = code.indexOf("const listA = document.getElementById('compareListA');", btnClickStart);

const branchFilterInject = `
            const branchSelect = document.getElementById('compareBranchSelect');
            if (branchSelect) {
                const currentSelection = branchSelect.value;
                branchSelect.innerHTML = '<option value="ALL">Tüm Fabrika (Genel Özet)</option>';
                const uniqueBranches = new Set();
                Object.values(scenarios).forEach(s => {
                    if (s.branchData) {
                        s.branchData.forEach(b => uniqueBranches.add(b.name));
                    }
                });
                Array.from(uniqueBranches).sort().forEach(bName => {
                    const opt = document.createElement('option');
                    opt.value = bName;
                    opt.textContent = bName;
                    branchSelect.appendChild(opt);
                });
                if (uniqueBranches.has(currentSelection)) {
                    branchSelect.value = currentSelection;
                }
            }
            `;

code = code.substring(0, injectPoint) + branchFilterInject + code.substring(injectPoint);

// Add listener for compareBranchSelect if not already present
const listenerInject = `
        if (document.getElementById('compareBranchSelect')) {
            document.getElementById('compareBranchSelect').addEventListener('change', updateComparison);
        }
`;
const afterListenerInjectPoint = code.indexOf('updateComparison();', btnClickStart) + 'updateComparison();'.length;
code = code.substring(0, afterListenerInjectPoint) + listenerInject + code.substring(afterListenerInjectPoint);

fs.writeFileSync('script.js', code);
console.log('script.js updated successfully!');
