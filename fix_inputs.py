import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix saveData()
content = content.replace(
    'globalArge: globalArge,',
    'globalArge: globalArgeInput ? globalArgeInput.value : 0,'
)

# Fix loadData() - insert the missing line for finansman loading
# Find where globalArgeInput is loaded
arge_load = "if (globalArgeInput) globalArgeInput.value = s.globalArge || 0;"
finansman_load = "if (globalFinansmanInput) globalFinansmanInput.value = s.globalFinansman || 0;"

if arge_load in content:
    content = content.replace(arge_load, f"{arge_load}\n          {finansman_load}")

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
