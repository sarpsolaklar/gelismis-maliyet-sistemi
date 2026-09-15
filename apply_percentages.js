const fs = require('fs');
let code = fs.readFileSync('script.js', 'utf-8');

// Replace the branch percentage rendering block
const oldBlock = `
                    <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.8rem; opacity: 0.8; line-height: 1.4;">
                        <i style="margin-right:4px;">ℹ</i>Aşağıdaki yüzdelikler, bu Şubenin <b>Tüm Fabrika Net Maliyeti (Global Net Total)</b> içerisindeki payını gösterir.
                    </div>
                    <div class="result-row">
                        <span>Şube Hammadde Toplamı:</span>
                        <span>\${formatWithPercent(branch.branchBaseTotal, globalNetTotal)}</span>
                    </div>
                    <div class="result-row accordion-header" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('active')">
                        <span>Şube Toplam İşçilik Payı: <span class="chevron">▼</span></span>
                        <span id="branch-total-labor-\${bIndex}" style="color: var(--warning);">\${formatWithPercent(branch.branchShare + (branch.laborCost || 0), globalNetTotal)}</span>
                    </div>
                    <div class="accordion-content">
                        <div class="result-row">
                            <span>Şube Eşit Dağıtılan İşçilik Payı:</span>
                            <span id="branch-share-labor-\${bIndex}" style="color: var(--warning);">\${formatWithPercent(branch.branchShare, globalNetTotal)}</span>
                        </div>
                        <div class="result-row">
                            <span>Şube İşçilik Maliyeti:</span>
                            <span id="branch-labor-cost-\${bIndex}" style="color: var(--warning);">\${formatWithPercent(branch.laborCost || 0, globalNetTotal)}</span>
                        </div>
                    </div>
                    <div class="result-row">
                        <span>Şube Toplam Genel Üretim Gideri Payı:</span>
                        <span style="color: var(--accent-4);">\${formatWithPercent(branch.branchGUG, globalNetTotal)}</span>
                    </div>
                    <div class="result-row accordion-header" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('active')">
                        <span>Şube Toplam Faaliyet Gideri Payı: <span class="chevron">▼</span></span>
                        <span style="color: var(--accent-2);">\${formatWithPercent((branch.branchPazarlama || 0) + (branch.branchYonetim || 0) + (branch.branchArge || 0), globalNetTotal)}</span>
                    </div>
                    <div class="accordion-content">
                        <div class="result-row">
                            <span>Şube Toplam Pazarlama Gideri Payı:</span>
                            <span style="color: var(--accent-1);">\${formatWithPercent(branch.branchPazarlama, globalNetTotal)}</span>
                        </div>
                        <div class="result-row">
                            <span>Şube Toplam Genel Yönetim Gideri Payı:</span>
                            <span style="color: var(--accent-1);">\${formatWithPercent(branch.branchYonetim, globalNetTotal)}</span>
                        </div>
                        <div class="result-row">
                            <span>Şube Toplam AR-GE Gideri Payı:</span>
                            <span style="color: var(--accent-1);">\${formatWithPercent(branch.branchArge, globalNetTotal)}</span>
                        </div>
                    </div>
                    <div class="result-row">
                        <span>Şube Finansman (Gelir/Gider) Payı:</span>
                        <span style="color: \${(branch.branchFinansman || 0) < 0 ? 'var(--success)' : 'var(--danger)'};">\${formatWithPercent(branch.branchFinansman, globalNetTotal)}</span>
                    </div>`;

const newBlock = `
                    <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.8rem; opacity: 0.8; line-height: 1.4;">
                        <i style="margin-right:4px;">ℹ</i>Aşağıdaki yüzdelikler, bu Şubenin <b>Tüm Fabrikadaki ilgili gider kalemi</b> (örn: Tüm Fabrika Hammaddesi) içerisindeki payını gösterir.
                    </div>
                    <div class="result-row">
                        <span>Şube Hammadde Toplamı:</span>
                        <span>\${formatWithPercent(branch.branchBaseTotal, window.celmakGlobals ? window.celmakGlobals.globalBase : 1)}</span>
                    </div>
                    <div class="result-row accordion-header" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('active')">
                        <span>Şube Toplam İşçilik Payı: <span class="chevron">▼</span></span>
                        <span id="branch-total-labor-\${bIndex}" style="color: var(--warning);">\${formatWithPercent(branch.branchShare + (branch.laborCost || 0), window.celmakGlobals ? (window.celmakGlobals.globalExpense + window.celmakGlobals.globalLabor) : 1)}</span>
                    </div>
                    <div class="accordion-content">
                        <div class="result-row">
                            <span>Şube Eşit Dağıtılan İşçilik Payı:</span>
                            <span id="branch-share-labor-\${bIndex}" style="color: var(--warning);">\${formatWithPercent(branch.branchShare, window.celmakGlobals ? window.celmakGlobals.globalExpense : 1)}</span>
                        </div>
                        <div class="result-row">
                            <span>Şube İşçilik Maliyeti:</span>
                            <span id="branch-labor-cost-\${bIndex}" style="color: var(--warning);">\${formatWithPercent(branch.laborCost || 0, window.celmakGlobals ? window.celmakGlobals.globalLabor : 1)}</span>
                        </div>
                    </div>
                    <div class="result-row">
                        <span>Şube Toplam Genel Üretim Gideri Payı:</span>
                        <span style="color: var(--accent-4);">\${formatWithPercent(branch.branchGUG, window.celmakGlobals ? window.celmakGlobals.totalGUG : 1)}</span>
                    </div>
                    <div class="result-row accordion-header" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('active')">
                        <span>Şube Toplam Faaliyet Gideri Payı: <span class="chevron">▼</span></span>
                        <span style="color: var(--accent-2);">\${formatWithPercent((branch.branchPazarlama || 0) + (branch.branchYonetim || 0) + (branch.branchArge || 0), window.celmakGlobals ? (window.celmakGlobals.totalPazarlama + window.celmakGlobals.totalYonetim + window.celmakGlobals.totalArge) : 1)}</span>
                    </div>
                    <div class="accordion-content">
                        <div class="result-row">
                            <span>Şube Toplam Pazarlama Gideri Payı:</span>
                            <span style="color: var(--accent-1);">\${formatWithPercent(branch.branchPazarlama, window.celmakGlobals ? window.celmakGlobals.totalPazarlama : 1)}</span>
                        </div>
                        <div class="result-row">
                            <span>Şube Toplam Genel Yönetim Gideri Payı:</span>
                            <span style="color: var(--accent-1);">\${formatWithPercent(branch.branchYonetim, window.celmakGlobals ? window.celmakGlobals.totalYonetim : 1)}</span>
                        </div>
                        <div class="result-row">
                            <span>Şube Toplam AR-GE Gideri Payı:</span>
                            <span style="color: var(--accent-1);">\${formatWithPercent(branch.branchArge, window.celmakGlobals ? window.celmakGlobals.totalArge : 1)}</span>
                        </div>
                    </div>
                    <div class="result-row">
                        <span>Şube Finansman (Gelir/Gider) Payı:</span>
                        <span style="color: \${(branch.branchFinansman || 0) < 0 ? 'var(--success)' : 'var(--danger)'};">\${formatWithPercent(branch.branchFinansman, window.celmakGlobals ? window.celmakGlobals.totalFinansman : 1)}</span>
                    </div>`;

code = code.replace(oldBlock, newBlock);
fs.writeFileSync('script.js', code);
console.log('script.js updated with new percentage logic!');
