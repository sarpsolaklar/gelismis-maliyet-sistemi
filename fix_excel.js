const fs = require('fs');
let code = fs.readFileSync('script.js', 'utf-8');

const targetStr = `        branchData.forEach(branch => {
            const branchLabor = branch.laborCost || 0;
            let detailBase = 0;
            branch.subClasses.forEach(cls => { detailBase += (cls.machineCost * cls.quantity); });

            const branchShare = branch.branchShare || 0;
            const detailMultiplier = detailBase > 0 ? (branchShare / detailBase) : 0;
            const laborMultiplier = detailBase > 0 ? (branchLabor / detailBase) : 0;

            branch.subClasses.forEach(cls => {
                const baseTotal = cls.machineCost * cls.quantity;
                const clsShare = baseTotal * detailMultiplier;
                const clsLaborShare = baseTotal * laborMultiplier;
                const clsGUG = cls.gug || 0;
                const clsPazarlama = cls.pazarlama || 0;
                const clsNet = baseTotal + clsShare + clsLaborShare + clsGUG;
                const clsUnitCost = cls.quantity > 0 ? (clsNet / cls.quantity) : 0;

                excelData.push({
                    "Senaryo": currentScenarioId,
                    "Şube Adı": branch.name,
                    "Sınıf Adı": cls.name,
                    "Miktar / adet": cls.quantity,
                    "1 Adet Hammadde (₺)": cls.machineCost,
                    "Sınıf Hammadde Toplamı (₺)": baseTotal,
                    "Sınıf Eşit Dağıtılan İşçilik Payı (₺)": clsShare,
                    "Sınıf İşçilik Payı (₺)": clsLaborShare,
                    "Sınıf Toplam Genel Üretim Gideri Payı (₺)": clsGUG,
                    "Sınıf Pazarlama Gideri Payı (₺)": clsPazarlama,
                    "Sınıf Genel Yönetim Gideri Payı (₺)": cls.yonetim || 0,
                    "Sınıf AR-GE Gideri Payı (₺)": cls.arge || 0,
                    "Sınıf Net Maliyeti (₺)": clsNet,
                    "1 Adet Makine İçin Genel Üretim Gideri Payı (₺)": cls.quantity > 0 ? (clsGUG / cls.quantity) : 0,
                    "1 Adet Makine İçin Pazarlama Gideri Payı (₺)": cls.quantity > 0 ? (clsPazarlama / cls.quantity) : 0,
                    "1 Adet Makine İçin Genel Yönetim Gideri Payı (₺)": cls.quantity > 0 ? ((cls.yonetim || 0) / cls.quantity) : 0,
                    "1 Adet Makine İçin AR-GE Gideri Payı (₺)": cls.quantity > 0 ? ((cls.arge || 0) / cls.quantity) : 0,
                    "1 Adet Makine İçin Finansman (Gelir/Gider) Payı (₺)": cls.quantity > 0 ? ((cls.finansman || 0) / cls.quantity) : 0,
                    "1 Adet Makine Maliyeti (₺)": clsUnitCost,
                    "1 Adet Satış Fiyatı (₺)": cls.salePrice || 0,
                    "1 Adet Makine İçin Brüt Kârı (₺)": (cls.salePrice || 0) - clsUnitCost
                });
            });
        });`;

const newStr = `        branchData.forEach(branch => {
            const branchLabor = branch.laborCost || 0;
            const branchShare = branch.branchShare || 0;
            const detailBase = branch.branchBaseTotal || 0;
            const detailMultiplier = detailBase > 0 ? (branchShare / detailBase) : 0;
            const laborMultiplier = detailBase > 0 ? (branchLabor / detailBase) : 0;

            if (branch.subClasses) {
                branch.subClasses.forEach(cls => {
                    const baseTotal = cls.baseTotal || 0;
                    const clsShare = baseTotal * detailMultiplier;
                    const clsLaborShare = baseTotal * laborMultiplier;
                    const clsGUG = cls.gug || 0;
                    const clsPazarlama = cls.pazarlama || 0;
                    const clsYonetim = cls.yonetim || 0;
                    const clsArge = cls.arge || 0;
                    const clsFinansman = cls.finansman || 0;
                    
                    const clsNet = baseTotal + clsShare + clsLaborShare + clsGUG + clsPazarlama + clsYonetim + clsArge + clsFinansman;
                    const clsUnitCost = cls.quantity > 0 ? (clsNet / cls.quantity) : 0;
                    
                    const unitPazarlama = cls.quantity > 0 ? (clsPazarlama / cls.quantity) : 0;
                    const unitYonetim = cls.quantity > 0 ? (clsYonetim / cls.quantity) : 0;
                    const unitArge = cls.quantity > 0 ? (clsArge / cls.quantity) : 0;
                    const unitFinansman = cls.quantity > 0 ? (clsFinansman / cls.quantity) : 0;
                    
                    const unitCogs = clsUnitCost - (unitPazarlama + unitYonetim + unitArge + unitFinansman);
                    const unitProfit = (cls.salePrice || 0) - unitCogs;
                    const unitFaaliyetKari = unitProfit - (unitPazarlama + unitYonetim + unitArge);
                    const unitNetKari = unitFaaliyetKari - unitFinansman;

                    excelData.push({
                        "Senaryo": currentScenarioId,
                        "Şube Adı": branch.name,
                        "Sınıf Adı": cls.name,
                        "Miktar / adet": cls.quantity,
                        "1 Adet Hammadde (₺)": cls.quantity > 0 ? (baseTotal / cls.quantity) : 0,
                        "Satılan Malın Maliyeti (SMM) (₺)": baseTotal + clsShare + clsLaborShare + clsGUG,
                        "Sınıf Hammadde Toplamı (₺)": baseTotal,
                        "Sınıf Eşit Dağıtılan İşçilik Payı (₺)": clsShare,
                        "Sınıf Direkt İşçilik Maliyeti (₺)": clsLaborShare,
                        "Sınıf Genel Üretim Gideri Payı (₺)": clsGUG,
                        "Sınıf Pazarlama Gideri Payı (₺)": clsPazarlama,
                        "Sınıf Genel Yönetim Gideri Payı (₺)": clsYonetim,
                        "Sınıf AR-GE Gideri Payı (₺)": clsArge,
                        "Sınıf Finansman (Gelir/Gider) Payı (₺)": clsFinansman,
                        "Sınıf Net Maliyeti (₺)": clsNet,
                        "Sınıf Toplam Satış Geliri (Ciro) (₺)": (cls.quantity || 0) * (cls.salePrice || 0),
                        "Sınıf Brüt Kârı (₺)": unitProfit * cls.quantity,
                        "Sınıf Faaliyet Kârı (₺)": unitFaaliyetKari * cls.quantity,
                        "Sınıf Net Kârı (₺)": unitNetKari * cls.quantity,
                        "1 Adet Makine Net Maliyeti (₺)": clsUnitCost,
                        "1 Adet Satış Fiyatı (₺)": cls.salePrice || 0,
                        "1 Adet Makine Brüt Kârı (₺)": unitProfit,
                        "1 Adet Makine Faaliyet Kârı (₺)": unitFaaliyetKari,
                        "1 Adet Makine Net Kârı (₺)": unitNetKari
                    });
                });
            }
        });`;

code = code.replace(targetStr, newStr);

fs.writeFileSync('script.js', code);
console.log('Fixed Excel Export!');
