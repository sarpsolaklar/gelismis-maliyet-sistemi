import re
import glob

files_to_edit = ['script.js', 'index.html']

for filepath in files_to_edit:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove (GYG) variations
    content = content.replace("Genel Yönetim Gideri (GYG)", "Genel Yönetim Gideri")
    content = content.replace(" (GYG)", "")

    # Remove (GÜG) variations
    content = content.replace("Genel Üretim Gideri (GÜG)", "Genel Üretim Gideri")
    content = content.replace(" (GÜG)", "")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
