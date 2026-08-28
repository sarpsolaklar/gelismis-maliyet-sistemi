import re
import glob

files_to_edit = ['script.js', 'index.html']

for filepath in files_to_edit:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    content = content.replace("Tüm Makine Sayısı", "Toplam Makine Sayısı")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
