import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Add ID and display none to global side panel
content = content.replace('<div class="side-panel">\n                    <div class="glass-card shared-expense-card no-print">', '<div class="side-panel" id="globalSidePanel" style="display: none;">\n                    <div class="glass-card shared-expense-card no-print">')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
