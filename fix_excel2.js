const fs = require('fs');
let code = fs.readFileSync('script.js', 'utf-8');

const startIdx = code.indexOf('excelData.push({');
const endIdx = code.indexOf('});', startIdx + 500);

if (startIdx !== -1 && endIdx !== -1) {
    const oldBlock = code.substring(code.lastIndexOf('branch.subClasses.forEach', startIdx), endIdx + 3);
    const newBlock = `branch.subClasses.forEach(cls => {
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
                });`;
    code = code.replace(oldBlock, newBlock);
    
    const oldOuter = 'branch.subClasses.forEach(cls => { detailBase += (cls.machineCost * cls.quantity); });';
    const newOuter = 'branch.subClasses.forEach(cls => { detailBase += (cls.baseTotal || 0); });';
    code = code.replace(oldOuter, newOuter);
    
    fs.writeFileSync('script.js', code);
    console.log('Fixed excel push loop exactly!');
} else {
    console.log('Could not find excel push loop.');
}
