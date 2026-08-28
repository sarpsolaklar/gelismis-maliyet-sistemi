import sys

with open('script.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_logic = [
    '            const netTotal = branch.branchNetTotal || 0;\n',
    '            const classCount = branch.subClasses.length;\n',
    '            let branchTotalQuantity = 0;\n',
    '            let branchTotalRevenue = 0;\n',
    '            if (branch.subClasses) {\n',
    '                branch.subClasses.forEach(cls => {\n',
    '                    branchTotalQuantity += (cls.quantity || 0);\n',
    '                    branchTotalRevenue += ((cls.quantity || 0) * (cls.salePrice || 0));\n',
    '                });\n',
    '            }\n'
]

# we need to replace line 762 and 763 which corresponds to index 761 and 762
lines = lines[:761] + new_logic + lines[763:]

# Now let's search for "<span>Şubenin İçerdiği Sınıf Sayısı:</span>"
class_count_idx = -1
for i, line in enumerate(lines):
    if "Şubenin İçerdiği Sınıf Sayısı:" in line:
        class_count_idx = i
        break

if class_count_idx != -1:
    new_html = [
        '                        <span>Şubenin İçerdiği Sınıf Sayısı:</span>\n',
        '                        <span>${classCount} Adet</span>\n',
        '                    </div>\n',
        '                    <div class="result-row">\n',
        '                        <span>Toplam Satış Adedi:</span>\n',
        '                        <span>${branchTotalQuantity} Adet</span>\n',
        '                    </div>\n',
        '                    <div class="result-row">\n',
        '                        <span>Toplam Satış Geliri (Ciro):</span>\n',
        '                        <span style="color: var(--success); font-weight: 600;">${formatCurrency(branchTotalRevenue)}</span>\n'
    ]
    # replace class_count_idx and class_count_idx+1
    lines = lines[:class_count_idx] + new_html + lines[class_count_idx+2:]
    
    with open('script.js', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Success")
else:
    print("Failed to find Şubenin İçerdiği Sınıf Sayısı")
