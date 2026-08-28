import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'(<div class="result-row">\s*<span>Fabrika Finansman \(Gelir/Gider\) Pay[^:]+:</span>\s*<span style="color: \$\{totalFinansman < 0 \? \'var\(--success\)\' : \'var\(--danger\)\'\};">\$\{formatWithPercent\(totalFinansman, netMaliyet\)\}</span>\s*</div>)'

replacement = r'\1\n            <div style="font-size: 0.75rem; color: var(--text-secondary); opacity: 0.7; margin-top: 4px; padding-right: 10px; text-align: right;">ℹ Finansman kalemi Net Maliyet hesaplamasından bağımsız olduğu için oranların toplamı %100\'ü aşabilir.</div>'

content = re.sub(pattern, replacement, content)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
