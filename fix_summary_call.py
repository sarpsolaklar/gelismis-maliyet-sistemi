import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove the accidental renderFactorySummary from btnAddBranch
content = content.replace("calculateGlobal();\n        renderFactorySummary();\n    });", "calculateGlobal();\n    });")

# 2. Add it at the end of calculateGlobal()
# Look for calculateGlobal definition
pattern = r'(function calculateGlobal\(\) \{[\s\S]*?)(    document\.getElementById\(\'globalNetProfit\'\)\.style\.color = globalTotalProfit >= 0 \? \'var\(--success\)\' : \'var\(--danger\)\';\n\})'
replacement = r'\1    document.getElementById(\'globalNetProfit\').style.color = globalTotalProfit >= 0 ? \'var(--success)\' : \'var(--danger)\';\n\n    // UPDATE FACTORY SUMMARY TAB\n    renderFactorySummary();\n}'
content = re.sub(pattern, replacement, content)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
