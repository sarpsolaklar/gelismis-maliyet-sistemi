import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# For Class Labor
p1 = r"(document\.getElementById\(`cls-labor-share-\$\{cIndex\}`\)\.textContent = formatCurrency\(clsLaborShare\);)"
r1 = r"""\1
                  const elTotalLabor = document.getElementById(`cls-total-labor-${cIndex}`);
                  if (elTotalLabor) elTotalLabor.textContent = formatCurrency(clsShare + clsLaborShare);"""

content = re.sub(p1, r1, content)

# For Unit Labor
p2 = r"(const elUnitLaborShare = document\.getElementById\(`cls-unit-labor-share-\$\{cIndex\}`\);\s*if \(elUnitLaborShare\) elUnitLaborShare\.textContent = formatCurrency\(clsUnitLaborShare\);)"
r2 = r"""\1
                  const elUnitTotalLabor = document.getElementById(`cls-unit-total-labor-${cIndex}`);
                  if (elUnitTotalLabor) elUnitTotalLabor.textContent = formatCurrency(clsUnitShare + clsUnitLaborShare);"""

content = re.sub(p2, r2, content)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
