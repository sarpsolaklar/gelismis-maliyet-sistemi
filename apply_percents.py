import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add a helper function for formatting with percentage
helper_fn = """function formatCurrency(val) {
    return val.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺';
}

function formatWithPercent(val, total) {
    if (!total || total === 0) return formatCurrency(val) + " (%0.00)";
    return formatCurrency(val) + ` (%${((val / total) * 100).toFixed(2)})`;
}"""

content = content.replace("""function formatCurrency(val) {
    return val.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺';
}""", helper_fn)

# Replace in Branch Card
content = content.replace("${formatCurrency(branch.branchShare + (branch.laborCost || 0))}", "${formatWithPercent(branch.branchShare + (branch.laborCost || 0), netTotal)}")
content = content.replace("${formatCurrency(branch.branchShare)}", "${formatWithPercent(branch.branchShare, netTotal)}")
content = content.replace("${formatCurrency(branch.laborCost || 0)}", "${formatWithPercent(branch.laborCost || 0, netTotal)}")
content = content.replace("${formatCurrency(branch.branchGUG)}", "${formatWithPercent(branch.branchGUG, netTotal)}")
content = content.replace("${formatCurrency(branch.branchPazarlama || 0 + branch.branchYonetim || 0 + branch.branchArge || 0)}", "${formatWithPercent((branch.branchPazarlama || 0) + (branch.branchYonetim || 0) + (branch.branchArge || 0), netTotal)}") # This one might have been evaluated differently
content = content.replace("${formatCurrency(branch.branchPazarlama || 0)}", "${formatWithPercent(branch.branchPazarlama || 0, netTotal)}")
content = content.replace("${formatCurrency(branch.branchYonetim || 0)}", "${formatWithPercent(branch.branchYonetim || 0, netTotal)}")
content = content.replace("${formatCurrency(branch.branchArge || 0)}", "${formatWithPercent(branch.branchArge || 0, netTotal)}")
content = content.replace("${formatCurrency(branch.branchFinansman || 0)}", "${formatWithPercent(branch.branchFinansman || 0, netTotal)}")

# Replace in Class Card (calculateDetail)
# Since Class and Unit use getElementById, we need to update the calculateDetail function.
content = content.replace("document.getElementById(`cls-share-${cIndex}`).textContent = formatCurrency(clsShare);", "document.getElementById(`cls-share-${cIndex}`).textContent = formatWithPercent(clsShare, clsNet);")
content = content.replace("elTotalLabor.textContent = formatCurrency(clsShare + clsLaborShare);", "elTotalLabor.textContent = formatWithPercent(clsShare + clsLaborShare, clsNet);")
content = content.replace("document.getElementById(`cls-labor-share-${cIndex}`).textContent = formatCurrency(clsLaborShare);", "document.getElementById(`cls-labor-share-${cIndex}`).textContent = formatWithPercent(clsLaborShare, clsNet);")
content = content.replace("document.getElementById(`cls-gug-${cIndex}`).textContent = formatCurrency(clsGUG);", "document.getElementById(`cls-gug-${cIndex}`).textContent = formatWithPercent(clsGUG, clsNet);")
content = content.replace("if (elClsFaal) elClsFaal.textContent = formatCurrency(clsPazarlama + clsYonetim + clsArge);", "if (elClsFaal) elClsFaal.textContent = formatWithPercent(clsPazarlama + clsYonetim + clsArge, clsNet);")
content = content.replace("if (elClsPaz) elClsPaz.textContent = formatCurrency(clsPazarlama);", "if (elClsPaz) elClsPaz.textContent = formatWithPercent(clsPazarlama, clsNet);")
content = content.replace("if (elClsYon) elClsYon.textContent = formatCurrency(clsYonetim);", "if (elClsYon) elClsYon.textContent = formatWithPercent(clsYonetim, clsNet);")
content = content.replace("if (elClsArg) elClsArg.textContent = formatCurrency(clsArge);", "if (elClsArg) elClsArg.textContent = formatWithPercent(clsArge, clsNet);")
content = content.replace("if (elClsFin) elClsFin.textContent = formatCurrency(clsFinansman);", "if (elClsFin) elClsFin.textContent = formatWithPercent(clsFinansman, clsNet);")

# Unit Card (calculateDetail)
content = content.replace("if (elUnitShare) elUnitShare.textContent = formatCurrency(clsUnitShare);", "if (elUnitShare) elUnitShare.textContent = formatWithPercent(clsUnitShare, clsUnitCost);")
content = content.replace("if (elUnitTotalLabor) elUnitTotalLabor.textContent = formatCurrency(clsUnitShare + clsUnitLaborShare);", "if (elUnitTotalLabor) elUnitTotalLabor.textContent = formatWithPercent(clsUnitShare + clsUnitLaborShare, clsUnitCost);")
content = content.replace("if (elUnitLaborShare) elUnitLaborShare.textContent = formatCurrency(clsUnitLaborShare);", "if (elUnitLaborShare) elUnitLaborShare.textContent = formatWithPercent(clsUnitLaborShare, clsUnitCost);")
content = content.replace("if (elUnitGUG) elUnitGUG.textContent = formatCurrency(clsUnitGUG);", "if (elUnitGUG) elUnitGUG.textContent = formatWithPercent(clsUnitGUG, clsUnitCost);")
content = content.replace("if (elUnitFaal) elUnitFaal.textContent = formatCurrency(clsUnitPazarlama + clsUnitYonetim + clsUnitArge);", "if (elUnitFaal) elUnitFaal.textContent = formatWithPercent(clsUnitPazarlama + clsUnitYonetim + clsUnitArge, clsUnitCost);")
content = content.replace("if (elUnitPaz) elUnitPaz.textContent = formatCurrency(clsUnitPazarlama);", "if (elUnitPaz) elUnitPaz.textContent = formatWithPercent(clsUnitPazarlama, clsUnitCost);")
content = content.replace("if (elUnitYon) elUnitYon.textContent = formatCurrency(clsUnitYonetim);", "if (elUnitYon) elUnitYon.textContent = formatWithPercent(clsUnitYonetim, clsUnitCost);")
content = content.replace("if (elUnitArg) elUnitArg.textContent = formatCurrency(clsUnitArge);", "if (elUnitArg) elUnitArg.textContent = formatWithPercent(clsUnitArge, clsUnitCost);")
content = content.replace("if (elUnitFin) elUnitFin.textContent = formatCurrency(clsUnitFinansman);", "if (elUnitFin) elUnitFin.textContent = formatWithPercent(clsUnitFinansman, clsUnitCost);")

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
