import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Clean up the bad injection
bad_injection = r"""\nfunction formatWithPercent\(val, total\) \{
    if \(!total \|\| total === 0\) return formatCurrency\(val\) \+ " \(%0\.00\)";
    return formatCurrency\(val\) \+ ` \(%\$\{\(\(val / total\) \* 100\)\.toFixed\(2\)\}\)`;
\}"""
content = re.sub(bad_injection, "", content)

# Now inject it correctly
correct_injection = r"""
    function formatCurrency(num) {
        return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num) + ' ₺';
    }
    
    function formatWithPercent(val, total) {
        if (!total || total === 0) return formatCurrency(val) + " (%0.00)";
        return formatCurrency(val) + ` (%${((val / total) * 100).toFixed(2)})`;
    }
"""

pattern = r"function formatCurrency\(num\) \{\s*return new Intl\.NumberFormat\('tr-TR', \{ minimumFractionDigits: 2, maximumFractionDigits: 2 \}\)\.format\(num\) \+ ' ₺';\s*\}"
# use a non-raw string or lambda for repl
content = re.sub(pattern, lambda m: correct_injection, content)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
