with open('script.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if '<span>Sınıf Net Maliyeti:</span>' in line:
        start_idx = i - 1 # Include the <div class="result-row total" ...>
    if start_idx != -1 and '</div>' in line and i > start_idx + 10: # Just to find the end of the accordion content
        if '<span>Sınıf Brüt Kârı:</span>' in lines[i-3] or '<span>Sınıf Brüt Kârı:</span>' in lines[i-4]:
            end_idx = i + 1
            break

if start_idx != -1 and end_idx != -1:
    block = lines[start_idx:end_idx]
    
    # Delete block
    del lines[start_idx:end_idx]
    
    # Now find where to insert it.
    # It should be after the info note for Class Costs.
    insert_idx = -1
    for i, line in enumerate(lines):
        if '<span>Sınıf Hammadde Toplamı:</span>' in line:
            insert_idx = i - 1
            break
            
    if insert_idx != -1:
        # We also need to move the info note ABOVE the block so the totals appear at the very top.
        # Wait, the user wants "Sınıf Net Maliyeti" and "Sınıf Net Kar" at the TOP.
        # Then under it should be the class's shares (Hammadde, İşçilik etc).
        # We can add a visual divider after the block.
        divider = ['                      <div style="margin-top: 1rem; margin-bottom: 1rem; height: 1px; background: var(--border-color); opacity: 0.5;"></div>\n']
        
        # Let's insert the block just before the info note for class costs.
        # Wait, the info note is:
        # <div style="font-size: 0.85rem; ...">
        #     <i ...>ℹ</i>Aşağıdaki yüzdelikler, giderlerin <b>Sınıf Net Maliyeti</b> içerisindeki payını gösterir.
        # </div>
        # Let's find this info note.
        for i in range(insert_idx, -1, -1):
            if '<div style="font-size: 0.85rem' in lines[i]:
                insert_idx = i
                break
                
        # Also add a profit info note inside the block we are moving!
        profit_note = ['                      <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 1rem; margin-bottom: 0.5rem; opacity: 0.8; line-height: 1.4;">\n',
                       '                          <i style="margin-right:4px;">ℹ</i>Kâr oranları, sınıfın kendi <b>Net Maliyeti</b> üzerinden kâr marjını gösterir.\n',
                       '                      </div>\n']
        
        # Insert profit note inside the block before "Sınıf Net Kâr"
        for i, b_line in enumerate(block):
            if '<span>Sınıf Net Kâr:' in b_line:
                block.insert(i-1, profit_note[0])
                block.insert(i, profit_note[1])
                block.insert(i+1, profit_note[2])
                break
        
        lines = lines[:insert_idx] + block + divider + lines[insert_idx:]
        
        with open('script.js', 'w', encoding='utf-8') as f:
            f.writelines(lines)
        print("Success")
    else:
        print("Insert index not found")
else:
    print("Block not found", start_idx, end_idx)
