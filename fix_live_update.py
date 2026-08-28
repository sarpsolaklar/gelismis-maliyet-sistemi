import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add IDs to the HTML template in renderMainView()
old_html = r"""                      <div class="result-row accordion-header" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('active')">
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

new_html = r"""                      <div class="result-row accordion-header" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('active')">
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

content = content.replace(old_html, new_html)

# 2. Update the listener to set those values
old_listener = r"""                  if (totals.length >= 2) {
                      totals[0].querySelector('span:last-child').textContent = formatCurrency(branchData[bIndex].branchNetTotal);
                      const elProfit = totals[1].querySelector('span:last-child');
                      elProfit.textContent = formatCurrency(branchData[bIndex].branchTotalProfit);
                      elProfit.style.color = branchData[bIndex].branchTotalProfit >= 0 ? 'var(--success)' : 'var(--danger)';
                  }"""

new_listener = r"""                  if (totals.length >= 2) {
                      totals[0].querySelector('span:last-child').textContent = formatCurrency(branchData[bIndex].branchNetTotal);
                      const elProfit = totals[1].querySelector('span:last-child');
                      elProfit.textContent = formatCurrency(branchData[bIndex].branchTotalProfit);
                      elProfit.style.color = branchData[bIndex].branchTotalProfit >= 0 ? 'var(--success)' : 'var(--danger)';
                  }
                  
                  const elBranchTotalLabor = document.getElementById(`branch-total-labor-${bIndex}`);
                  if (elBranchTotalLabor) elBranchTotalLabor.textContent = formatCurrency(branchData[bIndex].branchShare + branchData[bIndex].laborCost);
                  
                  const elBranchLaborCost = document.getElementById(`branch-labor-cost-${bIndex}`);
                  if (elBranchLaborCost) elBranchLaborCost.textContent = formatCurrency(branchData[bIndex].laborCost);"""

content = content.replace(old_listener, new_listener)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
