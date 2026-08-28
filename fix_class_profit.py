import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix Class Faaliyet Kari
pattern1 = r"const faaliyetKari = clsProfit - \(clsPazarlama \+ clsYonetim \+ clsArge\);"
content = re.sub(pattern1, r"const faaliyetKari = clsTotalProfit - (clsPazarlama + clsYonetim + clsArge);", content)

# Fix Class Net Kari
pattern2 = r"const netKari = clsProfit - \(clsPazarlama \+ clsYonetim \+ clsArge\) - clsFinansman;"
content = re.sub(pattern2, r"const netKari = clsTotalProfit - (clsPazarlama + clsYonetim + clsArge) - clsFinansman;", content)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
