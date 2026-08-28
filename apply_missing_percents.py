import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Class replacements
content = content.replace("elClsYonetim.textContent = formatCurrency(clsYonetim);", "elClsYonetim.textContent = formatWithPercent(clsYonetim, clsNet);")
content = content.replace("elClsArge.textContent = formatCurrency(clsArge);", "elClsArge.textContent = formatWithPercent(clsArge, clsNet);")
content = content.replace("elClsFinansman.textContent = formatCurrency(clsFinansman);", "elClsFinansman.textContent = formatWithPercent(clsFinansman, clsNet);")
content = content.replace("elClsFaaliyet.textContent = formatCurrency(clsPazarlama + clsYonetim + clsArge);", "elClsFaaliyet.textContent = formatWithPercent(clsPazarlama + clsYonetim + clsArge, clsNet);")

# Unit replacements
content = content.replace("elUnitYonetim.textContent = formatCurrency(clsUnitYonetim);", "elUnitYonetim.textContent = formatWithPercent(clsUnitYonetim, clsUnitCost);")
content = content.replace("elUnitArge.textContent = formatCurrency(clsUnitArge);", "elUnitArge.textContent = formatWithPercent(clsUnitArge, clsUnitCost);")
content = content.replace("elUnitFinansman.textContent = formatCurrency(clsUnitFinansman);", "elUnitFinansman.textContent = formatWithPercent(clsUnitFinansman, clsUnitCost);")
content = content.replace("elUnitFaaliyet.textContent = formatCurrency(clsUnitPazarlama + clsUnitYonetim + clsUnitArge);", "elUnitFaaliyet.textContent = formatWithPercent(clsUnitPazarlama + clsUnitYonetim + clsUnitArge, clsUnitCost);")

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
