with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# The script currently has the tab listeners and renderFactorySummary at the very end.
# They need to be INSIDE DOMContentLoaded.
# The DOMContentLoaded wraps almost the whole file:
# document.addEventListener('DOMContentLoaded', () => {
#    ...
# });

# Let's find the closing of DOMContentLoaded.
# It is the last `});` BEFORE `document.getElementById('tab-branches')`

start_idx = content.find("document.getElementById('tab-branches').addEventListener")

if start_idx != -1:
    main_code = content[:start_idx]
    tail_code = content[start_idx:]
    
    # In main_code, find the last `});`
    last_brace = main_code.rfind("});")
    if last_brace != -1:
        # Strip trailing whitespaces
        main_code = main_code[:last_brace].rstrip()
        
        # Now tail_code has some messed up closing braces.
        # Let's extract the functions manually to ensure perfect syntax.
        
        fixed_tail = """
    document.getElementById('tab-branches').addEventListener('click', function() {
        this.classList.remove('btn-secondary');
        this.classList.add('btn-primary');
        this.style.background = '';
        this.style.color = '';
        this.style.border = '';
        
        const summaryTab = document.getElementById('tab-summary');
        summaryTab.classList.remove('btn-primary');
        summaryTab.classList.add('btn-secondary');
        summaryTab.style.background = 'rgba(255,255,255,0.05)';
        summaryTab.style.color = 'var(--text-secondary)';
        summaryTab.style.border = '1px solid rgba(255,255,255,0.1)';
        
        document.getElementById('mainBranchesContainer').style.display = 'grid';
        document.getElementById('factorySummaryContainer').style.display = 'none';
    });

    document.getElementById('tab-summary').addEventListener('click', function() {
        this.classList.remove('btn-secondary');
        this.classList.add('btn-primary');
        this.style.background = '';
        this.style.color = '';
        this.style.border = '';
        
        const branchTab = document.getElementById('tab-branches');
        branchTab.classList.remove('btn-primary');
        branchTab.classList.add('btn-secondary');
        branchTab.style.background = 'rgba(255,255,255,0.05)';
        branchTab.style.color = 'var(--text-secondary)';
        branchTab.style.border = '1px solid rgba(255,255,255,0.1)';
        
        document.getElementById('mainBranchesContainer').style.display = 'none';
        document.getElementById('factorySummaryContainer').style.display = 'block';
    });

    function renderFactorySummary() {
        let totalHammadde = 0;
        let totalEsitIscilik = 0;
        let totalDirektIscilik = 0;
        let totalGUG = 0;
        let totalPazarlama = 0;
        let totalYonetim = 0;
        let totalArge = 0;
        let totalFinansman = 0;
        let classCount = 0;
        
        branchData.forEach(branch => {
            totalHammadde += branch.branchBaseTotal || 0;
            totalEsitIscilik += branch.branchShare || 0;
            totalDirektIscilik += branch.laborCost || 0;
            totalGUG += branch.branchGUG || 0;
            totalPazarlama += branch.branchPazarlama || 0;
            totalYonetim += branch.branchYonetim || 0;
            totalArge += branch.branchArge || 0;
            totalFinansman += branch.branchFinansman || 0;
            classCount += branch.subClasses.length;
        });
        
        const totalIscilik = totalEsitIscilik + totalDirektIscilik;
        const totalFaaliyet = totalPazarlama + totalYonetim + totalArge;
        const netMaliyet = globalNetTotal;
        const netKar = globalTotalProfit - totalFaaliyet - totalFinansman;
        const faaliyetKari = globalTotalProfit - totalFaaliyet;
        const brutKar = globalTotalProfit;
        
        const html = `
            <div class="result-row total" style="background: linear-gradient(90deg, rgba(236, 72, 153, 0.1) 0%, transparent 100%); border-left-color: var(--accent-2);">
                <span>Fabrika Net Maliyeti:</span>
                <span>${formatCurrency(netMaliyet)}</span>
            </div>
            <div class="result-row total accordion-header open" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('active')" style="margin-top: 1rem; border-left-color: #8b5cf6; background: linear-gradient(90deg, rgba(139, 92, 246, 0.1) 0%, transparent 100%);">
                <span>Fabrika Net Kâr: <span class="chevron"> </span></span>
                <span style="color: ${netKar >= 0 ? 'var(--success)' : 'var(--danger)'};">${formatWithPercent(netKar, netMaliyet)}</span>
            </div>
            <div class="accordion-content active">
                <div class="result-row total" style="margin-top: 0.5rem; border-left-color: var(--accent-1); background: linear-gradient(90deg, rgba(56, 189, 248, 0.1) 0%, transparent 100%);">
                    <span>Fabrika Faaliyet Kârı:</span>
                    <span style="color: ${faaliyetKari >= 0 ? 'var(--success)' : 'var(--danger)'};">${formatWithPercent(faaliyetKari, netMaliyet)}</span>
                </div>
                <div class="result-row total" style="margin-top: 0.5rem; border-left-color: var(--success); background: linear-gradient(90deg, rgba(16, 185, 129, 0.1) 0%, transparent 100%);">
                    <span>Fabrika Brüt Kâr:</span>
                    <span style="color: ${brutKar >= 0 ? 'var(--success)' : 'var(--danger)'};">${formatWithPercent(brutKar, netMaliyet)}</span>
                </div>
            </div>
            
            <div style="margin-top: 1.5rem; margin-bottom: 1rem; height: 1px; background: var(--border-color); opacity: 0.5;"></div>
            
            <div class="result-row">
                <span>Toplam Sınıf Sayısı:</span>
                <span>${classCount} adet</span>
            </div>
            <div class="result-row">
                <span>Fabrika Hammadde Toplamı:</span>
                <span>${formatWithPercent(totalHammadde, netMaliyet)}</span>
            </div>
            
            <div class="result-row accordion-header" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('active')">
                <span>Fabrika Toplam İşçilik Payı: <span class="chevron"> </span></span>
                <span style="color: var(--warning);">${formatWithPercent(totalIscilik, netMaliyet)}</span>
            </div>
            <div class="accordion-content">
                <div class="result-row">
                    <span>Fabrika Eşit Dağıtılan İşçilik Payı:</span>
                    <span style="color: var(--warning);">${formatWithPercent(totalEsitIscilik, netMaliyet)}</span>
                </div>
                <div class="result-row">
                    <span>Fabrika Direkt İşçilik Maliyeti:</span>
                    <span style="color: var(--warning);">${formatWithPercent(totalDirektIscilik, netMaliyet)}</span>
                </div>
            </div>
            
            <div class="result-row">
                <span>Fabrika Toplam Genel Üretim Gideri Payı:</span>
                <span style="color: var(--accent-4);">${formatWithPercent(totalGUG, netMaliyet)}</span>
            </div>
            
            <div class="result-row accordion-header" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('active')">
                <span>Fabrika Toplam Faaliyet Gideri Payı: <span class="chevron"> </span></span>
                <span style="color: var(--accent-2);">${formatWithPercent(totalFaaliyet, netMaliyet)}</span>
            </div>
            <div class="accordion-content">
                <div class="result-row">
                    <span>Fabrika Toplam Pazarlama Gideri Payı:</span>
                    <span style="color: var(--accent-1);">${formatWithPercent(totalPazarlama, netMaliyet)}</span>
                </div>
                <div class="result-row">
                    <span>Fabrika Toplam Genel Yönetim Gideri Payı:</span>
                    <span style="color: var(--accent-1);">${formatWithPercent(totalYonetim, netMaliyet)}</span>
                </div>
                <div class="result-row">
                    <span>Fabrika Toplam AR-GE Gideri Payı:</span>
                    <span style="color: var(--accent-1);">${formatWithPercent(totalArge, netMaliyet)}</span>
                </div>
            </div>
            
            <div class="result-row">
                <span>Fabrika Finansman (Gelir/Gider) Payı:</span>
                <span style="color: ${totalFinansman < 0 ? 'var(--success)' : 'var(--danger)'};">${formatWithPercent(totalFinansman, netMaliyet)}</span>
            </div>
        `;
        
        document.getElementById('factorySummaryResults').innerHTML = html;
    }

});
"""

        final_content = main_code + "\n\n" + fixed_tail
        with open('script.js', 'w', encoding='utf-8') as f:
            f.write(final_content)
        print("Success")
    else:
        print("Could not find });")
else:
    print("Could not find tab-branches")
