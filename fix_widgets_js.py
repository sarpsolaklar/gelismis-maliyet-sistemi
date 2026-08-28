import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the block:
# const elNetCost = ...
# ...
# }
pattern = r"const elNetCost = document\.getElementById\('globalNetCost'\);.*?if \(elNetProfit\) \{.*?\}\s*\}"
replacement = r'''// Update the new branch summary widgets
          const elBranchCount = document.getElementById('totalBranchCountWidget');
          if (elBranchCount) elBranchCount.textContent = branchData.length + ' Adet';
          
          let totalClassCount = 0;
          branchData.forEach(branch => {
              totalClassCount += (branch.subClasses && branch.subClasses.length) ? branch.subClasses.length : 0;
          });
          
          const elClassCount = document.getElementById('totalClassCountWidget');
          if (elClassCount) elClassCount.textContent = totalClassCount + ' Adet';'''

# I will use re.DOTALL
content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
