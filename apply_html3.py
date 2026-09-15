import re

with open('script.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

in_func = False
start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if 'function renderFactorySummary()' in line:
        in_func = True
    if in_func:
        if 'const netKarText = (netKar < 0 ? "Eksi " : "") + numberToTurkishText(Math.abs(netKar));' in line:
            start_idx = i
        if 'document.getElementById(\'factorySummaryResults\').innerHTML = html;' in line:
            end_idx = i
            break

if start_idx != -1 and end_idx != -1:
    new_html = """        const netKarText = (netKar < 0 ? "Eksi " : "") + numberToTurkishText(Math.abs(netKar));
        const faaliyetKariText = (faaliyetKari < 0 ? "Eksi " : "") + numberToTurkishText(Math.abs(faaliyetKari));
        const brutKarText = (brutKar < 0 ? "Eksi " : "") + numberToTurkishText(Math.abs(brutKar));

        const html = `
            <div class="result-row total">
                <span style="margin-top: 4px;">Fabrika Toplam Satış Geliri (Ciro):</span>
                <div style="display: flex; flex-direction: column; align-items: flex-end;">
                    <span style="color: var(--success); font-weight: 600;">${formatCurrency(totalCiro)}</span>
                    <span style="font-size: 0.75rem; color: var(--text-secondary); opacity: 0.8; font-weight: normal; margin-top: 2px;">(${numberToTurkishText(totalCiro)})</span>
                </div>
            </div>
            
            <div class="result-row total accordion-header" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('active')" style="margin-top: 0.5rem; border-left-color: var(--success); background: linear-gradient(90deg, rgba(16, 185, 129, 0.1) 0%, transparent 100%); align-items: flex-start; cursor: pointer;">
                <span style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">Fabrika Brüt Kârı: <span class="chevron">▼</span></span>
                <div style="display: flex; flex-direction: column; align-items: flex-end;">
                    <span style="color: ${brutKar >= 0 ? 'var(--success)' : 'var(--danger)'};">${formatWithPercent(brutKar, netMaliyet)}</span>
                    <span style="font-size: 0.75rem; color: var(--text-secondary); opacity: 0.8; font-weight: normal; margin-top: 2px;">(${brutKarText})</span>
                </div>
            </div>
            <div class="accordion-content">
                <div class="result-row" style="padding-left: 1rem;">
                    <span>Fabrika Hammadde Toplamı:</span>
                    <span>${formatWithPercent(totalHammadde, netMaliyet)}</span>
                </div>
                
                <div class="result-row accordion-header" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('active')" style="padding-left: 1rem; cursor: pointer;">
                    <span style="display: flex; align-items: center; gap: 8px;">Fabrika Toplam İşçilik Payı: <span class="chevron">▼</span></span>
                    <span style="color: var(--warning);">${formatWithPercent(totalIscilik, netMaliyet)}</span>
                </div>
                <div class="accordion-content">
                    <div class="result-row" style="padding-left: 2rem;">
                        <span>Fabrika Eşit Dağıtılan İşçilik Payı:</span>
                        <span style="color: var(--warning);">${formatWithPercent(totalEsitIscilik, netMaliyet)}</span>
                    </div>
                    <div class="result-row" style="padding-left: 2rem;">
                        <span>Fabrika Direkt İşçilik Maliyeti:</span>
                        <span style="color: var(--warning);">${formatWithPercent(totalDirektIscilik, netMaliyet)}</span>
                    </div>
                </div>
                
                <div class="result-row" style="padding-left: 1rem;">
                    <span>Fabrika Toplam Genel Üretim Gideri Payı:</span>
                    <span style="color: var(--accent-4);">${formatWithPercent(totalGUG, netMaliyet)}</span>
                </div>
            </div>

            <div class="result-row total accordion-header" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('active')" style="margin-top: 0.5rem; border-left-color: var(--accent-1); background: linear-gradient(90deg, rgba(56, 189, 248, 0.1) 0%, transparent 100%); align-items: flex-start; cursor: pointer;">
                <span style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">Fabrika Faaliyet Kârı: <span class="chevron">▼</span></span>
                <div style="display: flex; flex-direction: column; align-items: flex-end;">
                    <span style="color: ${faaliyetKari >= 0 ? 'var(--success)' : 'var(--danger)'};">${formatWithPercent(faaliyetKari, netMaliyet)}</span>
                    <span style="font-size: 0.75rem; color: var(--text-secondary); opacity: 0.8; font-weight: normal; margin-top: 2px;">(${faaliyetKariText})</span>
                </div>
            </div>
            <div class="accordion-content">
                <div class="result-row" style="padding-left: 1rem;">
                    <span>Fabrika Toplam Pazarlama Gideri Payı:</span>
                    <span style="color: var(--accent-1);">${formatWithPercent(totalPazarlama, netMaliyet)}</span>
                </div>
                <div class="result-row" style="padding-left: 1rem;">
                    <span>Fabrika Toplam Genel Yönetim Gideri Payı:</span>
                    <span style="color: var(--accent-1);">${formatWithPercent(totalYonetim, netMaliyet)}</span>
                </div>
                <div class="result-row" style="padding-left: 1rem;">
                    <span>Fabrika Toplam AR-GE Gideri Payı:</span>
                    <span style="color: var(--accent-1);">${formatWithPercent(totalArge, netMaliyet)}</span>
                </div>
            </div>

            <div class="result-row total" style="background: linear-gradient(90deg, rgba(236, 72, 153, 0.1) 0%, transparent 100%); border-left-color: var(--accent-2); align-items: flex-start; margin-top: 1rem;">
                <span style="margin-top: 4px;">Fabrika Net Maliyeti:</span>
                <div style="display: flex; flex-direction: column; align-items: flex-end;">
                    <span>${formatCurrency(netMaliyet)}</span>
                    <span style="font-size: 0.75rem; color: var(--text-secondary); opacity: 0.8; font-weight: normal; margin-top: 2px;">(${netMaliyetText})</span>
                </div>
            </div>
            
            <div class="result-row total" style="margin-top: 1rem; border-left-color: #8b5cf6; background: linear-gradient(90deg, rgba(139, 92, 246, 0.1) 0%, transparent 100%); align-items: flex-start;">
                <span style="margin-top: 4px;">Fabrika Net Kârı:</span>
                <div style="display: flex; flex-direction: column; align-items: flex-end;">
                    <span style="color: ${netKar >= 0 ? 'var(--success)' : 'var(--danger)'};">${formatWithPercent(netKar, netMaliyet)}</span>
                    <span style="font-size: 0.75rem; color: var(--text-secondary); opacity: 0.8; font-weight: normal; margin-top: 2px;">(${netKarText})</span>
                </div>
            </div>
            
            <div class="result-row" style="margin-top: 1rem;">
                <span>Fabrika Finansman (Gelir/Gider) Payı:</span>
                <span style="color: ${totalFinansman < 0 ? 'var(--success)' : 'var(--danger)'};">${formatWithPercent(totalFinansman, netMaliyet)}</span>
            </div>
            <div style="font-size: 0.75rem; color: var(--text-secondary); opacity: 0.7; margin-top: 4px; padding-right: 10px; text-align: right;">ℹ Finansman kalemi Net Maliyet hesaplamasından bağımsız olduğu için oranların toplamı %100\\'ü aşabilir.</div>
        `;

"""
    lines[start_idx:end_idx] = [new_html]
    with open('script.js', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Done")
else:
    print("Indices not found")
