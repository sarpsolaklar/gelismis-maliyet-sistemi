import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

target = """                  <div class="branch-results">
                        <div class="result-row unit">
                            <span>1 Adet Makine Hammadde"""

replacement = """                  <div class="branch-results">
                        <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.8rem; opacity: 0.8; line-height: 1.4;">
                            <i style="margin-right:4px;">ℹ</i>Aşağıdaki yüzdelikler, bu tek makinenin <b>Tüm Fabrika Net Maliyeti (Global Net Total)</b> içerisindeki payını gösterir.
                        </div>
                        <div class="result-row unit">
                            <span>1 Adet Makine Hammadde"""

content = content.replace(target, replacement)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
