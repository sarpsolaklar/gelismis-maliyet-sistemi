import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

rename_logic = """
    const btnRenameScenario = document.getElementById('btnRenameScenario');
    if (btnRenameScenario) {
        btnRenameScenario.addEventListener('click', () => {
            const newName = prompt("Dönemin yeni adını girin:", currentScenarioId);
            if (newName && newName.trim() !== "" && newName !== currentScenarioId) {
                if (scenarios[newName]) {
                    alert("Bu isimde bir dönem zaten var!");
                    return;
                }
                // Save current data first
                saveData();
                
                // Copy to new key and delete old key
                scenarios[newName] = scenarios[currentScenarioId];
                delete scenarios[currentScenarioId];
                
                currentScenarioId = newName;
                
                localStorage.setItem('celmakScenarios', JSON.stringify(scenarios));
                localStorage.setItem('celmakCurrentScenario', currentScenarioId);
                
                updateScenarioUI();
                showToast("Dönem Adı Güncellendi!");
            }
        });
    }
"""

# Insert this after the delete listener
target = "const btnDeleteScenario = document.getElementById('btnDeleteScenario');"
content = content.replace(target, rename_logic + '\n    ' + target)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
print('Rename logic added.')
