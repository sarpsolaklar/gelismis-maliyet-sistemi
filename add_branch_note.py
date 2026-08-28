import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add Info note to Branch card
# Note: we need to handle special characters carefully
pattern1 = r'(<div class="result-row">\s*<span>.ube Hammadde Toplam.:</span>\s*<span>\$\{formatWithPercent\(branch\.branchBaseTotal, netTotal\)\}</span>\s*</div>)'

replacement1 = r"""<div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.8rem; opacity: 0.8; line-height: 1.4;">
                          <i style="margin-right:4px;">ℹ</i>Aşağıdaki yüzdelikler, bu Şubenin <b>Tüm Fabrika Net Maliyeti (Global Net Total)</b> içerisindeki payını gösterir.
                      </div>
                      \1"""

content = re.sub(pattern1, replacement1, content)


# 2. Fix typo in Class Card
pattern2 = r'(<div class="result-row">\s*<span>).ube Hammadde Toplam.(:</span>\s*<span id="cls-bTotal-\$\{cIndex\}">0 .</span>\s*</div>)'
replacement2 = r'\1Sınıf Hammadde Toplamı\2'

content = re.sub(pattern2, replacement2, content)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
