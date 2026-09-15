import re

with open('script.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = False

for i, line in enumerate(lines):
    if 'if (savedScenarios) {' in line:
        new_lines.append(line)
        new_lines.append('            scenarios = JSON.parse(savedScenarios);\n')
        new_lines.append('            // MIGRATION: Rename old Varsayılan to Ocak 2026\n')
        new_lines.append("            if (scenarios['Varsayılan']) {\n")
        new_lines.append("                scenarios['Ocak 2026'] = scenarios['Varsayılan'];\n")
        new_lines.append("                delete scenarios['Varsayılan'];\n")
        new_lines.append("                localStorage.setItem('celmakScenarios', JSON.stringify(scenarios));\n")
        new_lines.append("            }\n")
        continue
        
    if 'scenarios = JSON.parse(savedScenarios);' in line and 'if (savedScenarios)' in lines[i-1]:
        # Skip this because we already appended it
        continue
        
    new_lines.append(line)

with open('script.js', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
print('Migration added successfully.')
