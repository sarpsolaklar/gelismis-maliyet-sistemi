with open('script.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if '<span>Şube Net Maliyeti:</span>' in line:
        # Find the div that encloses this.
        if '<div class="result-row total"' in lines[i-1]:
            start_idx = i - 1
        elif '<div class="result-row total"' in lines[i-2]:
            start_idx = i - 2
        else:
            start_idx = i - 1
            
    if start_idx != -1 and '</div>' in line and i > start_idx + 10:
        if '<span>Şube Brüt Kâr:</span>' in lines[i-3] or '<span>Şube Brüt Kâr:</span>' in lines[i-4]:
            end_idx = i + 1
            break

if start_idx != -1 and end_idx != -1:
    block = lines[start_idx:end_idx]
    del lines[start_idx:end_idx]
    
    insert_idx = -1
    for i, line in enumerate(lines):
        if '<span>Şube Hammadde Toplamı:</span>' in line:
            insert_idx = i - 1
            break
            
    if insert_idx != -1:
        divider = ['                      <div style="margin-top: 1rem; margin-bottom: 1rem; height: 1px; background: var(--border-color); opacity: 0.5;"></div>\n']
        
        # move above the info note
        for i in range(insert_idx, -1, -1):
            if '<div style="font-size: 0.85rem' in lines[i]:
                insert_idx = i
                break
                
        # Actually wait, there is "Şubenin İçerdiği Sınıf Sayısı:" above the info note.
        # Should we put it before or after "Sınıf Sayısı"?
        # "Şubenin İçerdiği Sınıf Sayısı:" is a very basic stat, can stay at the very top, then Totals, then Info note, then Breakdown.
        # So inserting at the Info note index is perfect.
                
        lines = lines[:insert_idx] + block + divider + lines[insert_idx:]
        
        with open('script.js', 'w', encoding='utf-8') as f:
            f.writelines(lines)
        print("Success for Branch")
    else:
        print("Insert index not found for Branch")
else:
    print("Block not found for Branch")
