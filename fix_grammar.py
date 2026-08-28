import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    'Şube Net Kâr:': 'Şube Net Kârı:',
    'Şube Brüt Kâr:': 'Şube Brüt Kârı:',
    'Sınıf Net Kâr:': 'Sınıf Net Kârı:',
    '1 Adet Makine İçin Net Kâr:': '1 Adet Makine İçin Net Kârı:',
    '1 Adet Makine İçin Brüt Kâr:': '1 Adet Makine İçin Brüt Kârı:',
    'Fabrika Net Kâr:': 'Fabrika Net Kârı:',
    'Fabrika Brüt Kâr:': 'Fabrika Brüt Kârı:',
    '1 Adet Makine İçin Brüt Kâr (₺)': '1 Adet Makine İçin Brüt Kârı (₺)'
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed grammar issues.")
