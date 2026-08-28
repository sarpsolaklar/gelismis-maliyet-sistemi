import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the explanatory note
target_note = """                  <div class="branch-results">
                        <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.8rem; opacity: 0.8; line-height: 1.4;">
                            <i style="margin-right:4px;">ℹ</i>Aşağıdaki yüzdelikler, bu tek makinenin <b>Tüm Fabrika Net Maliyeti (Global Net Total)</b> içerisindeki payını gösterir.
                        </div>
                        <div class="result-row unit">"""
replacement_note = """                  <div class="branch-results">
                        <div class="result-row unit">"""
content = content.replace(target_note, replacement_note)

# Revert window.globalNetTotal to clsUnitCost for unit percents
content = content.replace("formatWithPercent(cls.machineCost || 0, window.globalNetTotal)", "formatWithPercent(cls.machineCost || 0, clsUnitCost)")
content = content.replace("formatWithPercent(clsUnitShare, window.globalNetTotal)", "formatWithPercent(clsUnitShare, clsUnitCost)")
content = content.replace("formatWithPercent(clsUnitLaborShare, window.globalNetTotal)", "formatWithPercent(clsUnitLaborShare, clsUnitCost)")
content = content.replace("formatWithPercent(clsUnitShare + clsUnitLaborShare, window.globalNetTotal)", "formatWithPercent(clsUnitShare + clsUnitLaborShare, clsUnitCost)")
content = content.replace("formatWithPercent(clsUnitGUG, window.globalNetTotal)", "formatWithPercent(clsUnitGUG, clsUnitCost)")
content = content.replace("formatWithPercent(clsUnitPazarlama, window.globalNetTotal)", "formatWithPercent(clsUnitPazarlama, clsUnitCost)")
content = content.replace("formatWithPercent(clsUnitYonetim, window.globalNetTotal)", "formatWithPercent(clsUnitYonetim, clsUnitCost)")
content = content.replace("formatWithPercent(clsUnitArge, window.globalNetTotal)", "formatWithPercent(clsUnitArge, clsUnitCost)")
content = content.replace("formatWithPercent(clsUnitFinansman, window.globalNetTotal)", "formatWithPercent(clsUnitFinansman, clsUnitCost)")
content = content.replace("formatWithPercent(clsUnitPazarlama + clsUnitYonetim + clsUnitArge, window.globalNetTotal)", "formatWithPercent(clsUnitPazarlama + clsUnitYonetim + clsUnitArge, clsUnitCost)")

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
