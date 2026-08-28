import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's insert the DOM updates after the totals block
pattern = r"(elProfit\.style\.color = branchData\[bIndex\]\.branchTotalProfit >= 0 \? 'var\(--success\)' : 'var\(--danger\)';\s*})"

replacement = r"""\1
                  
                  const elBranchTotalLabor = document.getElementById(`branch-total-labor-${bIndex}`);
                  if (elBranchTotalLabor) elBranchTotalLabor.textContent = formatCurrency(branchData[bIndex].branchShare + branchData[bIndex].laborCost);
                  
                  const elBranchLaborCost = document.getElementById(`branch-labor-cost-${bIndex}`);
                  if (elBranchLaborCost) elBranchLaborCost.textContent = formatCurrency(branchData[bIndex].laborCost);"""

content = re.sub(pattern, replacement, content)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
