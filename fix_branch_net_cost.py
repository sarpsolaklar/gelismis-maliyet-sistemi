import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Revert netTotal assignment
content = content.replace("const netTotal = globalNetTotal || 0;", "const netTotal = branch.branchNetTotal || 0;")

# 2. Inside the Branch template string, we must replace all formatWithPercent(..., netTotal) to formatWithPercent(..., globalNetTotal)
# But only for the branch fields, NOT for the class fields.
# Luckily, the branch fields are formatted like this:
content = content.replace("formatWithPercent(branch.branchBaseTotal, netTotal)", "formatWithPercent(branch.branchBaseTotal, globalNetTotal)")
content = content.replace("formatWithPercent(branch.branchShare + (branch.laborCost || 0), netTotal)", "formatWithPercent(branch.branchShare + (branch.laborCost || 0), globalNetTotal)")
content = content.replace("formatWithPercent(branch.branchGUG, netTotal)", "formatWithPercent(branch.branchGUG, globalNetTotal)")
content = content.replace("formatWithPercent((branch.branchPazarlama || 0) + (branch.branchYonetim || 0) + (branch.branchArge || 0), netTotal)", "formatWithPercent((branch.branchPazarlama || 0) + (branch.branchYonetim || 0) + (branch.branchArge || 0), globalNetTotal)")
content = content.replace("formatWithPercent(branch.branchPazarlama, netTotal)", "formatWithPercent(branch.branchPazarlama, globalNetTotal)")
content = content.replace("formatWithPercent(branch.branchYonetim, netTotal)", "formatWithPercent(branch.branchYonetim, globalNetTotal)")
content = content.replace("formatWithPercent(branch.branchArge || 0, netTotal)", "formatWithPercent(branch.branchArge || 0, globalNetTotal)")
content = content.replace("formatWithPercent(branch.branchFinansman || 0, netTotal)", "formatWithPercent(branch.branchFinansman || 0, globalNetTotal)")

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
