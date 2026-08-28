import sys

with open('script.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 1. Add totalCiro calculation
idx = -1
for i, line in enumerate(lines):
    if 'let classCount = 0;' in line:
        idx = i
        break

if idx != -1:
    lines.insert(idx, '        let totalCiro = 0;\n')

# Find brutKar += branch.branchTotalProfit || 0;
for i, line in enumerate(lines):
    if 'brutKar += branch.branchTotalProfit || 0;' in line:
        lines.insert(i+1, '            if (branch.subClasses) {\n                branch.subClasses.forEach(cls => {\n                    totalCiro += (cls.quantity || 0) * (cls.salePrice || 0);\n                });\n            }\n')
        break

# 2. Add Toplam Ciro HTML above Fabrika Net Maliyeti
html_idx = -1
for i, line in enumerate(lines):
    if '<span style="margin-top: 4px;">Fabrika Net Maliyeti:</span>' in line:
        html_idx = i - 1  # the <div class="result-row total"...> line
        break

if html_idx != -1:
    html_to_add = [
        '            <div class="result-row total">\n',
        '                <span style="margin-top: 4px;">Fabrika Toplam Satış Geliri (Ciro):</span>\n',
        '                <div style="display: flex; flex-direction: column; align-items: flex-end;">\n',
        '                    <span style="color: var(--success); font-weight: 600;">${formatCurrency(totalCiro)}</span>\n',
        '                    <span style="font-size: 0.75rem; color: var(--text-secondary); opacity: 0.8; font-weight: normal; margin-top: 2px;">(${numberToTurkishText(totalCiro)})</span>\n',
        '                </div>\n',
        '            </div>\n'
    ]
    lines = lines[:html_idx] + html_to_add + lines[html_idx:]

with open('script.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)
