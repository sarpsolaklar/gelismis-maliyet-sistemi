const fs = require('fs');
let code = fs.readFileSync('script.js', 'utf-8');

const startStr = '<div class="branch-results">';
const endStr = '<button class="btn-enter" data-bindex="${bIndex}">';

const startIndex = code.indexOf(startStr);
const endIndex = code.indexOf(endStr, startIndex);

if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find bounds");
    process.exit(1);
}

const replacement = `<div class="branch-results">
        <div class="result-row">
            <span>Şubenin İçerdiği Sınıf Sayısı:</span>
            <span>\${classCount} Adet</span>
        </div>

        <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 1rem; margin-bottom: 0.5rem; opacity: 0.8; line-height: 1.4;">
            <i style="margin-right:4px;">ℹ</i>Gider yüzdelikleri, Tüm Fabrikadaki <b>ilgili gider kalemine</b> oranını; kârlılık yüzdelikleri ise şubenin <b>kendi maliyetine</b> oranını gösterir.
        </div>

        <div class="result-row total">
            <span>Şube Toplam Satış Geliri (Ciro):</span>
            <div style="display: flex; flex-direction: column; align-items: flex-end;">
                <span style="color: var(--success); font-weight: 600;">\${formatCurrency(branchTotalRevenue)}</span>
            </div>
        </div>
        
        <div class="result-row total accordion-header" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('active')" style="margin-top: 0.5rem; border-left-color: var(--success); background: linear-gradient(90deg, rgba(16, 185, 129, 0.1) 0%, transparent 100%); align-items: flex-start; cursor: pointer;">
            <span style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">Şube Brüt Kârı: <span class="chevron">▼</span></span>
            <div style="display: flex; flex-direction: column; align-items: flex-end;">
                <span style="color: \${branch.branchTotalProfit >= 0 ? 'var(--success)' : 'var(--danger)'};">\${formatWithPercent(branch.branchTotalProfit, netTotal)}</span>
            </div>
        </div>
        <div class="accordion-content">
            <div class="result-row" style="padding-left: 1rem; margin-bottom: 0.5rem; padding-bottom: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.1);">
                <span style="font-weight: 600; color: var(--danger);">Satılan Malın Maliyeti (SMM):</span>
                <span style="font-weight: 600; color: var(--danger);">\${formatCurrency(branch.branchBaseTotal + branch.branchShare + (branch.laborCost || 0) + branch.branchGUG)}</span>
            </div>
            <div class="result-row" style="padding-left: 1rem;">
                <span>Şube Hammadde Toplamı:</span>
                <span>\${formatWithPercent(branch.branchBaseTotal, window.celmakGlobals ? window.celmakGlobals.globalBase : 1)}</span>
            </div>
            <div class="result-row accordion-header" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('active')" style="padding-left: 1rem; cursor: pointer;">
                <span style="display: flex; align-items: center; gap: 8px;">Şube Toplam İşçilik Payı: <span class="chevron">▼</span></span>
                <span style="color: var(--warning);">\${formatWithPercent(branch.branchShare + (branch.laborCost || 0), window.celmakGlobals ? (window.celmakGlobals.globalExpense + window.celmakGlobals.globalLabor) : 1)}</span>
            </div>
            <div class="accordion-content">
                <div class="result-row" style="padding-left: 2rem;">
                    <span>Şube Eşit Dağıtılan İşçilik Payı:</span>
                    <span style="color: var(--warning);">\${formatWithPercent(branch.branchShare, window.celmakGlobals ? window.celmakGlobals.globalExpense : 1)}</span>
                </div>
                <div class="result-row" style="padding-left: 2rem;">
                    <span>Şube Direkt İşçilik Maliyeti:</span>
                    <span style="color: var(--warning);">\${formatWithPercent(branch.laborCost || 0, window.celmakGlobals ? window.celmakGlobals.globalLabor : 1)}</span>
                </div>
            </div>
            <div class="result-row" style="padding-left: 1rem;">
                <span>Şube Genel Üretim Gideri Payı:</span>
                <span style="color: var(--accent-4);">\${formatWithPercent(branch.branchGUG, window.celmakGlobals ? window.celmakGlobals.totalGUG : 1)}</span>
            </div>
        </div>

        <div class="result-row total accordion-header" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('active')" style="margin-top: 0.5rem; border-left-color: var(--accent-1); background: linear-gradient(90deg, rgba(56, 189, 248, 0.1) 0%, transparent 100%); align-items: flex-start; cursor: pointer;">
            <span style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">Şube Faaliyet Kârı: <span class="chevron">▼</span></span>
            <div style="display: flex; flex-direction: column; align-items: flex-end;">
                <span style="color: \${(branch.branchTotalProfit - ((branch.branchPazarlama || 0) + (branch.branchYonetim || 0) + (branch.branchArge || 0))) >= 0 ? 'var(--success)' : 'var(--danger)'};">\${formatWithPercent(branch.branchTotalProfit - ((branch.branchPazarlama || 0) + (branch.branchYonetim || 0) + (branch.branchArge || 0)), netTotal)}</span>
            </div>
        </div>
        <div class="accordion-content">
            <div class="result-row" style="padding-left: 1rem;">
                <span>Şube Pazarlama Gideri Payı:</span>
                <span style="color: var(--accent-1);">\${formatWithPercent(branch.branchPazarlama, window.celmakGlobals ? window.celmakGlobals.totalPazarlama : 1)}</span>
            </div>
            <div class="result-row" style="padding-left: 1rem;">
                <span>Şube Genel Yönetim Gideri Payı:</span>
                <span style="color: var(--accent-1);">\${formatWithPercent(branch.branchYonetim, window.celmakGlobals ? window.celmakGlobals.totalYonetim : 1)}</span>
            </div>
            <div class="result-row" style="padding-left: 1rem;">
                <span>Şube AR-GE Gideri Payı:</span>
                <span style="color: var(--accent-1);">\${formatWithPercent(branch.branchArge, window.celmakGlobals ? window.celmakGlobals.totalArge : 1)}</span>
            </div>
        </div>

        <div class="result-row total accordion-header open" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('active')" style="margin-top: 1rem; border-left-color: #8b5cf6; background: linear-gradient(90deg, rgba(139, 92, 246, 0.1) 0%, transparent 100%); align-items: flex-start; cursor: pointer;">
            <span style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">Şube Net Kârı: <span class="chevron">▼</span></span>
            <div style="display: flex; flex-direction: column; align-items: flex-end;">
                <span style="color: \${(branch.branchTotalProfit - ((branch.branchPazarlama || 0) + (branch.branchYonetim || 0) + (branch.branchArge || 0)) - (branch.branchFinansman || 0)) >= 0 ? 'var(--success)' : 'var(--danger)'};">\${formatWithPercent(branch.branchTotalProfit - ((branch.branchPazarlama || 0) + (branch.branchYonetim || 0) + (branch.branchArge || 0)) - (branch.branchFinansman || 0), netTotal)}</span>
            </div>
        </div>
        <div class="accordion-content active">
            <div class="result-row" style="padding-left: 1rem;">
                <span>Şube Finansman (Gelir/Gider) Payı:</span>
                <span style="color: \${(branch.branchFinansman || 0) < 0 ? 'var(--success)' : 'var(--danger)'};">\${formatWithPercent(branch.branchFinansman, window.celmakGlobals ? window.celmakGlobals.totalFinansman : 1)}</span>
            </div>
        </div>

        <div class="result-row total" style="background: linear-gradient(90deg, rgba(236, 72, 153, 0.1) 0%, transparent 100%); border-left-color: var(--accent-2); align-items: flex-start; margin-top: 1rem;">
            <span style="margin-top: 4px;">Şube Net Maliyeti:</span>
            <div style="display: flex; flex-direction: column; align-items: flex-end;">
                <span>\${formatCurrency(netTotal)}</span>
            </div>
        </div>
    </div>
    
    `;

code = code.substring(0, startIndex) + replacement + code.substring(endIndex);

fs.writeFileSync('script.js', code);
console.log('script.js branch structure updated!');
