import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add "1 Adet Makine Hammadde Toplamı"
target_str = """                      <div class="result-row unit accordion-header" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('active')">
                            <span>1 Adet Makine İçin Toplam İşçilik Payı"""

replacement_str = """                      <div class="result-row unit">
                          <span>1 Adet Makine Hammadde Toplamı:</span>
                          <span id="cls-unit-base-${cIndex}" style="color: var(--text-primary);">0 ₺</span>
                      </div>
                      <div class="result-row unit accordion-header" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('active')">
                            <span>1 Adet Makine İçin Toplam İşçilik Payı"""

content = content.replace(target_str, replacement_str)

# 2. Add % to "1 Adet Makine İçin Genel Üretim Gideri Payı"
# The js is: const elUnitGug = document.getElementById(`cls-unit-gug-${cIndex}`); if (elUnitGug) elUnitGug.textContent = formatCurrency(clsUnitGUG);
content = content.replace("elUnitGug.textContent = formatCurrency(clsUnitGUG);", "elUnitGug.textContent = formatWithPercent(clsUnitGUG, clsUnitCost);")

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
