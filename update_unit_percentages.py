import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Export globalNetTotal to window
content = content.replace("const globalNetTotal = globalBase + globalLabor + globalExpense + totalGUG + totalPazarlama + totalYonetim + totalArge;",
                          "const globalNetTotal = globalBase + globalLabor + globalExpense + totalGUG + totalPazarlama + totalYonetim + totalArge; window.globalNetTotal = globalNetTotal;")

# 2. In calculateDetail, use window.globalNetTotal for unit percents
# We need to find all formatWithPercent(..., clsUnitCost) and replace clsUnitCost with window.globalNetTotal
content = content.replace("formatWithPercent(cls.machineCost || 0, clsUnitCost)", "formatWithPercent(cls.machineCost || 0, window.globalNetTotal)")
content = content.replace("formatWithPercent(clsUnitShare, clsUnitCost)", "formatWithPercent(clsUnitShare, window.globalNetTotal)")
content = content.replace("formatWithPercent(clsUnitLaborShare, clsUnitCost)", "formatWithPercent(clsUnitLaborShare, window.globalNetTotal)")
content = content.replace("formatWithPercent(clsUnitShare + clsUnitLaborShare, clsUnitCost)", "formatWithPercent(clsUnitShare + clsUnitLaborShare, window.globalNetTotal)")
content = content.replace("formatWithPercent(clsUnitGUG, clsUnitCost)", "formatWithPercent(clsUnitGUG, window.globalNetTotal)")
content = content.replace("formatWithPercent(clsUnitPazarlama, clsUnitCost)", "formatWithPercent(clsUnitPazarlama, window.globalNetTotal)")
content = content.replace("formatWithPercent(clsUnitYonetim, clsUnitCost)", "formatWithPercent(clsUnitYonetim, window.globalNetTotal)")
content = content.replace("formatWithPercent(clsUnitArge, clsUnitCost)", "formatWithPercent(clsUnitArge, window.globalNetTotal)")
content = content.replace("formatWithPercent(clsUnitFinansman, clsUnitCost)", "formatWithPercent(clsUnitFinansman, window.globalNetTotal)")
content = content.replace("formatWithPercent(clsUnitPazarlama + clsUnitYonetim + clsUnitArge, clsUnitCost)", "formatWithPercent(clsUnitPazarlama + clsUnitYonetim + clsUnitArge, window.globalNetTotal)")

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
