import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "formatCurrency((branch.branchPazarlama || 0) + (branch.branchYonetim || 0) + (branch.branchArge || 0))",
    "formatWithPercent((branch.branchPazarlama || 0) + (branch.branchYonetim || 0) + (branch.branchArge || 0), netTotal)"
)

content = content.replace(
    "formatCurrency(branch.branchPazarlama)",
    "formatWithPercent(branch.branchPazarlama, netTotal)"
)

content = content.replace(
    "formatCurrency(branch.branchYonetim)",
    "formatWithPercent(branch.branchYonetim, netTotal)"
)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
