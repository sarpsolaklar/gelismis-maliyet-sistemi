const fs = require('fs');

// --- UPDATE index.html ---
let indexHtml = fs.readFileSync('index.html', 'utf-8');

const oldSelectHtml = '<select id="compareBranchSelect" class="class-input" style="width: 100%; max-width: 400px; font-size: 1rem;">';
const newSelectHtml = '<div id="compareClassList" class="compare-checkbox-list" style="max-height: 150px; overflow-y: auto; background: rgba(0, 0, 0, 0.2); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 10px; margin-top: 10px; display: flex; flex-direction: column; gap: 8px;"></div><p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 5px; font-style: italic;">Hiçbir sınıf seçilmezse "Tüm Fabrika" verileri baz alınır.</p>';
// We also need to remove the closing </select> and the <option> inside it.
// Let's replace the whole block carefully.

const targetBlockStart = indexHtml.indexOf('<select id="compareBranchSelect"');
const targetBlockEnd = indexHtml.indexOf('</select>', targetBlockStart) + '</select>'.length;
if (targetBlockStart !== -1) {
    indexHtml = indexHtml.substring(0, targetBlockStart) + newSelectHtml + indexHtml.substring(targetBlockEnd);
}

indexHtml = indexHtml.replace(/script\.js\?v=\d+/, 'script.js?v=150');
fs.writeFileSync('index.html', indexHtml);
console.log('index.html updated');

// --- UPDATE script.js ---
let code = fs.readFileSync('script.js', 'utf-8');

// 1. Replace dropdown population inside btnCompareScenarios.addEventListener
const oldPopulate = `const branchSelect = document.getElementById('compareBranchSelect');
            if (branchSelect) {
                const currentSelection = branchSelect.value;
                branchSelect.innerHTML = '<option value="ALL">Tüm Fabrika (Genel Özet)</option>';
                const uniqueClasses = new Set();
                Object.values(scenarios).forEach(s => {
                    if (s.branchData) {
                        s.branchData.forEach(b => {
                            if (b.subClasses) {
                                b.subClasses.forEach(cls => uniqueClasses.add(cls.name));
                            }
                        });
                    }
                });
                Array.from(uniqueClasses).sort().forEach(cName => {
                    const opt = document.createElement('option');
                    opt.value = cName;
                    opt.textContent = cName;
                    branchSelect.appendChild(opt);
                });
                if (uniqueClasses.has(currentSelection)) {
                    branchSelect.value = currentSelection;
                }
            }`;

const newPopulate = `const classList = document.getElementById('compareClassList');
            if (classList) {
                const checkedBefore = Array.from(classList.querySelectorAll('input:checked')).map(cb => cb.value);
                classList.innerHTML = '';
                const uniqueClasses = new Set();
                Object.values(scenarios).forEach(s => {
                    if (s.branchData) {
                        s.branchData.forEach(b => {
                            if (b.subClasses) {
                                b.subClasses.forEach(cls => uniqueClasses.add(cls.name));
                            }
                        });
                    }
                });
                Array.from(uniqueClasses).sort().forEach(cName => {
                    const lbl = document.createElement('label');
                    const cb = document.createElement('input');
                    cb.type = 'checkbox';
                    cb.value = cName;
                    if (checkedBefore.includes(cName)) cb.checked = true;
                    cb.addEventListener('change', updateComparison);
                    lbl.appendChild(cb);
                    lbl.appendChild(document.createTextNode(' ' + cName));
                    classList.appendChild(lbl);
                });
            }`;

code = code.replace(oldPopulate, newPopulate);

// 2. Remove the old event listener attachment for compareBranchSelect
const oldListener = `if (document.getElementById('compareBranchSelect')) {
            document.getElementById('compareBranchSelect').addEventListener('change', updateComparison);
        }`;
code = code.replace(oldListener, '');

// 3. Update updateComparison function
const updateCompStart = code.indexOf('function updateComparison() {');
const updateCompEnd = code.indexOf('}', updateCompStart) + 1;

const newUpdateComp = `function updateComparison() {
        const listA = document.getElementById('compareListA');
        const listB = document.getElementById('compareListB');
        const classList = document.getElementById('compareClassList');
        
        if (!listA || !listB) return;
        
        const selectedA = Array.from(listA.querySelectorAll('input:checked')).map(cb => cb.value);
        const selectedB = Array.from(listB.querySelectorAll('input:checked')).map(cb => cb.value);
        const selectedClasses = classList ? Array.from(classList.querySelectorAll('input:checked')).map(cb => cb.value) : [];
        const classFilter = selectedClasses.length > 0 ? selectedClasses : 'ALL';
        
        const totalsA = renderCompareResults(selectedA, compareResultsA, classFilter, null);
        renderCompareResults(selectedB, compareResultsB, classFilter, totalsA);
    }`;

code = code.substring(0, updateCompStart) + newUpdateComp + code.substring(updateCompEnd);

// 4. Update the inner loop of renderCompareResults to check arrays
const oldLoopCondition = `if (branchFilter !== 'ALL' && cls.name !== branchFilter) return;`;
const newLoopCondition = `if (branchFilter !== 'ALL' && !branchFilter.includes(cls.name)) return;`;
code = code.replace(oldLoopCondition, newLoopCondition);

fs.writeFileSync('script.js', code);
console.log('script.js updated');
