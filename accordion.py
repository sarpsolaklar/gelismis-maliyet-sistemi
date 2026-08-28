import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Branch Card
branch_old = """                      <div class="result-row">
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
                      <div class="result-row">
                          <span>Şube Toplam Faaliyet Gideri Payı:</span>
                          <span style="color: var(--accent-2);">${formatCurrency((branch.branchPazarlama || 0) + (branch.branchYonetim || 0) + (branch.branchArge || 0))}</span>
                      </div>"""

branch_new = """                      <div class="result-row accordion-header" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('active')">
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

content = content.replace(branch_old, branch_new)


# 2. Class Card
class_old = """                      <div class="result-row">
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
                      <div class="result-row">
                          <span>Sınıf Toplam Faaliyet Gideri Payı:</span>
                          <span id="cls-faaliyet-${cIndex}" style="color: var(--accent-2);">0 ₺</span>
                      </div>"""

class_new = """                      <div class="result-row accordion-header" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('active')">
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

content = content.replace(class_old, class_new)


# 3. Unit Card
unit_old = """                      <div class="result-row unit">
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
                      <div class="result-row unit">
                          <span>1 Adet Makine İçin Toplam Faaliyet Gideri Payı:</span>
                          <span id="cls-unit-faaliyet-${cIndex}" style="color: var(--accent-2);">0 ₺</span>
                      </div>"""

unit_new = """                      <div class="result-row unit accordion-header" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('active')">
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

content = content.replace(unit_old, unit_new)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
