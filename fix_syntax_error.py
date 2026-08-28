import sys

with open('script.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "const classCount = branch.subClasses.length;" in line:
        # Check if the next line is an empty line or HTML (meaning it's the duplicate one)
        if "card.innerHTML = `" in lines[i+2]:
            lines.pop(i)
            break

with open('script.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)
