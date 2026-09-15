import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# I will find function renderCompareResults(scenarioKey, container) { ... }
start_idx = content.find("function renderCompareResults(scenarioKey, container) {")
end_idx = content.find("    function updateComparison() {")

if start_idx != -1 and end_idx != -1:
    old_func = content[start_idx:end_idx]
    
    new_func = """function renderCompareResults(scenarioKey, container) {
        if (!scenarioKey || !scenarios[scenarioKey]) {
            container.innerHTML = '<p style="opacity:0.7;">Lütfen dönem seçin</p>';
            return;
        }
        
        const s = scenarios[scenarioKey];
        
        let totalHammadde = 0;
        let totalEsitIscilik = 0;
        let totalDirektIscilik = 0;
        let totalGUG = 0;
        let totalPazarlama = 0;
        let totalYonetim = 0;
        let totalArge = 0;
        let totalFinansman = 0;
        let totalCiro = 0;
        let classCount = 0;
        let brutKar = 0;
        
        if (s.branchData) {
            s.branchData.forEach(branch => {
                totalHammadde += branch.branchBaseTotal || 0;
                totalEsitIscilik += branch.branchShare || 0;
                totalDirektIscilik += branch.laborCost || 0;
                totalGUG += branch.branchGUG || 0;
                totalPazarlama += branch.branchPazarlama || 0;
                totalYonetim += branch.branchYonetim || 0;
                totalArge += branch.branchArge || 0;
                totalFinansman += branch.branchFinansman || 0;
                classCount += branch.subClasses.length;
                brutKar += branch.branchTotalProfit || 0;
                if (branch.subClasses) {
                    branch.subClasses.forEach(cls => {
                        totalCiro += (cls.quantity || 0) * (cls.salePrice || 0);
                    });
                }
            });
        }
        
        const totalIscilik = totalEsitIscilik + totalDirektIscilik;
        const totalFaaliyet = totalPazarlama + totalYonetim + totalArge;
        // Birebir Fabrika Özeti mantığı: netMaliyet içine Finansman DAHİL EDİLMEZ.
        const netMaliyet = totalHammadde + totalEsitIscilik + totalDirektIscilik + totalGUG + totalPazarlama + totalYonetim + totalArge;
        
        const netKar = brutKar - totalFaaliyet - totalFinansman;
        const faaliyetKari = brutKar - totalFaaliyet;
        
        const netMaliyetText = numberToTurkishText(netMaliyet);
        const netKarText = (netKar < 0 ? "Eksi " : "") + numberToTurkishText(Math.abs(netKar));
        const faaliyetKariText = (faaliyetKari < 0 ? "Eksi " : "") + numberToTurkishText(Math.abs(faaliyetKari));
        const brutKarText = (brutKar < 0 ? "Eksi " : "") + numberToTurkishText(Math.abs(brutKar));

        container.innerHTML = `
            <div class="result-row total">
                <span style="margin-top: 4px;">Toplam Satış Geliri (Ciro):</span>
                <div style="display: flex; flex-direction: column; align-items: flex-end;">
                    <span style="color: var(--success); font-weight: 600;">${formatCurrency(totalCiro)}</span>
                    <span style="font-size: 0.75rem; color: var(--text-secondary); opacity: 0.8; font-weight: normal; margin-top: 2px;">(${numberToTurkishText(totalCiro)})</span>
                </div>
            </div>
            <div class="result-row total" style="background: linear-gradient(90deg, rgba(236, 72, 153, 0.1) 0%, transparent 100%); border-left-color: var(--accent-2); align-items: flex-start;">
                <span style="margin-top: 4px;">Net Maliyeti:</span>
                <div style="display: flex; flex-direction: column; align-items: flex-end;">
                    <span>${formatCurrency(netMaliyet)}</span>
                    <span style="font-size: 0.75rem; color: var(--text-secondary); opacity: 0.8; font-weight: normal; margin-top: 2px;">(${netMaliyetText})</span>
                </div>
            </div>
            <div class="result-row total accordion-header open" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('active')" style="margin-top: 1rem; border-left-color: #8b5cf6; background: linear-gradient(90deg, rgba(139, 92, 246, 0.1) 0%, transparent 100%); align-items: flex-start;">
                <span style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">Net Kârı: <span class="chevron">▼</span></span>
                <div style="display: flex; flex-direction: column; align-items: flex-end;">
                    <span style="color: ${netKar >= 0 ? 'var(--success)' : 'var(--danger)'};">${formatWithPercent(netKar, netMaliyet)}</span>
                    <span style="font-size: 0.75rem; color: var(--text-secondary); opacity: 0.8; font-weight: normal; margin-top: 2px;">(${netKarText})</span>
                </div>
            </div>
            <div class="accordion-content active">
                <div class="result-row total" style="margin-top: 0.5rem; border-left-color: var(--accent-1); background: linear-gradient(90deg, rgba(56, 189, 248, 0.1) 0%, transparent 100%); align-items: flex-start;">
                    <span style="margin-top: 4px;">Faaliyet Kârı:</span>
                    <div style="display: flex; flex-direction: column; align-items: flex-end;">
                        <span style="color: ${faaliyetKari >= 0 ? 'var(--success)' : 'var(--danger)'};">${formatWithPercent(faaliyetKari, netMaliyet)}</span>
                        <span style="font-size: 0.75rem; color: var(--text-secondary); opacity: 0.8; font-weight: normal; margin-top: 2px;">(${faaliyetKariText})</span>
                    </div>
                </div>
                <div class="result-row total" style="margin-top: 0.5rem; border-left-color: var(--success); background: linear-gradient(90deg, rgba(16, 185, 129, 0.1) 0%, transparent 100%); align-items: flex-start;">
                    <span style="margin-top: 4px;">Brüt Kârı:</span>
                    <div style="display: flex; flex-direction: column; align-items: flex-end;">
                        <span style="color: ${brutKar >= 0 ? 'var(--success)' : 'var(--danger)'};">${formatWithPercent(brutKar, netMaliyet)}</span>
                        <span style="font-size: 0.75rem; color: var(--text-secondary); opacity: 0.8; font-weight: normal; margin-top: 2px;">(${brutKarText})</span>
                    </div>
                </div>
            </div>
            
            <hr style="margin: 1.5rem 0; border: none; border-top: 1px solid var(--border);">

            <div class="result-row">
                <span>Hammadde Toplamı:</span>
                <span>${formatWithPercent(totalHammadde, netMaliyet)}</span>
            </div>
            
            <div class="result-row accordion-header" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('active')" style="cursor: pointer;">
                <span style="display: flex; align-items: center; gap: 8px;">Toplam İşçilik Payı: <span class="chevron">▼</span></span>
                <span style="color: var(--warning);">${formatWithPercent(totalIscilik, netMaliyet)}</span>
            </div>
            <div class="accordion-content">
                <div class="result-row" style="padding-left: 1rem;">
                    <span>Eşit Dağıtılan İşçilik Payı:</span>
                    <span style="color: var(--warning);">${formatWithPercent(totalEsitIscilik, netMaliyet)}</span>
                </div>
                <div class="result-row" style="padding-left: 1rem;">
                    <span>Direkt İşçilik Maliyeti:</span>
                    <span style="color: var(--warning);">${formatWithPercent(totalDirektIscilik, netMaliyet)}</span>
                </div>
            </div>
            
            <div class="result-row">
                <span>Toplam Genel Üretim Gideri Payı:</span>
                <span style="color: var(--accent-4);">${formatWithPercent(totalGUG, netMaliyet)}</span>
            </div>
            
            <div class="result-row accordion-header" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('active')" style="cursor: pointer;">
                <span style="display: flex; align-items: center; gap: 8px;">Toplam Faaliyet Gideri Payı: <span class="chevron">▼</span></span>
                <span style="color: var(--accent-2);">${formatWithPercent(totalFaaliyet, netMaliyet)}</span>
            </div>
            <div class="accordion-content">
                <div class="result-row" style="padding-left: 1rem;">
                    <span>Toplam Pazarlama Gideri Payı:</span>
                    <span style="color: var(--accent-1);">${formatWithPercent(totalPazarlama, netMaliyet)}</span>
                </div>
                <div class="result-row" style="padding-left: 1rem;">
                    <span>Toplam Genel Yönetim Gideri Payı:</span>
                    <span style="color: var(--accent-1);">${formatWithPercent(totalYonetim, netMaliyet)}</span>
                </div>
                <div class="result-row" style="padding-left: 1rem;">
                    <span>Toplam AR-GE Gideri Payı:</span>
                    <span style="color: var(--accent-1);">${formatWithPercent(totalArge, netMaliyet)}</span>
                </div>
            </div>
            
            <div class="result-row">
                <span>Finansman (Gelir/Gider) Payı:</span>
                <span style="color: var(--danger);">${formatWithPercent(totalFinansman, netMaliyet)}</span>
            </div>
        `;
    }
"""

    content = content.replace(old_func, new_func)
    with open('script.js', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Function replaced successfully.")
else:
    print("Function not found.")
