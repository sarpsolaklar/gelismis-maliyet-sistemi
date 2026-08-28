with open('script.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

helper = """
function formatWithPercent(val, total) {
    if (!total || total === 0) return formatCurrency(val) + " (%0.00)";
    return formatCurrency(val) + ` (%${((val / total) * 100).toFixed(2)})`;
}
"""

# Insert right after formatCurrency
for i, line in enumerate(lines):
    if "function formatCurrency(num)" in line:
        # Find closing brace
        for j in range(i, len(lines)):
            if "}" in lines[j]:
                lines.insert(j + 1, helper)
                break
        break

with open('script.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)
