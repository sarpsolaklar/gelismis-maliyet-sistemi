import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "const netTotal = branch.branchNetTotal || 0;",
    "const netTotal = globalNetTotal || 0;"
)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
