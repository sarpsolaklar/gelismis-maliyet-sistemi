import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Branch Card
branch_pattern = r'<div class="result-row">\s*<span>Şube Toplam Pazarlama Gideri Payı:</span>\s*<span style="color: var\(--accent-1\);">\$\{formatCurrency\(branch\.branchPazarlama\)\}</span>\s*</div>\s*<div class="result-row">\s*<span>Şube Toplam Genel Yönetim Gideri Payı:</span>\s*<span style="color: var\(--accent-1\);">\$\{formatCurrency\(branch\.branchYonetim\)\}</span>\s*</div>\s*<div class="result-row">\s*<span>Şube Toplam AR-GE Gideri Payı:</span>\s*<span style="color: var\(--accent-1\);">\$\{formatCurrency\(branch\.branchArge \|\| 0\)\}</span>\s*</div>\s*<div class="result-row">\s*<span>Şube Toplam Faaliyet Gideri Payı:</span>\s*<span style="color: var\(--accent-2\);">\$\{formatCurrency\(\(branch\.branchPazarlama \|\| 0\) \+ \(branch\.branchYonetim \|\| 0\) \+ \(branch\.branchArge \|\| 0\)\)\}</span>\s*</div>'

branch_new = r"""<div class="result-row accordion-header" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('active')">
                          <span>Şube Toplam Faaliyet Gideri Payı: <span class="chevron">▼</span></span>
                          <span style="color: var(--accent-2);">${formatCurrency((branch.branchPazarlama || 0) + (branch.branchYonetim || 0) + (branch.branchArge || 0))}</span>
                      </div>
                      <div class="accordion-content">
                          <div class="result-row">
                              <span>Şube Toplam Pazarlama Gideri Payı:</span>
                              <span style="color: var(--accent-1);">${formatCurrency(branch.branchPazarlama)}</span>
                          </div>
                          <div class="result-row">
                              <span>Şube Toplam Genel Yönetim Gideri Payı:</span>
                              <span style="color: var(--accent-1);">${formatCurrency(branch.branchYonetim)}</span>
                          </div>
                          <div class="result-row">
                              <span>Şube Toplam AR-GE Gideri Payı:</span>
                              <span style="color: var(--accent-1);">${formatCurrency(branch.branchArge || 0)}</span>
                          </div>
                      </div>"""

content = re.sub(branch_pattern, branch_new, content)

# 2. Class Card
class_pattern = r'<div class="result-row">\s*<span>Sınıf Pazarlama Gideri Payı:</span>\s*<span id="cls-paz-\$\{cIndex\}" style="color: var\(--accent-1\);">0 ₺</span>\s*</div>\s*<div class="result-row">\s*<span>Sınıf Genel Yönetim Gideri Payı:</span>\s*<span id="cls-yonetim-\$\{cIndex\}" style="color: var\(--accent-1\);">0 ₺</span>\s*</div>\s*<div class="result-row">\s*<span>Sınıf AR-GE Gideri Payı:</span>\s*<span id="cls-arge-\$\{cIndex\}" style="color: var\(--accent-1\);">0 ₺</span>\s*</div>\s*<div class="result-row">\s*<span>Sınıf Toplam Faaliyet Gideri Payı:</span>\s*<span id="cls-faaliyet-\$\{cIndex\}" style="color: var\(--accent-2\);">0 ₺</span>\s*</div>'

class_new = r"""<div class="result-row accordion-header" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('active')">
                          <span>Sınıf Toplam Faaliyet Gideri Payı: <span class="chevron">▼</span></span>
                          <span id="cls-faaliyet-${cIndex}" style="color: var(--accent-2);">0 ₺</span>
                      </div>
                      <div class="accordion-content">
                          <div class="result-row">
                              <span>Sınıf Pazarlama Gideri Payı:</span>
                              <span id="cls-paz-${cIndex}" style="color: var(--accent-1);">0 ₺</span>
                          </div>
                          <div class="result-row">
                              <span>Sınıf Genel Yönetim Gideri Payı:</span>
                              <span id="cls-yonetim-${cIndex}" style="color: var(--accent-1);">0 ₺</span>
                          </div>
                          <div class="result-row">
                              <span>Sınıf AR-GE Gideri Payı:</span>
                              <span id="cls-arge-${cIndex}" style="color: var(--accent-1);">0 ₺</span>
                          </div>
                      </div>"""

content = re.sub(class_pattern, class_new, content)

# 3. Unit Card
unit_pattern = r'<div class="result-row unit">\s*<span>1 Adet Makine İçin Pazarlama Gideri Payı:</span>\s*<span id="cls-unit-paz-\$\{cIndex\}" style="color: var\(--accent-1\);">0 ₺</span>\s*</div>\s*<div class="result-row unit">\s*<span>1 Adet Makine İçin Genel Yönetim Gideri Payı:</span>\s*<span id="cls-unit-yonetim-\$\{cIndex\}" style="color: var\(--accent-1\);">0 ₺</span>\s*</div>\s*<div class="result-row unit">\s*<span>1 Adet Makine İçin AR-GE Gideri Payı:</span>\s*<span id="cls-unit-arge-\$\{cIndex\}" style="color: var\(--accent-1\);">0 ₺</span>\s*</div>\s*<div class="result-row unit">\s*<span>1 Adet Makine İçin Toplam Faaliyet Gideri Payı:</span>\s*<span id="cls-unit-faaliyet-\$\{cIndex\}" style="color: var\(--accent-2\);">0 ₺</span>\s*</div>'

unit_new = r"""<div class="result-row unit accordion-header" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('active')">
                          <span>1 Adet Makine İçin Toplam Faaliyet Gideri Payı: <span class="chevron">▼</span></span>
                          <span id="cls-unit-faaliyet-${cIndex}" style="color: var(--accent-2);">0 ₺</span>
                      </div>
                      <div class="accordion-content">
                          <div class="result-row unit">
                              <span>1 Adet Makine İçin Pazarlama Gideri Payı:</span>
                              <span id="cls-unit-paz-${cIndex}" style="color: var(--accent-1);">0 ₺</span>
                          </div>
                          <div class="result-row unit">
                              <span>1 Adet Makine İçin Genel Yönetim Gideri Payı:</span>
                              <span id="cls-unit-yonetim-${cIndex}" style="color: var(--accent-1);">0 ₺</span>
                          </div>
                          <div class="result-row unit">
                              <span>1 Adet Makine İçin AR-GE Gideri Payı:</span>
                              <span id="cls-unit-arge-${cIndex}" style="color: var(--accent-1);">0 ₺</span>
                          </div>
                      </div>"""

content = re.sub(unit_pattern, unit_new, content)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
