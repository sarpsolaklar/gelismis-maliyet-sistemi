import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the code that updates the old widgets
# Old code:
#          const elNetCost = document.getElementById('globalNetCost');
#          if (elNetCost) elNetCost.textContent = formatCurrency(globalNetTotal);
#          
#          const elNetProfit = document.getElementById('globalNetProfit');
#          if (elNetProfit) elNetProfit.textContent = formatCurrency(brutKar);

pattern = r"(const elNetCost = document\.getElementById\('globalNetCost'\);\s*if \(elNetCost\) elNetCost\.textContent = formatCurrency\(globalNetTotal\);\s*const elNetProfit = document\.getElementById\('globalNetProfit'\);\s*if \(elNetProfit\) elNetProfit\.textContent = formatCurrency\(brutKar\);)"

replacement = r'''// Update the new branch summary widgets
          const elBranchCount = document.getElementById('totalBranchCountWidget');
          if (elBranchCount) elBranchCount.textContent = branchData.length + ' Adet';
          
          let totalClassCount = 0;
          branchData.forEach(branch => {
              totalClassCount += branch.subClasses.length;
          });
          
          const elClassCount = document.getElementById('totalClassCountWidget');
          if (elClassCount) elClassCount.textContent = totalClassCount + ' Adet';'''

content = re.sub(pattern, replacement, content)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
