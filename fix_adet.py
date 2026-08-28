import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('<span>${classCount} adet</span>', '<span>${classCount} Adet</span>')

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
