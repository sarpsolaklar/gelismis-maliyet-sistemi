import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add IDs to the HTML
html_pattern = r"""<div class="result-row total accordion-header" onclick="this.classList.toggle\('open'\); this.nextElementSibling.classList.toggle\('active'\)" style="margin-top: 1rem; border-left-color: #8b5cf6; background: linear-gradient\(90deg, rgba\(139, 92, 246, 0\.1\) 0%, transparent 100%\);">
\s*<span>Şube Net Kâr: <span class="chevron">▼</span></span>
\s*<span style="color: \$\{\(branch\.branchTotalProfit - \(\(branch\.branchPazarlama \|\| 0\) \+ \(branch\.branchYonetim \|\| 0\) \+ \(branch\.branchArge \|\| 0\)\) - \(branch\.branchFinansman \|\| 0\)\) >= 0 \? 'var\(--success\)' : 'var\(--danger\)'\};">\$\{formatCurrency\([^<]+\)\}</span>
\s*</div>
\s*<div class="accordion-content">
\s*<div class="result-row total" style="margin-top: 0\.5rem; border-left-color: var\(--accent-1\); background: linear-gradient\(90deg, rgba\(56, 189, 248, 0\.1\) 0%, transparent 100%\);">
\s*<span>Şube Faaliyet Kârı:</span>
\s*<span style="color: \$\{\(branch\.branchTotalProfit - \(\(branch\.branchPazarlama \|\| 0\) \+ \(branch\.branchYonetim \|\| 0\) \+ \(branch\.branchArge \|\| 0\)\)\) >= 0 \? 'var\(--success\)' : 'var\(--danger\)'\};">\$\{formatCurrency\([^<]+\)\}</span>
\s*</div>
\s*<div class="result-row total" style="margin-top: 0\.5rem; border-left-color: var\(--success\); background: linear-gradient\(90deg, rgba\(16, 185, 129, 0\.1\) 0%, transparent 100%\);">
\s*<span>Şube Brüt Kâr:</span>
\s*<span style="color: \$\{branch\.branchTotalProfit >= 0 \? 'var\(--success\)' : 'var\(--danger\)'\};">\$\{formatCurrency\(branch\.branchTotalProfit\)\}</span>
\s*</div>
\s*</div>"""

html_new = r"""<div class="result-row total accordion-header" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('active')" style="margin-top: 1rem; border-left-color: #8b5cf6; background: linear-gradient(90deg, rgba(139, 92, 246, 0.1) 0%, transparent 100%);">
                          <span>Şube Net Kâr: <span class="chevron">▼</span></span>
                          <span id="branch-net-kar-${bIndex}" style="color: ${(branch.branchTotalProfit - ((branch.branchPazarlama || 0) + (branch.branchYonetim || 0) + (branch.branchArge || 0)) - (branch.branchFinansman || 0)) >= 0 ? 'var(--success)' : 'var(--danger)'};">${formatCurrency(branch.branchTotalProfit - ((branch.branchPazarlama || 0) + (branch.branchYonetim || 0) + (branch.branchArge || 0)) - (branch.branchFinansman || 0))}</span>
                      </div>
                      <div class="accordion-content">
                          <div class="result-row total" style="margin-top: 0.5rem; border-left-color: var(--accent-1); background: linear-gradient(90deg, rgba(56, 189, 248, 0.1) 0%, transparent 100%);">
                              <span>Şube Faaliyet Kârı:</span>
                              <span id="branch-faaliyet-kar-${bIndex}" style="color: ${(branch.branchTotalProfit - ((branch.branchPazarlama || 0) + (branch.branchYonetim || 0) + (branch.branchArge || 0))) >= 0 ? 'var(--success)' : 'var(--danger)'};">${formatCurrency(branch.branchTotalProfit - ((branch.branchPazarlama || 0) + (branch.branchYonetim || 0) + (branch.branchArge || 0)))}</span>
                          </div>
                          <div class="result-row total" style="margin-top: 0.5rem; border-left-color: var(--success); background: linear-gradient(90deg, rgba(16, 185, 129, 0.1) 0%, transparent 100%);">
                              <span>Şube Brüt Kâr:</span>
                              <span id="branch-brut-kar-${bIndex}" style="color: ${branch.branchTotalProfit >= 0 ? 'var(--success)' : 'var(--danger)'};">${formatCurrency(branch.branchTotalProfit)}</span>
                          </div>
                      </div>"""

content = re.sub(html_pattern, html_new, content)

# Now fix the listener
old_listener = r"""                  const totals = document.querySelectorAll\('\.branch-results'\)\[bIndex\]\.querySelectorAll\('\.result-row\.total'\);
                  if \(totals\.length >= 2\) \{
                      totals\[0\]\.querySelector\('span:last-child'\)\.textContent = formatCurrency\(branchData\[bIndex\]\.branchNetTotal\);
                      const elProfit = totals\[1\]\.querySelector\('span:last-child'\);
                      elProfit\.textContent = formatCurrency\(branchData\[bIndex\]\.branchTotalProfit\);
                      elProfit\.style\.color = branchData\[bIndex\]\.branchTotalProfit >= 0 \? 'var\(--success\)' : 'var\(--danger\)';
                  \}"""

new_listener = r"""                  const totals = document.querySelectorAll('.branch-results')[bIndex].querySelectorAll('.result-row.total');
                  if (totals.length >= 1) {
                      totals[0].querySelector('span:last-child').textContent = formatCurrency(branchData[bIndex].branchNetTotal);
                  }
                  
                  const bPaz = branchData[bIndex].branchPazarlama || 0;
                  const bYon = branchData[bIndex].branchYonetim || 0;
                  const bArg = branchData[bIndex].branchArge || 0;
                  const bFin = branchData[bIndex].branchFinansman || 0;
                  const bProf = branchData[bIndex].branchTotalProfit;
                  
                  const elNetKar = document.getElementById(`branch-net-kar-${bIndex}`);
                  if (elNetKar) {
                      const net = bProf - (bPaz + bYon + bArg) - bFin;
                      elNetKar.textContent = formatCurrency(net);
                      elNetKar.style.color = net >= 0 ? 'var(--success)' : 'var(--danger)';
                  }
                  const elFaaliyetKar = document.getElementById(`branch-faaliyet-kar-${bIndex}`);
                  if (elFaaliyetKar) {
                      const faal = bProf - (bPaz + bYon + bArg);
                      elFaaliyetKar.textContent = formatCurrency(faal);
                      elFaaliyetKar.style.color = faal >= 0 ? 'var(--success)' : 'var(--danger)';
                  }
                  const elBrutKar = document.getElementById(`branch-brut-kar-${bIndex}`);
                  if (elBrutKar) {
                      elBrutKar.textContent = formatCurrency(bProf);
                      elBrutKar.style.color = bProf >= 0 ? 'var(--success)' : 'var(--danger)';
                  }"""

content = re.sub(old_listener, new_listener, content)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
