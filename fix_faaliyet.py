import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the Faaliyet Gideri Payı in renderFactorySummary to properly be an accordion like the user wants
# And ensure all chevrons in renderFactorySummary have ▼

# 1. Update the Faaliyet Gideri Payı block to be perfectly formatted like İşçilik Payı
pattern_faaliyet = r'(<div class="result-row accordion-header" onclick="this\.classList\.toggle\(\'open\'\); this\.nextElementSibling\.classList\.toggle\(\'active\'\)">\s*<span>Fabrika Toplam Faaliyet Gideri[^:]+:\s*<span class="chevron">\s*</span></span>\s*<span style="color: var\(--accent-2\);">\$\{formatWithPercent\(totalFaaliyet, netMaliyet\)\}</span>\s*</div>\s*<div class="accordion-content">\s*<div class="result-row">\s*<span>Fabrika Toplam Pazarlama[^:]+:\s*</span>\s*<span style="color: var\(--accent-1\);">\$\{formatWithPercent\(totalPazarlama, netMaliyet\)\}</span>\s*</div>\s*<div class="result-row">\s*<span>Fabrika Toplam Genel Y[^:]+:\s*</span>\s*<span style="color: var\(--accent-1\);">\$\{formatWithPercent\(totalYonetim, netMaliyet\)\}</span>\s*</div>\s*<div class="result-row">\s*<span>Fabrika Toplam AR-GE[^:]+:\s*</span>\s*<span style="color: var\(--accent-1\);">\$\{formatWithPercent\(totalArge, netMaliyet\)\}</span>\s*</div>\s*</div>)'

replacement_faaliyet = r"""<div class="result-row accordion-header" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('active')" style="cursor: pointer;">
            <span style="display: flex; align-items: center; gap: 8px;">Fabrika Toplam Faaliyet Gideri Payı: <span class="chevron">▼</span></span>
            <span style="color: var(--accent-2);">${formatWithPercent(totalFaaliyet, netMaliyet)}</span>
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
        </div>"""

content = re.sub(pattern_faaliyet, replacement_faaliyet, content)

# Also fix the missing chevron in İşçilik Payı which we just updated in the previous step!
content = content.replace('<span class="chevron"></span></span>', '<span class="chevron">▼</span></span>')
content = content.replace('<span class="chevron"> </span></span>', '<span class="chevron">▼</span></span>')

# Also fix the Net Kâr chevron in renderFactorySummary
content = content.replace('<span>Fabrika Net Kâr: <span class="chevron">▼</span></span>', '<span style="display: flex; align-items: center; gap: 8px;">Fabrika Net Kâr: <span class="chevron">▼</span></span>')
content = content.replace('<span>Fabrika Net Kâr: <span class="chevron"> </span></span>', '<span style="display: flex; align-items: center; gap: 8px;">Fabrika Net Kâr: <span class="chevron">▼</span></span>')


with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
