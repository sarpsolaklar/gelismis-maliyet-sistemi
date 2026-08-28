with open('script.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if '<span>1 Adet Makine Maliyeti</span>' in line:
        start_idx = i - 1
    if start_idx != -1 and '</div>' in line and i > start_idx + 10:
        if '<span>1 Adet Makine İçin Brüt Kâr:</span>' in lines[i-3] or '<span>1 Adet Makine İçin Brüt Kâr:</span>' in lines[i-4]:
            end_idx = i + 1
            break

if start_idx != -1 and end_idx != -1:
    block = lines[start_idx:end_idx]
    del lines[start_idx:end_idx]
    
    insert_idx = -1
    for i, line in enumerate(lines):
        if '<span>1 Adet Makine Hammadde Toplamı:</span>' in line:
            insert_idx = i - 1
            break
            
    if insert_idx != -1:
        divider = ['                      <div style="margin-top: 1rem; margin-bottom: 1rem; height: 1px; background: var(--border-color); opacity: 0.5;"></div>\n']
        
        for i in range(insert_idx, -1, -1):
            if '<div style="font-size: 0.85rem' in lines[i]:
                insert_idx = i
                break
                
        profit_note = ['                      <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 1rem; margin-bottom: 0.5rem; opacity: 0.8; line-height: 1.4;">\n',
                       '                          <i style="margin-right:4px;">ℹ</i>Kâr oranları, 1 adet makinenin kendi <b>Net Maliyeti</b> üzerinden kâr marjını gösterir.\n',
                       '                      </div>\n']
        
        for i, b_line in enumerate(block):
            if '<span>1 Adet Makine İçin Net Kâr:' in b_line:
                block.insert(i-1, profit_note[0])
                block.insert(i, profit_note[1])
                block.insert(i+1, profit_note[2])
                break
        
        lines = lines[:insert_idx] + block + divider + lines[insert_idx:]
        
        with open('script.js', 'w', encoding='utf-8') as f:
            f.writelines(lines)
        print("Success for Unit")
    else:
        print("Insert index not found for Unit")
else:
    print("Block not found for Unit")
