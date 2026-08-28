import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's clean up the bad injection
bad_injection = r"""
function formatWithPercent\(val, total\) \{
    if \(!total \|\| total === 0\) return formatCurrency\(val\) \+ " \(%0\.00\)";
    return formatCurrency\(val\) \+ ` \(%\$\{\(\(val / total\) \* 100\)\.toFixed\(2\)\}\)`;
\}"""
content = re.sub(bad_injection, "", content)

# Now inject it correctly after the closing brace of formatCurrency
correct_injection = r"""
    function formatCurrency(num) {
        return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num) + ' \u20BA';
    }
    
    function formatWithPercent(val, total) {
        if (!total || total === 0) return formatCurrency(val) + " (%0.00)";
        return formatCurrency(val) + ` (%${((val / total) * 100).toFixed(2)})`;
    }
"""

# Match the old formatCurrency and replace
pattern = r"function formatCurrency\(num\) \{\s*return new Intl\.NumberFormat\('tr-TR', \{ minimumFractionDigits: 2, maximumFractionDigits: 2 \}\)\.format\(num\) \+ ' ₺';\s*\}"
content = re.sub(pattern, correct_injection, content)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
