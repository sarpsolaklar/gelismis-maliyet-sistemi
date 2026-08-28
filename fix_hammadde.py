import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix Branch Hammadde Toplamı percentage
content = content.replace(
    "<span>${formatCurrency(branch.branchBaseTotal)}</span>",
    "<span>${formatWithPercent(branch.branchBaseTotal, netTotal)}</span>"
)

# 2. Fix Class Hammadde Toplamı text (it wrongly says Şube Hammadde Toplamı inside branch-results)
content = content.replace(
    """<div class="branch-results">
                      <div class="result-row">
                          <span>Şube Hammadde Toplamı:</span>
                          <span id="cls-bTotal-${cIndex}">0 ₺</span>
                      </div>""",
    """<div class="branch-results">
                      <div class="result-row">
                          <span>Sınıf Hammadde Toplamı:</span>
                          <span id="cls-bTotal-${cIndex}">0 ₺</span>
                      </div>"""
)

# 3. Add Unit Hammadde Toplamı row in the unit card HTML
unit_insert = """
                        <div class="accordion-content">
                            <div class="result-row unit">
                                <span>1 Adet Makine Hammadde Toplamı:</span>
                                <span id="cls-unit-base-${cIndex}" style="color: var(--text-primary);">0 ₺</span>
                            </div>
"""

# Wait, there's no accordion for Hammadde. Just insert it before Unit Labor:
target_unit_labor = """<span>1 Adet Makine İçin Toplam İşçilik Payı: <span class="chevron"> </span></span>"""
replacement_unit_labor = """
                      <div class="result-row unit">
                          <span>1 Adet Makine Hammadde Toplamı:</span>
                          <span id="cls-unit-base-${cIndex}">0 ₺</span>
                      </div>
                      <div class="result-row unit accordion-header" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('active')">
                            <span>1 Adet Makine İçin Toplam İşçilik Payı: <span class="chevron"> </span></span>"""
content = content.replace(
    """<span>1 Adet Makine İçin Toplam İşçilik Payı: <span class="chevron"> </span></span>""",
    replacement_unit_labor
)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
