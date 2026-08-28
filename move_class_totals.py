import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# The block to move
pattern = r'(\s*<div class="result-row total" style="background: linear-gradient\(90deg, rgba\(236, 72, 153, 0\.1\) 0%, transparent 100%\); border-left-color: var\(--accent-2\);">\s*<span>Sınıf Net Maliyeti:</span>\s*<span id="cls-net-\$\{cIndex\}">0 ₺</span>\s*</div>\s*<div style="font-size: 0\.85rem; color: var\(--text-secondary\); margin-top: 1rem; margin-bottom: 0\.5rem; opacity: 0\.8; line-height: 1\.4;">\s*<i style="margin-right:4px;">ℹ</i>Kâr oranları, sınıfın kendi <b>Net Maliyeti</b> üzerinden kâr marjını gösterir\.\s*</div>\s*<div class="result-row total accordion-header"[^>]*>\s*<span>Sınıf Net K.r: <span class="chevron"> </span></span>\s*<span id="cls-net-kar-\$\{cIndex\}" style="font-weight: 800;">0 ₺</span>\s*</div>\s*<div class="accordion-content">\s*<div class="result-row total"[^>]*>\s*<span>Sınıf Faaliyet K.rı:</span>\s*<span id="cls-faaliyet-kar-\$\{cIndex\}">0 ₺</span>\s*</div>\s*<div class="result-row total"[^>]*>\s*<span>Sınıf Brüt K.rı:</span>\s*<span id="cls-total-profit-\$\{cIndex\}" style="color: var\(--success\);">0 ₺</span>\s*</div>\s*</div>)'

# Extract the block
match = re.search(pattern, content)
if match:
    block_to_move = match.group(1)
    
    # Remove from original position
    content = content.replace(block_to_move, "")
    
    # Target position: right after <div class="branch-results"> that contains Sınıf Hammadde Toplamı
    # Note: there is an info note right before Sınıf Hammadde Toplamı
    target_pattern = r'(<div class="branch-results">\s*<div style="font-size: 0\.85rem; color: var\(--text-secondary\); margin-bottom: 0\.8rem; opacity: 0\.8; line-height: 1\.4;">\s*<i style="margin-right:4px;">ℹ</i>Aşağıdaki yüzdelikler, giderlerin <b>Sınıf Net Maliyeti</b> içerisindeki payını gösterir\.\s*</div>)'
    
    # Let's place the totals right after <div class="branch-results"> and BEFORE the info note
    replacement = r'<div class="branch-results">' + block_to_move + r'\n                      <div style="margin-top: 1rem; margin-bottom: 1rem; height: 1px; background: var(--border-color); opacity: 0.5;"></div>\n                      <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.8rem; opacity: 0.8; line-height: 1.4;">\n                          <i style="margin-right:4px;">ℹ</i>Aşağıdaki yüzdelikler, giderlerin <b>Sınıf Net Maliyeti</b> içerisindeki payını gösterir.\n                      </div>'
    
    content = re.sub(target_pattern, replacement, content)
    
    with open('script.js', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Success")
else:
    print("Could not find the block to move")
