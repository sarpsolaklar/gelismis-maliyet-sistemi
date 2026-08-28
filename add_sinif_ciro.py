import sys

with open('script.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

html_to_add = [
    '                    <div class="result-row total">\n',
    '                        <span>Sınıf Toplam Satış Geliri (Ciro):</span>\n',
    '                        <span id="cls-revenue-${cIndex}" style="font-weight: 600;">0 ₺</span>\n',
    '                    </div>\n'
]

# Find "<span>Sınıf Net Maliyeti:</span>" in HTML
html_idx = -1
for i, line in enumerate(lines):
    if "<span>Sınıf Net Maliyeti:</span>" in line:
        html_idx = i - 1  # The <div class="result-row total"...> line
        break

if html_idx != -1:
    lines = lines[:html_idx] + html_to_add + lines[html_idx:]

# Find "document.getElementById(`cls-net-${cIndex}`).textContent = formatCurrency(clsNet);"
js_idx = -1
for i, line in enumerate(lines):
    if "document.getElementById(`cls-net-${cIndex}`).textContent = formatCurrency(clsNet);" in line:
        js_idx = i + 1
        break

if js_idx != -1:
    js_to_add = [
        '                const elClsRevenue = document.getElementById(`cls-revenue-${cIndex}`);\n',
        '                if (elClsRevenue) {\n',
        '                    elClsRevenue.textContent = formatCurrency((cls.quantity || 0) * (cls.salePrice || 0));\n',
        '                }\n'
    ]
    lines = lines[:js_idx] + js_to_add + lines[js_idx:]

with open('script.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)
