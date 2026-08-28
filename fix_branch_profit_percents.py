import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Şube Net Maliyeti -> add percent (relative to globalNetTotal)
content = content.replace(
    "<span>${formatCurrency(netTotal)}</span>\n                      </div>\n                      <div class=\"result-row total accordion-header\"",
    "<span>${formatWithPercent(netTotal, globalNetTotal)}</span>\n                      </div>\n                      <div class=\"result-row total accordion-header\""
)

# 2. Şube Net Kar -> add percent (relative to netTotal)
target_net_kar = r"\$\{formatCurrency\(branch\.branchTotalProfit - \(\(branch\.branchPazarlama \|\| 0\) \+ \(branch\.branchYonetim \|\| 0\) \+ \(branch\.branchArge \|\| 0\)\) - \(branch\.branchFinansman \|\| 0\)\)\}"
replacement_net_kar = r"${formatWithPercent(branch.branchTotalProfit - ((branch.branchPazarlama || 0) + (branch.branchYonetim || 0) + (branch.branchArge || 0)) - (branch.branchFinansman || 0), netTotal)}"
content = re.sub(target_net_kar, replacement_net_kar, content)

# 3. Şube Faaliyet Karı -> add percent (relative to netTotal)
target_faaliyet_kar = r"\$\{formatCurrency\(branch\.branchTotalProfit - \(\(branch\.branchPazarlama \|\| 0\) \+ \(branch\.branchYonetim \|\| 0\) \+ \(branch\.branchArge \|\| 0\)\)\)\}"
replacement_faaliyet_kar = r"${formatWithPercent(branch.branchTotalProfit - ((branch.branchPazarlama || 0) + (branch.branchYonetim || 0) + (branch.branchArge || 0)), netTotal)}"
content = re.sub(target_faaliyet_kar, replacement_faaliyet_kar, content)

# 4. Şube Brut Kar -> add percent (relative to netTotal)
target_brut_kar = r"\$\{formatCurrency\(branch\.branchTotalProfit\)\}"
replacement_brut_kar = r"${formatWithPercent(branch.branchTotalProfit, netTotal)}"
content = re.sub(target_brut_kar, replacement_brut_kar, content)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
