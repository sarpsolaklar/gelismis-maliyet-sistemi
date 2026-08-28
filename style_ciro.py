import sys

with open('script.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if '<span>Toplam Satış Geliri (Ciro):</span>' in line:
        if '<div class="result-row">' in lines[i-1]:
            lines[i-1] = lines[i-1].replace('<div class="result-row">', '<div class="result-row total">')
            
            # The span also has inline color style that overrides the white text of .total
            # '                        <span style="color: var(--success); font-weight: 600;">${formatCurrency(branchTotalRevenue)}</span>\n'
            # Let's remove the inline style to match the exact look of "Şube Net Maliyeti"
            lines[i+1] = '                        <span>${formatCurrency(branchTotalRevenue)}</span>\n'
        break

with open('script.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)
