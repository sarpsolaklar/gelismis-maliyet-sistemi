import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix Branch Faaliyet Gideri Payı
target = "                            <span style=\"color: var(--accent-2);\">${formatCurrency((branch.branchPazarlama || 0) + (branch.branchYonetim || 0) + (branch.branchArge || 0))}</span>"
replacement = "                            <span style=\"color: var(--accent-2);\">${formatWithPercent((branch.branchPazarlama || 0) + (branch.branchYonetim || 0) + (branch.branchArge || 0), netTotal)}</span>"
content = content.replace(target, replacement)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
