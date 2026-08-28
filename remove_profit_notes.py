import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

pattern1 = r'\s*<div style="font-size: 0\.85rem; color: var\(--text-secondary\); margin-top: 1rem; margin-bottom: 0\.5rem; opacity: 0\.8; line-height: 1\.4;">\s*<i style="margin-right:4px;">ℹ</i>Kâr oranları, sınıfın kendi <b>Net Maliyeti</b> üzerinden kâr marjını gösterir\.\s*</div>'
content = re.sub(pattern1, '', content)

pattern2 = r'\s*<div style="font-size: 0\.85rem; color: var\(--text-secondary\); margin-top: 1rem; margin-bottom: 0\.5rem; opacity: 0\.8; line-height: 1\.4;">\s*<i style="margin-right:4px;">ℹ</i>Kâr oranları, 1 adet makinenin kendi <b>Net Maliyeti</b> üzerinden kâr marjını gösterir\.\s*</div>'
content = re.sub(pattern2, '', content)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
