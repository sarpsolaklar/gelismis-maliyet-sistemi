import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("formatWithPercent(branch.branchShare, netTotal)", "formatWithPercent(branch.branchShare, globalNetTotal)")
content = content.replace("formatWithPercent(branch.laborCost || 0, netTotal)", "formatWithPercent(branch.laborCost || 0, globalNetTotal)")

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
