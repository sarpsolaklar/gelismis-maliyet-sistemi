import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the JS logic
content = content.replace("elBase.textContent = formatCurrency(cls.baseTotal);", "elBase.textContent = formatWithPercent(cls.baseTotal, clsNet);")

# Fix the HTML text
content = content.replace("<span>Şube Hammadde Toplamı:</span>\n                          <span id=\"cls-bTotal-${cIndex}\">0 ₺</span>", "<span>Sınıf Hammadde Toplamı:</span>\n                          <span id=\"cls-bTotal-${cIndex}\">0 ₺</span>")

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
