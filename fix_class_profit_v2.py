import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Define it earlier by injecting it before faaliyetKari is used
# Or just replace `clsProfit` with `(clsProfit * cls.quantity)`

pattern1 = r"const faaliyetKari = clsProfit - \(clsPazarlama \+ clsYonetim \+ clsArge\);"
content = re.sub(pattern1, r"const faaliyetKari = (clsProfit * cls.quantity) - (clsPazarlama + clsYonetim + clsArge);", content)

pattern2 = r"const netKari = clsProfit - \(clsPazarlama \+ clsYonetim \+ clsArge\) - clsFinansman;"
content = re.sub(pattern2, r"const netKari = (clsProfit * cls.quantity) - (clsPazarlama + clsYonetim + clsArge) - clsFinansman;", content)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
