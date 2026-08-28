import sys

with open('script.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

to_remove = []
for i, line in enumerate(lines):
    if '<span>Toplam Satış Adedi:</span>' in line:
        to_remove = [i-1, i, i+1, i+2]
        break

if to_remove:
    # Delete in reverse order to not mess up indices
    for index in sorted(to_remove, reverse=True):
        lines.pop(index)
    
    with open('script.js', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Successfully removed")
else:
    print("Not found")
