import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_logic = "            scenarios[name] = JSON.parse(JSON.stringify(scenarios[currentScenarioId]));"
new_logic = """            let cloned = JSON.parse(JSON.stringify(scenarios[currentScenarioId]));
            // 1. Seçeneğe göre: Yeni ayda giderleri ve adetleri sıfırla, hammadde ve satış fiyatını koru
            cloned.sharedExpense = 0;
            cloned.globalGUG = 0;
            cloned.globalPazarlama = 0;
            cloned.globalYonetim = 0;
            cloned.globalArge = 0;
            cloned.globalFinansman = 0;
            
            if (cloned.branchData) {
                cloned.branchData.forEach(branch => {
                    branch.labor = 0; // Şube İşçilik
                    if (branch.subClasses) {
                        branch.subClasses.forEach(cls => {
                            cls.quantity = 0; // Satış Adedi sıfırla
                            // cls.baseTotal (Hammadde) ve cls.salePrice (Satış Fiyatı) korunur
                        });
                    }
                });
            }
            scenarios[name] = cloned;"""

content = content.replace(old_logic, new_logic)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
print('Logic updated.')
