import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Branch Card
branch_pattern = r'<div class="result-row total" style="margin-top: 1rem; border-left-color: var\(--success\); background: linear-gradient\(90deg, rgba\(16, 185, 129, 0\.1\) 0%, transparent 100%\);">\s*<span>Şube Brüt Kâr:</span>\s*<span style="color: \$\{branch\.branchTotalProfit >= 0 \? \'var\(--success\)\' : \'var\(--danger\)\'\};">\$\{formatCurrency\(branch\.branchTotalProfit\)\}</span>\s*</div>\s*<div class="result-row total" style="margin-top: 0\.5rem; border-left-color: var\(--accent-1\); background: linear-gradient\(90deg, rgba\(56, 189, 248, 0\.1\) 0%, transparent 100%\);">\s*<span>Şube Faaliyet Kârı:</span>\s*<span style="color: \$\{\(branch\.branchTotalProfit - \(\(branch\.branchPazarlama \|\| 0\) \+ \(branch\.branchYonetim \|\| 0\) \+ \(branch\.branchArge \|\| 0\)\)\) >= 0 \? \'var\(--success\)\' : \'var\(--danger\)\'\};">\$\{formatCurrency\(branch\.branchTotalProfit - \(\(branch\.branchPazarlama \|\| 0\) \+ \(branch\.branchYonetim \|\| 0\) \+ \(branch\.branchArge \|\| 0\)\)\)\}</span>\s*</div>\s*<div class="result-row total" style="margin-top: 0\.5rem; border-left-color: #8b5cf6; background: linear-gradient\(90deg, rgba\(139, 92, 246, 0\.1\) 0%, transparent 100%\);">\s*<span>Şube Net Kâr:</span>\s*<span style="color: \$\{\(branch\.branchTotalProfit - \(\(branch\.branchPazarlama \|\| 0\) \+ \(branch\.branchYonetim \|\| 0\) \+ \(branch\.branchArge \|\| 0\)\) - \(branch\.branchFinansman \|\| 0\)\) >= 0 \? \'var\(--success\)\' : \'var\(--danger\)\'\};">\$\{formatCurrency\(branch\.branchTotalProfit - \(\(branch\.branchPazarlama \|\| 0\) \+ \(branch\.branchYonetim \|\| 0\) \+ \(branch\.branchArge \|\| 0\)\) - \(branch\.branchFinansman \|\| 0\)\)\}</span>\s*</div>'

branch_new = r"""<div class="result-row total accordion-header" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('active')" style="margin-top: 1rem; border-left-color: #8b5cf6; background: linear-gradient(90deg, rgba(139, 92, 246, 0.1) 0%, transparent 100%);">
                          <span>Şube Net Kâr: <span class="chevron">▼</span></span>
                          <span style="color: ${(branch.branchTotalProfit - ((branch.branchPazarlama || 0) + (branch.branchYonetim || 0) + (branch.branchArge || 0)) - (branch.branchFinansman || 0)) >= 0 ? 'var(--success)' : 'var(--danger)'};">${formatCurrency(branch.branchTotalProfit - ((branch.branchPazarlama || 0) + (branch.branchYonetim || 0) + (branch.branchArge || 0)) - (branch.branchFinansman || 0))}</span>
                      </div>
                      <div class="accordion-content">
                          <div class="result-row total" style="margin-top: 0.5rem; border-left-color: var(--accent-1); background: linear-gradient(90deg, rgba(56, 189, 248, 0.1) 0%, transparent 100%);">
                              <span>Şube Faaliyet Kârı:</span>
                              <span style="color: ${(branch.branchTotalProfit - ((branch.branchPazarlama || 0) + (branch.branchYonetim || 0) + (branch.branchArge || 0))) >= 0 ? 'var(--success)' : 'var(--danger)'};">${formatCurrency(branch.branchTotalProfit - ((branch.branchPazarlama || 0) + (branch.branchYonetim || 0) + (branch.branchArge || 0)))}</span>
                          </div>
                          <div class="result-row total" style="margin-top: 0.5rem; border-left-color: var(--success); background: linear-gradient(90deg, rgba(16, 185, 129, 0.1) 0%, transparent 100%);">
                              <span>Şube Brüt Kâr:</span>
                              <span style="color: ${branch.branchTotalProfit >= 0 ? 'var(--success)' : 'var(--danger)'};">${formatCurrency(branch.branchTotalProfit)}</span>
                          </div>
                      </div>"""

content = re.sub(branch_pattern, branch_new, content)

# 2. Class Card
class_pattern = r'<div class="result-row total" style="background: linear-gradient\(90deg, rgba\(16, 185, 129, 0\.1\) 0%, transparent 100%\); border-left-color: var\(--success\); margin-top: 0\.5rem;">\s*<span>Sınıf Brüt Kârı:</span>\s*<span id="cls-total-profit-\$\{cIndex\}" style="color: var\(--success\);">0 ₺</span>\s*</div>\s*<div class="result-row total" style="background: linear-gradient\(90deg, rgba\(56, 189, 248, 0\.1\) 0%, transparent 100%\); border-left-color: var\(--accent-1\); margin-top: 0\.5rem;">\s*<span>Sınıf Faaliyet Kârı:</span>\s*<span id="cls-faaliyet-kar-\$\{cIndex\}">0 ₺</span>\s*</div>\s*<div class="result-row total" style="background: linear-gradient\(90deg, rgba\(139, 92, 246, 0\.1\) 0%, transparent 100%\); border-left-color: #8b5cf6; margin-top: 0\.5rem;">\s*<span>Sınıf Net Kâr:</span>\s*<span id="cls-net-kar-\$\{cIndex\}" style="font-weight: 800;">0 ₺</span>\s*</div>'

class_new = r"""<div class="result-row total accordion-header" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('active')" style="background: linear-gradient(90deg, rgba(139, 92, 246, 0.1) 0%, transparent 100%); border-left-color: #8b5cf6; margin-top: 0.5rem;">
                          <span>Sınıf Net Kâr: <span class="chevron">▼</span></span>
                          <span id="cls-net-kar-${cIndex}" style="font-weight: 800;">0 ₺</span>
                      </div>
                      <div class="accordion-content">
                          <div class="result-row total" style="background: linear-gradient(90deg, rgba(56, 189, 248, 0.1) 0%, transparent 100%); border-left-color: var(--accent-1); margin-top: 0.5rem;">
                              <span>Sınıf Faaliyet Kârı:</span>
                              <span id="cls-faaliyet-kar-${cIndex}">0 ₺</span>
                          </div>
                          <div class="result-row total" style="background: linear-gradient(90deg, rgba(16, 185, 129, 0.1) 0%, transparent 100%); border-left-color: var(--success); margin-top: 0.5rem;">
                              <span>Sınıf Brüt Kârı:</span>
                              <span id="cls-total-profit-${cIndex}" style="color: var(--success);">0 ₺</span>
                          </div>
                      </div>"""

content = re.sub(class_pattern, class_new, content)

# 3. Unit Card
unit_pattern = r'<div class="result-row unit" style="margin-top: 1rem; font-size: 1\.2rem;">\s*<span>1 Adet Makine İçin Brüt Kâr:</span>\s*<span id="cls-profit-\$\{cIndex\}" style="font-weight: 800;">0 ₺</span>\s*</div>\s*<div class="result-row unit" style="margin-top: 0\.5rem; font-size: 1\.2rem;">\s*<span>1 Adet Makine İçin Faaliyet Kârı:</span>\s*<span id="cls-unit-faaliyet-kar-\$\{cIndex\}" style="font-weight: 800;">0 ₺</span>\s*</div>\s*<div class="result-row unit" style="margin-top: 0\.5rem; font-size: 1\.2rem;">\s*<span>1 Adet Makine İçin Net Kâr:</span>\s*<span id="cls-unit-net-kar-\$\{cIndex\}" style="font-weight: 800;">0 ₺</span>\s*</div>'

unit_new = r"""<div class="result-row unit accordion-header" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('active')" style="margin-top: 1rem; font-size: 1.2rem;">
                          <span>1 Adet Makine İçin Net Kâr: <span class="chevron">▼</span></span>
                          <span id="cls-unit-net-kar-${cIndex}" style="font-weight: 800;">0 ₺</span>
                      </div>
                      <div class="accordion-content">
                          <div class="result-row unit" style="margin-top: 0.5rem; font-size: 1.2rem;">
                              <span>1 Adet Makine İçin Faaliyet Kârı:</span>
                              <span id="cls-unit-faaliyet-kar-${cIndex}" style="font-weight: 800;">0 ₺</span>
                          </div>
                          <div class="result-row unit" style="margin-top: 0.5rem; font-size: 1.2rem;">
                              <span>1 Adet Makine İçin Brüt Kâr:</span>
                              <span id="cls-profit-${cIndex}" style="font-weight: 800;">0 ₺</span>
                          </div>
                      </div>"""

content = re.sub(unit_pattern, unit_new, content)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
