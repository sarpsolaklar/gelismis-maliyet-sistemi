import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    'let currentScenarioId = \'Varsayılan\';': 'let currentScenarioId = \'Ocak 2026\';',
    '"Varsayılan": {': '"Ocak 2026": {',
    'prompt("Yeni senaryo/proje adı girin:");': 'prompt("Yeni eklenecek ay/dönem adını girin (Örn: Şubat 2026):");',
    'alert("Bu isimde bir senaryo zaten var!");': 'alert("Bu isimde bir dönem zaten var!");',
    'showToast("Yeni Senaryo Oluşturuldu!");': 'showToast("Yeni Dönem Oluşturuldu!");',
    'alert("Sistemde en az 1 senaryo bulunmalıdır. Bu senaryoyu silemezsiniz.");': 'alert("Sistemde en az 1 dönem bulunmalıdır. Bu dönemi silemezsiniz.");',
    'senaryosunu kalıcı olarak silmek istediğinize emin misiniz?': 'dönemini kalıcı olarak silmek istediğinize emin misiniz?',
    'showToast("Senaryo Yüklendi: " + currentScenarioId);': 'showToast("Dönem Yüklendi: " + currentScenarioId);',
}

for o, n in replacements.items():
    content = content.replace(o, n)

# Replace the scenario reset logic with cloning
old_logic = """            scenarios[name] = {
                sharedExpense: 720,
                branchData: generateDefaultBranch()
            };"""
new_logic = """            // Mevcut ayın/dönemin verilerini (şubeler, sınıflar, maliyetler) birebir kopyala
            scenarios[name] = JSON.parse(JSON.stringify(scenarios[currentScenarioId]));"""
            
content = content.replace(old_logic, new_logic)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
print('Script updated.')
