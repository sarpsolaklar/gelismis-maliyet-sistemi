import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the HTML for the branch labor accordion
old_html = r"""<div class="result-row accordion-header" onclick="this.classList.toggle\('open'\); this.nextElementSibling.classList.toggle\('active'\)">
\s*<span>Şube Toplam İşçilik Payı: <span class="chevron">▼</span></span>
\s*<span style="color: var\(--warning\);">\$\{formatCurrency\(branch\.branchShare \+ \(branch\.laborCost \|\| 0\)\)\}</span>
\s*</div>
\s*<div class="accordion-content">
\s*<div class="result-row">
\s*<span>Şube Eşit Dağıtılan İşçilik Payı:</span>
\s*<span style="color: var\(--warning\);">\$\{formatCurrency\(branch\.branchShare\)\}</span>
\s*</div>
\s*<div class="result-row">
\s*<span>Şube İşçilik Maliyeti:</span>
\s*<span style="color: var\(--warning\);">\$\{formatCurrency\(branch\.laborCost \|\| 0\)\}</span>
\s*</div>
\s*</div>"""

new_html = r"""<div class="result-row accordion-header" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('active')">
                          <span>Şube Toplam İşçilik Payı: <span class="chevron">▼</span></span>
                          <span id="branch-total-labor-${bIndex}" style="color: var(--warning);">${formatCurrency(branch.branchShare + (branch.laborCost || 0))}</span>
                      </div>
                      <div class="accordion-content">
                          <div class="result-row">
                              <span>Şube Eşit Dağıtılan İşçilik Payı:</span>
                              <span id="branch-share-labor-${bIndex}" style="color: var(--warning);">${formatCurrency(branch.branchShare)}</span>
                          </div>
                          <div class="result-row">
                              <span>Şube İşçilik Maliyeti:</span>
                              <span id="branch-labor-cost-${bIndex}" style="color: var(--warning);">${formatCurrency(branch.laborCost || 0)}</span>
                          </div>
                      </div>"""

content = re.sub(old_html, new_html, content)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
