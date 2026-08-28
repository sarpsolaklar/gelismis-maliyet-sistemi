import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace scenarioData[currentScenarioId].branches with branchData
content = content.replace("scenarioData[currentScenarioId].branches.forEach", "branchData.forEach")

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
