import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add it after saveData(); inside calculateGlobal()
# Wait, saveData() might be called multiple times.
# Let's find the exact end of calculateGlobal():
# The last part of calculateGlobal is:
#         }
# 
#         saveData();
#         updateChart();
#     }

pattern = r'(saveData\(\);\s*updateChart\(\);\s*\})'
replacement = r'saveData();\n        updateChart();\n        renderFactorySummary();\n    }'
content = re.sub(pattern, replacement, content)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
