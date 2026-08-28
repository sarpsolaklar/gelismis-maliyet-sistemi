import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace for Class
content = content.replace("elClsFaaliyetKar.textContent = formatCurrency(faaliyetKari);", "elClsFaaliyetKar.textContent = formatWithPercent(faaliyetKari, clsNet);")
content = content.replace("elClsNetKar.textContent = formatCurrency(netKari);", "elClsNetKar.textContent = formatWithPercent(netKari, clsNet);")
content = content.replace("elTotalProfit.textContent = formatCurrency(clsTotalProfit);", "elTotalProfit.textContent = formatWithPercent(clsTotalProfit, clsNet);")

# Replace for Unit
content = content.replace("elUnitFaaliyetKar.textContent = formatCurrency(unitFaaliyetKari);", "elUnitFaaliyetKar.textContent = formatWithPercent(unitFaaliyetKari, clsUnitCost);")
content = content.replace("elUnitNetKar.textContent = formatCurrency(unitNetKari);", "elUnitNetKar.textContent = formatWithPercent(unitNetKari, clsUnitCost);")
content = content.replace("document.getElementById(`cls-profit-${cIndex}`).textContent = formatCurrency(clsProfit);", "document.getElementById(`cls-profit-${cIndex}`).textContent = formatWithPercent(clsProfit, clsUnitCost);")


with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
