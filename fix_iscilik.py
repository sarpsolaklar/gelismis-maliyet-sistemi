import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# I will replace the corrupted "Fabrika Toplam ilik Pay" block with the correct one.
# To be safe, I will find "Fabrika Toplam" ... "totalDirektIscilik"

pattern = r'(<div class="result-row accordion-header" onclick="this\.classList\.toggle\(\'open\'\); this\.nextElementSibling\.classList\.toggle\(\'active\'\)">\s*<span>Fabrika Toplam [^:]+:\s*<span class="chevron">\s*</span></span>\s*<span style="color: var\(--warning\);">\$\{formatWithPercent\(totalIscilik, netMaliyet\)\}</span>\s*</div>\s*<div class="accordion-content">\s*<div class="result-row">\s*<span>Fabrika E[^:]+:</span>\s*<span style="color: var\(--warning\);">\$\{formatWithPercent\(totalEsitIscilik, netMaliyet\)\}</span>\s*</div>\s*<div class="result-row">\s*<span>Fabrika Direkt[^:]+:</span>\s*<span style="color: var\(--warning\);">\$\{formatWithPercent\(totalDirektIscilik, netMaliyet\)\}</span>\s*</div>\s*</div>)'

replacement = r"""<div class="result-row accordion-header" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('active')" style="cursor: pointer;">
            <span style="display: flex; align-items: center; gap: 8px;">Fabrika Toplam İşçilik Payı: <span class="chevron"></span></span>
            <span style="color: var(--warning);">${formatWithPercent(totalIscilik, netMaliyet)}</span>
        </div>
        <div class="accordion-content">
            <div class="result-row" style="padding-left: 1rem;">
                <span>Fabrika Eşit Dağıtılan İşçilik Payı:</span>
                <span style="color: var(--warning);">${formatWithPercent(totalEsitIscilik, netMaliyet)}</span>
            </div>
            <div class="result-row" style="padding-left: 1rem;">
                <span>Fabrika Direkt İşçilik Maliyeti:</span>
                <span style="color: var(--warning);">${formatWithPercent(totalDirektIscilik, netMaliyet)}</span>
            </div>
        </div>"""

content = re.sub(pattern, replacement, content)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
