import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'(<span>.ube Net Maliyeti:</span>\s*)<span>\$\{formatCurrency\(netTotal\)\}</span>'
replacement = r'\1<span>${formatWithPercent(netTotal, globalNetTotal)}</span>'

content = re.sub(pattern, replacement, content)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
