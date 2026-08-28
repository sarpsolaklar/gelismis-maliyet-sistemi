import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace the tabs container
pattern_tabs = r'<div class="tabs-container no-print".*?</div>'
replacement_tabs = r'''<div class="tabs-container no-print" style="display: flex; gap: 1rem; margin-bottom: 2rem;">
                        <button id="tab-summary" class="btn-primary" style="flex: 1; border-radius: 12px; font-weight: 600; padding: 1rem;">Fabrika Özeti</button>
                        <button id="tab-branches" class="btn-secondary" style="flex: 1; border-radius: 12px; font-weight: 600; padding: 1rem; background: rgba(255,255,255,0.05); color: var(--text-secondary); border: 1px solid rgba(255,255,255,0.1);">Şubeler</button>
                    </div>'''

content = re.sub(pattern_tabs, replacement_tabs, content, flags=re.DOTALL)

# 2. Update containers display initial values
content = content.replace('<div id="factorySummaryContainer" style="display: none; width: 100%;">', '<div id="factorySummaryContainer" style="display: block; width: 100%;">')
content = content.replace('<div id="mainBranchesContainer" class="branches-grid">', '<div id="mainBranchesContainer" class="branches-grid" style="display: none;">')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
