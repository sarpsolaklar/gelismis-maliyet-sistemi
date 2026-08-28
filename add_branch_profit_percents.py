import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add percentages to Branch profits
# branchNetKar, branchFaaliyetKari, branchBrutKar
content = content.replace("${formatCurrency(branchNetKar)}", "${formatWithPercent(branchNetKar, netTotal)}")
content = content.replace("${formatCurrency(branchFaaliyetKari)}", "${formatWithPercent(branchFaaliyetKari, netTotal)}")
content = content.replace("${formatCurrency(branchBrutKar)}", "${formatWithPercent(branchBrutKar, netTotal)}")

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
