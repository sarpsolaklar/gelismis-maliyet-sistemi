import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Branch Profit Note
pattern_branch_profit = r'(<div class="result-row total accordion-header"[^>]*>\s*<span>.ube Net K.r: <span class="chevron"> </span></span>)'
replacement_branch_profit = r"""<div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 1rem; margin-bottom: 0.5rem; opacity: 0.8; line-height: 1.4;">
                            <i style="margin-right:4px;">ℹ</i>Aşağıdaki kâr oranları, şubenin kendi <b>Net Maliyeti</b> üzerinden kâr marjını gösterir.
                        </div>
                        \1"""
content = re.sub(pattern_branch_profit, replacement_branch_profit, content)


# 2. Class Cost Note
pattern_class_cost = r'(<div class="result-row">\s*<span>Sınıf Hammadde Toplamı:</span>)'
replacement_class_cost = r"""<div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.8rem; opacity: 0.8; line-height: 1.4;">
                            <i style="margin-right:4px;">ℹ</i>Aşağıdaki yüzdelikler, giderlerin <b>Sınıf Net Maliyeti</b> içerisindeki payını gösterir.
                        </div>
                        \1"""
content = re.sub(pattern_class_cost, replacement_class_cost, content)


# 3. Class Profit Note
pattern_class_profit = r'(<div class="result-row total accordion-header"[^>]*>\s*<span>Sınıf Net K.r: <span class="chevron"> </span></span>)'
replacement_class_profit = r"""<div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 1rem; margin-bottom: 0.5rem; opacity: 0.8; line-height: 1.4;">
                            <i style="margin-right:4px;">ℹ</i>Kâr oranları, sınıfın kendi <b>Net Maliyeti</b> üzerinden kâr marjını gösterir.
                        </div>
                        \1"""
content = re.sub(pattern_class_profit, replacement_class_profit, content)


# 4. Unit Cost Note
pattern_unit_cost = r'(<div class="result-row unit">\s*<span>1 Adet Makine Hammadde Toplamı:</span>)'
replacement_unit_cost = r"""<div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.8rem; opacity: 0.8; line-height: 1.4;">
                            <i style="margin-right:4px;">ℹ</i>Aşağıdaki yüzdelikler, 1 adet makinenin kendi <b>Net Maliyeti</b> içerisindeki payını gösterir (Sınıf ile aynıdır).
                        </div>
                        \1"""
content = re.sub(pattern_unit_cost, replacement_unit_cost, content)


# 5. Unit Profit Note
pattern_unit_profit = r'(<div class="result-row unit accordion-header"[^>]*>\s*<span>1 Adet Makine .çin Net K.r: <span class="chevron"> </span></span>)'
replacement_unit_profit = r"""<div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 1rem; margin-bottom: 0.5rem; opacity: 0.8; line-height: 1.4;">
                            <i style="margin-right:4px;">ℹ</i>Kâr oranları, 1 adet makinenin kendi <b>Net Maliyeti</b> üzerinden kâr marjını gösterir.
                        </div>
                        \1"""
content = re.sub(pattern_unit_profit, replacement_unit_profit, content)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
