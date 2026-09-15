const fs = require('fs');
let code = fs.readFileSync('script.js', 'utf-8');

// 1. Replace the dropdown population logic
const oldPopulate = `const branchSelect = document.getElementById('compareBranchSelect');
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
            }`;

const newPopulate = `const branchSelect = document.getElementById('compareBranchSelect');
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

code = code.replace(oldPopulate, newPopulate);

// 2. Replace the inner loop of renderCompareResults
const oldLoop = `        scenarioKeys.forEach(scenarioKey => {
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
        });`;

const newLoop = `        scenarioKeys.forEach(scenarioKey => {
            const s = scenarios[scenarioKey];
            if (s && s.branchData) {
                s.branchData.forEach(branch => {
                    if (!branch.subClasses) return;
                    
                    const detailBase = branch.branchBaseTotal;
                    const detailMultiplier = detailBase > 0 ? ((branch.branchShare || 0) / detailBase) : 0;
                    const laborMultiplier = detailBase > 0 ? ((branch.laborCost || 0) / detailBase) : 0;
                    
                    branch.subClasses.forEach(cls => {
                        if (branchFilter !== 'ALL' && cls.name !== branchFilter) return;

                        totalHammadde += cls.baseTotal || 0;
                        const clsShare = (cls.baseTotal || 0) * detailMultiplier;
                        const clsLaborShare = (cls.baseTotal || 0) * laborMultiplier;
                        
                        totalEsitIscilik += clsShare;
                        totalDirektIscilik += clsLaborShare;
                        
                        totalGUG += cls.gug || 0;
                        totalPazarlama += cls.pazarlama || 0;
                        totalYonetim += cls.yonetim || 0;
                        totalArge += cls.arge || 0;
                        totalFinansman += cls.finansman || 0;
                        
                        const ciro = (cls.quantity || 0) * (cls.salePrice || 0);
                        const clsCogs = (cls.baseTotal || 0) + clsShare + clsLaborShare + (cls.gug || 0);
                        
                        totalCiro += ciro;
                        brutKar += (ciro - clsCogs);
                    });
                });
            }
        });`;

code = code.replace(oldLoop, newLoop);

fs.writeFileSync('script.js', code);
console.log('script.js updated');
