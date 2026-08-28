import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

helper = r"""function formatWithPercent(val, total) {
    if (!total || total === 0) return formatCurrency(val) + " (%0.00)";
    return formatCurrency(val) + ` (%${((val / total) * 100).toFixed(2)})`;
}
"""

# Find where formatCurrency is and append the helper
pattern = r"(function formatCurrency\(num\) \{\s*return num\.toLocaleString\('tr-TR', \{ minimumFractionDigits: 2, maximumFractionDigits: 2 \}\) \+ ' ₺';\s*\})"

content = re.sub(pattern, r"\1\n\n" + helper, content)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
