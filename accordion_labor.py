import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Branch Card Replacement
branch_pattern = r'<div class="result-row">\s*<span>Şube Eşit Dağıtılan İşçilik Payı:</span>\s*<span style="color: var\(--warning\);">\$\{formatCurrency\(branch\.branchShare\)\}</span>\s*</div>'

branch_new = r"""<div class="result-row accordion-header" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('active')">
                          <span>Şube Toplam İşçilik Payı: <span class="chevron">▼</span></span>
                          <span style="color: var(--warning);">${formatCurrency(branch.branchShare + (branch.laborCost || 0))}</span>
                      </div>
                      <div class="accordion-content">
                          <div class="result-row">
                              <span>Şube Eşit Dağıtılan İşçilik Payı:</span>
                              <span style="color: var(--warning);">${formatCurrency(branch.branchShare)}</span>
                          </div>
                          <div class="result-row">
                              <span>Şube İşçilik Maliyeti:</span>
                              <span style="color: var(--warning);">${formatCurrency(branch.laborCost || 0)}</span>
                          </div>
                      </div>"""

content = re.sub(branch_pattern, branch_new, content)

# 2. Class Card Replacement
class_pattern = r'<div class="result-row">\s*<span>Sınıf Eşit Dağıtılan İşçilik Payı:</span>\s*<span id="cls-share-\$\{cIndex\}" style="color: var\(--warning\);">0 ₺</span>\s*</div>\s*<div class="result-row">\s*<span>Sınıf İşçilik Payı:</span>\s*<span id="cls-labor-share-\$\{cIndex\}" style="color: var\(--warning\);">0 ₺</span>\s*</div>'

class_new = r"""<div class="result-row accordion-header" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('active')">
                          <span>Sınıf Toplam İşçilik Payı: <span class="chevron">▼</span></span>
                          <span id="cls-total-labor-${cIndex}" style="color: var(--warning);">0 ₺</span>
                      </div>
                      <div class="accordion-content">
                          <div class="result-row">
                              <span>Sınıf Eşit Dağıtılan İşçilik Payı:</span>
                              <span id="cls-share-${cIndex}" style="color: var(--warning);">0 ₺</span>
                          </div>
                          <div class="result-row">
                              <span>Sınıf İşçilik Payı:</span>
                              <span id="cls-labor-share-${cIndex}" style="color: var(--warning);">0 ₺</span>
                          </div>
                      </div>"""

content = re.sub(class_pattern, class_new, content)

# 3. Unit Card Replacement
unit_pattern = r'<div class="result-row unit">\s*<span>1 Adet Makine İçin Eşit Dağıtılan İşçilik Payı:</span>\s*<span id="cls-unit-share-\$\{cIndex\}" style="color: var\(--warning\);">0 ₺</span>\s*</div>\s*<div class="result-row unit">\s*<span>1 Adet Makine İçin İşçilik Payı:</span>\s*<span id="cls-unit-labor-share-\$\{cIndex\}" style="color: var\(--warning\);">0 ₺</span>\s*</div>'

unit_new = r"""<div class="result-row unit accordion-header" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('active')">
                          <span>1 Adet Makine İçin Toplam İşçilik Payı: <span class="chevron">▼</span></span>
                          <span id="cls-unit-total-labor-${cIndex}" style="color: var(--warning);">0 ₺</span>
                      </div>
                      <div class="accordion-content">
                          <div class="result-row unit">
                              <span>1 Adet Makine İçin Eşit Dağıtılan İşçilik Payı:</span>
                              <span id="cls-unit-share-${cIndex}" style="color: var(--warning);">0 ₺</span>
                          </div>
                          <div class="result-row unit">
                              <span>1 Adet Makine İçin İşçilik Payı:</span>
                              <span id="cls-unit-labor-share-${cIndex}" style="color: var(--warning);">0 ₺</span>
                          </div>
                      </div>"""

content = re.sub(unit_pattern, unit_new, content)

# 4. Insert logic into calculateDetail()
calc_logic = r"""                  document.getElementById(`cls-share-${cIndex}`).textContent = formatCurrency(clsShare);
                  document.getElementById(`cls-labor-share-${cIndex}`).textContent = formatCurrency(clsLaborShare);"""

calc_logic_new = r"""                  document.getElementById(`cls-share-${cIndex}`).textContent = formatCurrency(clsShare);
                  document.getElementById(`cls-labor-share-${cIndex}`).textContent = formatCurrency(clsLaborShare);
                  const elTotalLabor = document.getElementById(`cls-total-labor-${cIndex}`);
                  if (elTotalLabor) elTotalLabor.textContent = formatCurrency(clsShare + clsLaborShare);"""

content = content.replace(calc_logic, calc_logic_new)

calc_unit_logic = r"""                  const elUnitShare = document.getElementById(`cls-unit-share-${cIndex}`);
                  if (elUnitShare) elUnitShare.textContent = formatCurrency(clsUnitShare);
                  
                  const elUnitLaborShare = document.getElementById(`cls-unit-labor-share-${cIndex}`);
                  if (elUnitLaborShare) elUnitLaborShare.textContent = formatCurrency(clsUnitLaborShare);"""

calc_unit_logic_new = r"""                  const elUnitShare = document.getElementById(`cls-unit-share-${cIndex}`);
                  if (elUnitShare) elUnitShare.textContent = formatCurrency(clsUnitShare);
                  
                  const elUnitLaborShare = document.getElementById(`cls-unit-labor-share-${cIndex}`);
                  if (elUnitLaborShare) elUnitLaborShare.textContent = formatCurrency(clsUnitLaborShare);
                  
                  const elUnitTotalLabor = document.getElementById(`cls-unit-total-labor-${cIndex}`);
                  if (elUnitTotalLabor) elUnitTotalLabor.textContent = formatCurrency(clsUnitShare + clsUnitLaborShare);"""

content = content.replace(calc_unit_logic, calc_unit_logic_new)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
