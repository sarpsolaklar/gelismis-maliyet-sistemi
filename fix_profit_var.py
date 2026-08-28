import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the profit calculation inside renderFactorySummary
# Currently:
#     const netKar = globalTotalProfit - totalFaaliyet - totalFinansman;
#     const faaliyetKari = globalTotalProfit - totalFaaliyet;
#     const brutKar = globalTotalProfit;

# We will change it to:
#     let brutKar = 0;
#     branchData.forEach(branch => { ... brutKar += branch.branchTotalProfit || 0; });
#     const netKar = brutKar - totalFaaliyet - totalFinansman;
#     const faaliyetKari = brutKar - totalFaaliyet;

pattern = r'(classCount \+= branch\.subClasses\.length;)'
replacement = r'\1\n            brutKar += branch.branchTotalProfit || 0;'
content = re.sub(pattern, replacement, content)

pattern2 = r'(let classCount = 0;)'
replacement2 = r'\1\n        let brutKar = 0;'
content = re.sub(pattern2, replacement2, content)

pattern3 = r'(const netKar = globalTotalProfit - totalFaaliyet - totalFinansman;\s*const faaliyetKari = globalTotalProfit - totalFaaliyet;\s*const brutKar = globalTotalProfit;)'
replacement3 = r'const netKar = brutKar - totalFaaliyet - totalFinansman;\n        const faaliyetKari = brutKar - totalFaaliyet;'
content = re.sub(pattern3, replacement3, content)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
