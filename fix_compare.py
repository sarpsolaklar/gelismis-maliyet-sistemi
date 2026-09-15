import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_logic = """    function renderCompareResults(scenarioKey, container) {
        if (!scenarioKey || !scenarios[scenarioKey]) {
            container.innerHTML = '<p style="opacity:0.7;">Lütfen senaryo seçin</p>';
            return;
        }
        
        const s = scenarios[scenarioKey];
        // Note: we need to do a lightweight calculate for the scenario if it's not the active one
        // But for simplicity, let's assume we can compute global totals quickly or they are already stored?
        // Let's compute them manually here
        let globalBase = 0, globalLabor = 0, totalSales = 0;
        s.branchData.forEach(b => {
            let bTotal = 0;
            b.subClasses.forEach(cls => {
                let rate = 1;
                if (cls.currency === 'USD') rate = parseFloat(s.rateUSD) || 34.50;
                else if (cls.currency === 'EUR') rate = parseFloat(s.rateEUR) || 38.20;
                bTotal += (cls.machineCost || 0) * rate * (cls.quantity || 1);
                totalSales += (cls.salePrice || 0) * (cls.quantity || 1);
            });
            globalBase += bTotal;
            globalLabor += (b.laborCost || 0);
        });
        
        const gExp = parseFloat(s.sharedExpense) || 0;
        const gGug = parseFloat(s.globalGUG) || 0;
        const gPaz = parseFloat(s.globalPazarlama) || 0;
                    const gYonetim = parseFloat(s.globalYonetim) || 0;
                    const gArge = parseFloat(s.globalArge) || 0;
        const netCost = globalBase + globalLabor + gExp + gGug + gPaz;
        const grossProfit = totalSales - (netCost - gPaz - gYonetim - gArge);
        
        container.innerHTML = `
            <div class="result-row total"><span class="label">Net Maliyet</span><span class="value">${formatCurrency(netCost)}</span></div>
            <div class="result-row total"><span class="label">Brüt Kâr</span><span class="value" style="color: ${grossProfit >= 0 ? 'var(--success)' : 'var(--danger)'};">${formatCurrency(grossProfit)}</span></div>
            <hr style="margin: 1rem 0; border: none; border-top: 1px solid var(--border);">
            <div style="font-size: 0.9rem;">
                <p><strong>Dağıtılan İşçilik:</strong> ${formatCurrency(gExp)}</p>
                <p><strong>GÜG:</strong> ${formatCurrency(gGug)}</p>
                <p><strong>Pazarlama:</strong> ${formatCurrency(gPaz)}</p>
                <p><strong>Genel Yönetim:</strong> ${formatCurrency(gYonetim)}</p>
                <p><strong>AR-GE:</strong> ${formatCurrency(gArge)}</p>
                <p><strong>Şube İşçilikleri:</strong> ${formatCurrency(globalLabor)}</p>
                <p><strong>Hammadde Toplam:</strong> ${formatCurrency(globalBase)}</p>
            </div>
        `;
    }"""

new_logic = """    function renderCompareResults(scenarioKey, container) {
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
        let brutKar = 0;
        let netMaliyet = 0;

        if (s.branchData) {
            s.branchData.forEach(branch => {
                totalHammadde += branch.branchBaseTotal || 0;
                totalEsitIscilik += branch.branchShare || 0;
                totalDirektIscilik += parseFloat(branch.labor) || 0;
                totalGUG += branch.branchGUG || 0;
                totalPazarlama += branch.branchPazarlama || 0;
                totalYonetim += branch.branchYonetim || 0;
                totalArge += branch.branchArge || 0;
                totalFinansman += branch.branchFinansman || 0;
                brutKar += branch.branchTotalProfit || 0;
                netMaliyet += branch.branchNetTotal || 0;
                
                if (branch.subClasses) {
                    branch.subClasses.forEach(cls => {
                        totalCiro += parseFloat(cls.quantity || 0) * parseFloat(cls.salePrice || 0);
                    });
                }
            });
        }
        
        const totalFaaliyet = totalPazarlama + totalYonetim + totalArge;
        const netKar = brutKar - totalFaaliyet - totalFinansman;

        container.innerHTML = `
            <div class="result-row total"><span class="label">Ciro</span><span class="value" style="color: var(--success);">${formatCurrency(totalCiro)}</span></div>
            <div class="result-row total"><span class="label">Net Maliyet</span><span class="value">${formatCurrency(netMaliyet)}</span></div>
            <div class="result-row total"><span class="label">Net Kâr</span><span class="value" style="color: ${netKar >= 0 ? 'var(--success)' : 'var(--danger)'};">${formatCurrency(netKar)}</span></div>
            <hr style="margin: 1rem 0; border: none; border-top: 1px solid var(--border);">
            <div style="font-size: 0.9rem;">
                <p><strong>Hammadde Toplam:</strong> ${formatCurrency(totalHammadde)}</p>
                <p><strong>Dağıtılan İşçilik:</strong> ${formatCurrency(totalEsitIscilik)}</p>
                <p><strong>Şube İşçilikleri:</strong> ${formatCurrency(totalDirektIscilik)}</p>
                <p><strong>GÜG:</strong> ${formatCurrency(totalGUG)}</p>
                <p><strong>Pazarlama:</strong> ${formatCurrency(totalPazarlama)}</p>
                <p><strong>Genel Yönetim:</strong> ${formatCurrency(totalYonetim)}</p>
                <p><strong>AR-GE:</strong> ${formatCurrency(totalArge)}</p>
                <p><strong>Finansman:</strong> ${formatCurrency(totalFinansman)}</p>
            </div>
        `;
    }"""

if old_logic in content:
    content = content.replace(old_logic, new_logic)
    print("Replaced easily.")
else:
    print("Could not find the exact old logic. Trying regex.")
    
with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
