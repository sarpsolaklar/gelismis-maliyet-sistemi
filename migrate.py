import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

migration_code = """if (savedScenarios) {
    scenarios = JSON.parse(savedScenarios);
    
    // MIGRATION: Rename old Varsayılan to Ocak 2026
    if (scenarios['Varsayılan']) {
        scenarios['Ocak 2026'] = scenarios['Varsayılan'];
        delete scenarios['Varsayılan'];
        localStorage.setItem('celmakScenarios', JSON.stringify(scenarios));
    }
}"""

content = content.replace("if (savedScenarios) {\n    scenarios = JSON.parse(savedScenarios);\n}", migration_code)

migration_code_2 = """currentScenarioId = localStorage.getItem('celmakCurrentScenario') || Object.keys(scenarios)[0];
if (currentScenarioId === 'Varsayılan') {
    currentScenarioId = 'Ocak 2026';
    localStorage.setItem('celmakCurrentScenario', currentScenarioId);
}"""

content = content.replace("currentScenarioId = localStorage.getItem('celmakCurrentScenario') || Object.keys(scenarios)[0];", migration_code_2)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
print('Migration added.')
