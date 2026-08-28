import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the start of mainBranchesContainer
pattern = r'(<div id="mainBranchesContainer" class="branches-grid">)'
# We will wrap it in <div class="content-left"> and add tabs
replacement = r"""<div class="content-left">
                    <div class="tabs-container no-print" style="display: flex; gap: 1rem; margin-bottom: 2rem;">
                        <button id="tab-branches" class="btn-primary" style="flex: 1; border-radius: 12px; font-weight: 600; padding: 1rem;">Şubeler</button>
                        <button id="tab-summary" class="btn-secondary" style="flex: 1; border-radius: 12px; font-weight: 600; padding: 1rem; background: rgba(255,255,255,0.05); color: var(--text-secondary); border: 1px solid rgba(255,255,255,0.1);">Tüm Fabrika Özeti</button>
                    </div>

                    <div id="factorySummaryContainer" style="display: none; width: 100%;">
                        <div class="glass-card branch-card" style="width: 100%;">
                            <h2 style="font-size: 1.5rem; margin-bottom: 1.5rem; text-align: center; color: var(--accent-1);">TÜM FABRİKA ÖZETİ</h2>
                            <div class="branch-results" id="factorySummaryResults">
                                <!-- Will be populated by JS -->
                            </div>
                        </div>
                    </div>

                    \1"""
content = re.sub(pattern, replacement, content)

# Find the end of mainBranchesContainer
# Note: we need to close <div class="content-left"> after mainBranchesContainer closes
# <div class="glass-card add-card no-print" id="btnAddBranch">
#     <div class="add-icon">+</div>
#     <h3>Yeni Şube Ekle</h3>
# </div>
# </div>
# <-- WE NEED TO ADD </div> HERE
pattern_end = r'(<h3>Yeni Şube Ekle</h3>\s*</div>\s*</div>)'
replacement_end = r'\1\n                </div>'
content = re.sub(pattern_end, replacement_end, content)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
