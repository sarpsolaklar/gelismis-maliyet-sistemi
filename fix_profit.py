import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix Sınıf Faaliyet Kârı calculation
content = content.replace(
    'const faaliyetKari = clsProfit - (clsPazarlama + clsYonetim + clsArge);',
    'const faaliyetKari = clsTotalProfit - (clsPazarlama + clsYonetim + clsArge);'
)

# Fix Sınıf Net Kâr calculation
content = content.replace(
    'const netKari = clsProfit - (clsPazarlama + clsYonetim + clsArge) - clsFinansman;',
    'const netKari = clsTotalProfit - (clsPazarlama + clsYonetim + clsArge) - clsFinansman;'
)

# BUT wait! clsTotalProfit is defined AFTER those lines in the original script!
# Let's check where it's defined.
