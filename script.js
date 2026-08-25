// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    // Top Actions
    const btnThemeToggle = document.getElementById('btnThemeToggle');
    const iconSun = document.getElementById('icon-sun');
    const iconMoon = document.getElementById('icon-moon');
    const btnPrint = document.getElementById('btnPrint');

    // Scenario Manager
    const scenarioSelector = document.getElementById('scenarioSelector');
    const btnNewScenario = document.getElementById('btnNewScenario');

    // Main View
    const mainView = document.getElementById('main-view');
    const mainBranchesContainer = document.getElementById('mainBranchesContainer');
    const sharedExpenseInput = document.getElementById('sharedExpense');
    const globalGUGInput = document.getElementById('globalGUG');
    const globalPazarlamaInput = document.getElementById('globalPazarlama');
    const globalYonetimInput = document.getElementById('globalYonetim');
    const globalArgeInput = document.getElementById('globalArge');
    const globalFinansmanInput = document.getElementById('global-finansman');
    const rateUSDInput = document.getElementById('rateUSD');
    const rateEURInput = document.getElementById('rateEUR');
    const totalBaseUnitsSpan = document.getElementById('totalBaseUnits');
    const btnAddBranch = document.getElementById('btnAddBranch');

    // Detail View
    const detailView = document.getElementById('detail-view');
    const detailClassesContainer = document.getElementById('detailClassesContainer');
    const btnBackToMain = document.getElementById('btnBackToMain');
    const detailBranchName = document.getElementById('detailBranchName');
    const detailSharedExpense = document.getElementById('detailSharedExpense');
    const detailTotalBaseUnits = document.getElementById('detailTotalBaseUnits');
    const detailDistributionMultiplier = document.getElementById('detailDistributionMultiplier');
    const btnAddClass = document.getElementById('btnAddClass');

    // State Variables
    let scenarios = {};
    let currentScenarioId = 'Varsayılan';
    let branchData = [];
    let currentBranchIndex = null;
    let costChartInstance = null;

    // --- THEME MANAGEMENT ---
    function applyTheme(theme) {
        if (theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
            iconSun.style.display = 'none';
            iconMoon.style.display = 'block';
        } else {
            document.documentElement.removeAttribute('data-theme');
            iconSun.style.display = 'block';
            iconMoon.style.display = 'none';
        }
        if(costChartInstance) updateChart();
    }

    btnThemeToggle.addEventListener('click', () => {
        const isLight = document.documentElement.hasAttribute('data-theme');
        const newTheme = isLight ? 'dark' : 'light';
        localStorage.setItem('appTheme', newTheme);
        applyTheme(newTheme);
    });

    // --- PDF / PRINT ---
    btnPrint.addEventListener('click', () => {
        const element = document.getElementById('main-view');
        const noPrints = element.querySelectorAll('.no-print');
        noPrints.forEach(el => el.style.display = 'none');
        
        const opt = {
          margin:       0.2,
          filename:     'Celmak_Maliyet_Raporu.pdf',
          image:        { type: 'jpeg', quality: 1 },
          html2canvas:  { scale: 2, useCORS: true },
          jsPDF:        { unit: 'in', format: 'a4', orientation: 'landscape' }
        };
        
        html2pdf().set(opt).from(element).save().then(() => {
            noPrints.forEach(el => el.style.display = ''); // Restore
        });
    });

    // --- EXCEL IMPORT ---
    const btnImportExcel = document.getElementById('btnImportExcel');
    const excelFileInput = document.getElementById('excelFileInput');

    if (btnImportExcel && excelFileInput) {
        btnImportExcel.addEventListener('click', () => {
            excelFileInput.click();
        });

        excelFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(ev) {
                const data = new Uint8Array(ev.target.result);
                const workbook = XLSX.read(data, {type: 'array'});
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const json = XLSX.utils.sheet_to_json(worksheet);
                
                if (json.length === 0) {
                    showToast('Excel dosyası boş veya format hatalı!', 'error');
                    return;
                }

                branchData = [];
                const branchMap = {};

                json.forEach(row => {
                    const branchName = row['Şube Adı'] || 'İsimsiz Şube';
                    const branchLabor = parseFloat(row['Şube İşçilik (₺)']) || parseFloat(row['Şube İşçilik Maliyeti (₺)']) || 0;
                    
                    if (!branchMap[branchName]) {
                        branchMap[branchName] = {
                            name: branchName,
                            laborCost: branchLabor,
                            subClasses: []
                        };
                        branchData.push(branchMap[branchName]);
                    }
                    
                    const className = row['Sınıf Adı'] || row['Makine Sınıfı'];
                    if (className) {
                        branchMap[branchName].subClasses.push({
                            name: className,
                            quantity: parseInt(row['Miktar / adet']) || parseInt(row['Üretim Adedi']) || 1,
                            machineCost: parseFloat(row['1 Adet Hammadde (₺)']) || parseFloat(row['Hammadde (₺)']) || 0,
                            currency: row['Döviz'] || 'TL',
                            salePrice: parseFloat(row['Satış Fiyatı (₺)']) || 0,
                            profitMargin: parseFloat(row['Hedef Kâr (%)']) || 0
                        });
                    }
                });
                
                saveData();
                calculateGlobal();
                renderMainView();
                showToast('Excel verileri başarıyla içe aktarıldı!', 'success');
                excelFileInput.value = '';
            };
            reader.readAsArrayBuffer(file);
        });
    }

    // --- EXCEL EXPORT ---
    const btnExcel = document.getElementById('btnExcel');
    if (btnExcel) {
        btnExcel.addEventListener('click', () => {
            let excelData = [];
            branchData.forEach(branch => {
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
                        "Sınıf Arge Gideri Payı (₺)": cls.arge || 0,
                        "Sınıf Net Maliyeti (₺)": clsNet,
                        "1 Adet Makine İçin Genel Üretim Gideri Payı (₺)": cls.quantity > 0 ? (clsGUG / cls.quantity) : 0,
                        "1 Adet Makine İçin Pazarlama Gideri Payı (₺)": cls.quantity > 0 ? (clsPazarlama / cls.quantity) : 0,
                        "1 Adet Makine İçin Genel Yönetim Gideri Payı (₺)": cls.quantity > 0 ? ((cls.yonetim || 0) / cls.quantity) : 0,
                        "1 Adet Makine İçin Arge Gideri Payı (₺)": cls.quantity > 0 ? ((cls.arge || 0) / cls.quantity) : 0,
                        "1 Adet Makine İçin Finansman (Gelir/Gider) Payı (₺)": cls.quantity > 0 ? ((cls.finansman || 0) / cls.quantity) : 0,
                        "1 Adet Makine Maliyeti (₺)": clsUnitCost,
                        "1 Adet Satış Fiyatı (₺)": cls.salePrice || 0,
                        "1 Adet Makine İçin Brüt Kâr (₺)": (cls.salePrice || 0) - clsUnitCost
                    });
                });
            });
            const ws = XLSX.utils.json_to_sheet(excelData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Maliyet_Raporu");
            XLSX.writeFile(wb, `Celmak_Maliyet_${currentScenarioId}.xlsx`);
            showToast("Excel Raporu Başarıyla İndirildi!");
        });
    }

    function formatCurrency(num) {
        return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num) + ' ₺';
    }

    function showToast(message) {
        let toast = document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            toast.className = 'toast';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    function numberToTurkishText(num) {
        if (num === 0) return "Sıfır Türk Lirası";
        const ones = ["", "Bir", "İki", "Üç", "Dört", "Beş", "Altı", "Yedi", "Sekiz", "Dokuz"];
        const tens = ["", "On", "Yirmi", "Otuz", "Kırk", "Elli", "Altmış", "Yetmiş", "Seksen", "Doksan"];
        const scales = ["", "Bin", "Milyon", "Milyar"];
        
        function convertGroup(n) {
            let str = "";
            const h = Math.floor(n / 100);
            const t = Math.floor((n % 100) / 10);
            const o = n % 10;
            if (h === 1) str += "Yüz "; else if (h > 1) str += ones[h] + " Yüz ";
            if (t > 0) str += tens[t] + " ";
            if (o > 0) str += ones[o] + " ";
            return str.trim();
        }
        
        let integerPart = Math.floor(Math.abs(num));
        let decimalPart = Math.round((Math.abs(num) - integerPart) * 100);
        let result = "";
        
        if (integerPart === 0) result = "Sıfır ";
        else {
            let groups = [];
            let temp = integerPart;
            while (temp > 0) { groups.push(temp % 1000); temp = Math.floor(temp / 1000); }
            for (let i = groups.length - 1; i >= 0; i--) {
                const groupVal = groups[i];
                if (groupVal === 0) continue;
                if (i === 1 && groupVal === 1) result += "Bin ";
                else result += convertGroup(groupVal) + " " + scales[i] + " ";
            }
        }
        
        let finalStr = result.trim() + " Türk Lirası";
        if (decimalPart > 0) finalStr += " " + convertGroup(decimalPart).trim() + " Kuruş";
        return finalStr.replace(/\s+/g, ' ');
    }

    // --- DATA MANAGEMENT & SCENARIOS ---
    function generateDefaultBranch() {
        return [
            {
                name: "Tamburlu",
                laborCost: 0,
                branchBaseTotal: 0,
                branchShare: 0,
                subClasses: [
                    { name: "Tamburlu Çayır Biçme", quantity: 1, machineCost: 0, salePrice: 0 }
                ]
            }
        ];
    }

    function loadData() {
        // Load Theme
        const savedTheme = localStorage.getItem('appTheme') || 'dark';
        applyTheme(savedTheme);

        // Load Scenarios
        const savedScenarios = localStorage.getItem('celmakScenarios');
        
        if (savedScenarios) {
            scenarios = JSON.parse(savedScenarios);
        } else {
            // Migration from old app version if exists
            const oldData = localStorage.getItem('branchDataDrillDown');
            const oldExpense = localStorage.getItem('sharedExpense') || 720;
            
            scenarios = {
                "Varsayılan": {
                    sharedExpense: oldExpense,
                    branchData: oldData ? JSON.parse(oldData) : generateDefaultBranch()
                }
            };
        }

        currentScenarioId = localStorage.getItem('celmakCurrentScenario') || Object.keys(scenarios)[0];
        if (!scenarios[currentScenarioId]) currentScenarioId = Object.keys(scenarios)[0];

        updateScenarioUI();
        loadCurrentScenario();
    }

    function loadCurrentScenario() {
        if (!scenarios[currentScenarioId]) return;
        const s = scenarios[currentScenarioId];
        sharedExpenseInput.value = s.sharedExpense;
        
        if (globalGUGInput) globalGUGInput.value = s.globalGUG || 0;
        if (globalPazarlamaInput) globalPazarlamaInput.value = s.globalPazarlama || 0;
        if (globalYonetimInput) globalYonetimInput.value = s.globalYonetim || 0;
        if (globalArgeInput) globalArgeInput.value = s.globalArge || 0;
        
        const rateUSD = document.getElementById('rateUSD');
        if (rateUSD) rateUSD.value = s.rateUSD !== undefined ? s.rateUSD : 34.50;
        
        const rateEUR = document.getElementById('rateEUR');
        if (rateEUR) rateEUR.value = s.rateEUR !== undefined ? s.rateEUR : 38.20;
        
        branchData = s.branchData;
        calculateGlobal();
        renderMainView();
    }

    function saveData() {
        scenarios[currentScenarioId] = {
            sharedExpense: sharedExpenseInput.value,
            globalGUG: globalGUGInput.value,
            globalPazarlama: globalPazarlamaInput ? globalPazarlamaInput.value : 0,
            globalYonetim: globalYonetimInput ? globalYonetimInput.value : 0,
            globalArge: globalArge,
                globalFinansman: globalFinansmanInput ? globalFinansmanInput.value : 0,
            rateUSD: 34.50,
            rateEUR: 38.20,
            branchData: branchData
        };
        localStorage.setItem('celmakScenarios', JSON.stringify(scenarios));
        localStorage.setItem('celmakCurrentScenario', currentScenarioId);
    }

    // --- SCENARIO UI ---
    function updateScenarioUI() {
        scenarioSelector.innerHTML = '';
        Object.keys(scenarios).forEach(key => {
            const opt = document.createElement('option');
            opt.value = key;
            opt.textContent = key;
            if (key === currentScenarioId) opt.selected = true;
            scenarioSelector.appendChild(opt);
        });
    }

    scenarioSelector.addEventListener('change', (e) => {
        saveData(); // Save CURRENT scenario state to memory first
        currentScenarioId = e.target.value; // Switch ID
        localStorage.setItem('celmakCurrentScenario', currentScenarioId);
        loadCurrentScenario(); // Load NEW scenario state
        showToast("Senaryo Yüklendi: " + currentScenarioId);
    });

    btnNewScenario.addEventListener('click', () => {
        const name = prompt("Yeni senaryo/proje adı girin:");
        if (name && name.trim() !== "") {
            if (scenarios[name]) {
                alert("Bu isimde bir senaryo zaten var!");
                return;
            }
            saveData(); // Save old scenario before switching
            
            scenarios[name] = {
                sharedExpense: 720,
                branchData: generateDefaultBranch()
            };
            currentScenarioId = name;
            saveData(); // Save new scenario
            
            updateScenarioUI();
            loadCurrentScenario();
            showToast("Yeni Senaryo Oluşturuldu!");
        }
    });

    const btnDeleteScenario = document.getElementById('btnDeleteScenario');
    if (btnDeleteScenario) {
        btnDeleteScenario.addEventListener('click', () => {
            if (Object.keys(scenarios).length <= 1) {
                alert("Sistemde en az 1 senaryo bulunmalıdır. Bu senaryoyu silemezsiniz.");
                return;
            }
            if (confirm(`'${currentScenarioId}' senaryosunu kalıcı olarak silmek istediğinize emin misiniz?`)) {
                delete scenarios[currentScenarioId]; // Delete from memory
                currentScenarioId = Object.keys(scenarios)[0]; // Pick another existing one
                
                // Save the new scenarios tree immediately to commit deletion
                localStorage.setItem('celmakScenarios', JSON.stringify(scenarios));
                localStorage.setItem('celmakCurrentScenario', currentScenarioId);
                
                updateScenarioUI();
                loadCurrentScenario(); // Load the newly picked scenario
                showToast("Senaryo başarıyla silindi!");
            }
        });
    }

    // --- CHART.JS ---
    function updateChart() {
        const ctx = document.getElementById('costChart');
        if (!ctx) return;

        const isLight = document.documentElement.hasAttribute('data-theme');
        const textColor = isLight ? '#1e293b' : '#ffffff';

        const labels = branchData.map(b => b.name);
        const dataCost = branchData.map(b => b.branchNetTotal || 0);
        const dataProfit = branchData.map(b => (b.branchTotalSales || 0) - ((b.branchNetTotal || 0) - (b.branchPazarlama || 0) - (b.branchYonetim || 0) - (b.branchArge || 0)));

        if (costChartInstance) { costChartInstance.destroy(); }

        costChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Net Maliyet (₺)',
                        data: dataCost,
                        backgroundColor: 'rgba(244, 63, 94, 0.8)',
                        borderRadius: 4
                    },
                    {
                        label: 'Brüt Kâr (₺)',
                        data: dataProfit,
                        backgroundColor: 'rgba(16, 185, 129, 0.8)',
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true, 
                maintainAspectRatio: false,
                scales: {
                    x: { ticks: { color: textColor } },
                    y: { ticks: { color: textColor } }
                },
                plugins: {
                    legend: { 
                        position: 'top', 
                        labels: { color: textColor, font: { family: 'Outfit', size: 12 } } 
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + formatCurrency(context.raw);
                            }
                        }
                    }
                }
            }
        });
    }

    // --- CALCULATION CORE ---
    function calculateGlobal() {
        const globalExpense = parseFloat(sharedExpenseInput.value) || 0;
        const totalGUG = parseFloat(globalGUGInput.value) || 0;
        const totalPazarlama = globalPazarlamaInput ? Math.max(0, (parseFloat(globalPazarlamaInput.value) || 0)) : 0;
        const totalYonetim = globalYonetimInput ? Math.max(0, (parseFloat(globalYonetimInput.value) || 0)) : 0;
        const totalArge = globalArgeInput ? Math.max(0, (parseFloat(globalArgeInput.value) || 0)) : 0;
        const totalFinansman = globalFinansmanInput ? (parseFloat(globalFinansmanInput.value) || 0) : 0;
        let globalBase = 0, globalLabor = 0, globalEmployees = 0, globalMachines = 0;
        
        branchData.forEach(branch => {
            let bTotal = 0, mCount = 0;
            branch.subClasses.forEach(cls => {
                let rate = 1;
                if (cls.currency === 'USD') rate = 34.50;
                else if (cls.currency === 'EUR') rate = 38.20;
                cls.baseTotal = cls.machineCost * rate * cls.quantity; 
                bTotal += cls.baseTotal;
                mCount += cls.quantity;
            });
            branch.branchBaseTotal = bTotal;
            globalBase += bTotal;
            globalLabor += (branch.laborCost || 0);
            globalMachines += mCount;
        });

        let globalMultiplier = globalBase > 0 ? (globalExpense / globalBase) : 0;
        let globalTotalLabor = globalExpense + globalLabor;
        let gugMultiplier = globalTotalLabor > 0 ? (totalGUG / globalTotalLabor) : 0;
        let pazMultiplier = globalTotalLabor > 0 ? (totalPazarlama / globalTotalLabor) : 0;
        let yonetimMultiplier = globalTotalLabor > 0 ? (totalYonetim / globalTotalLabor) : 0;
        let argeMultiplier = globalTotalLabor > 0 ? (totalArge / globalTotalLabor) : 0;
        let finansmanMultiplier = globalTotalLabor > 0 ? (totalFinansman / globalTotalLabor) : 0;
        let globalTotalSales = 0;

        branchData.forEach(branch => {
            branch.branchShare = branch.branchBaseTotal * globalMultiplier;
            branch.branchGUG = (branch.branchShare + (branch.laborCost || 0)) * gugMultiplier;
            branch.branchPazarlama = (branch.branchShare + (branch.laborCost || 0)) * pazMultiplier;
            branch.branchYonetim = (branch.branchShare + (branch.laborCost || 0)) * yonetimMultiplier;
            branch.branchArge = (branch.branchShare + (branch.laborCost || 0)) * argeMultiplier;
            branch.branchFinansman = (branch.branchShare + (branch.laborCost || 0)) * finansmanMultiplier;
            branch.branchNetTotal = branch.branchBaseTotal + branch.branchShare + (branch.laborCost || 0) + branch.branchGUG + branch.branchPazarlama + branch.branchYonetim + branch.branchArge + branch.branchFinansman;
            
            let bSales = 0;
            // Distribute GUG to classes for Excel export if needed globally
            const detailBase = branch.branchBaseTotal;
            const detailMultiplier = detailBase > 0 ? (branch.branchShare / detailBase) : 0;
            const laborMultiplier = detailBase > 0 ? ((branch.laborCost || 0) / detailBase) : 0;
            
            branch.subClasses.forEach(cls => {
                const clsShare = cls.baseTotal * detailMultiplier;
                const clsLaborShare = cls.baseTotal * laborMultiplier;
                const clsTotalLabor = clsShare + clsLaborShare;
                cls.gug = clsTotalLabor * gugMultiplier;
                cls.pazarlama = clsTotalLabor * pazMultiplier;
                cls.yonetim = clsTotalLabor * yonetimMultiplier;
                cls.arge = clsTotalLabor * argeMultiplier;
                  cls.finansman = clsTotalLabor * finansmanMultiplier;
                
                const clsNet = cls.baseTotal + clsShare + clsLaborShare + cls.gug + cls.pazarlama + cls.yonetim + cls.arge + cls.finansman;
                const clsUnitCost = cls.quantity > 0 ? (clsNet / cls.quantity) : 0;
                const clsUnitPaz = cls.quantity > 0 ? ((cls.pazarlama || 0) / cls.quantity) : 0;
                const clsUnitYonetim = cls.quantity > 0 ? ((cls.yonetim || 0) / cls.quantity) : 0;
                const clsUnitArge = cls.quantity > 0 ? ((cls.arge || 0) / cls.quantity) : 0;
                const clsUnitFinansman = cls.quantity > 0 ? ((cls.finansman || 0) / cls.quantity) : 0;
                const costForProfit = clsUnitCost - (clsUnitPaz + clsUnitYonetim + clsUnitArge + clsUnitFinansman);
                
                if (cls.lastModified === 'margin') {
                    cls.salePrice = costForProfit * (1 + (cls.profitMargin || 0) / 100);
                } else {
                    if (costForProfit > 0) {
                        cls.profitMargin = (((cls.salePrice || 0) - costForProfit) / costForProfit) * 100;
                    } else {
                        cls.profitMargin = 0;
                    }
                }
                
                bSales += (cls.salePrice || 0) * cls.quantity;
            });
            
            branch.branchTotalSales = bSales;
            branch.branchTotalProfit = branch.branchTotalSales - (branch.branchNetTotal - (branch.branchPazarlama || 0) - (branch.branchYonetim || 0) - (branch.branchArge || 0) - (branch.branchFinansman || 0));
            globalTotalSales += bSales;
        });

        // Update Global UI Dashboard Widgets
        const elBase = document.getElementById('totalBaseUnits');
        if (elBase) elBase.textContent = formatCurrency(globalBase);
        
        const elLabor = document.getElementById('totalLaborUnits');
        if (elLabor) elLabor.textContent = formatCurrency(globalLabor);
        
        const elMachine = document.getElementById('totalMachineCount');
        if (elMachine) elMachine.textContent = globalMachines + ' Adet';
        
        const elEmp = document.getElementById('totalEmployeeCount');
        if (elEmp) elEmp.textContent = branchData.length + ' Şube';
        
        const globalNetTotal = globalBase + globalLabor + globalExpense + totalGUG + totalPazarlama + totalYonetim + totalArge;
        const globalNetProfit = globalTotalSales - (globalNetTotal - totalPazarlama - totalYonetim - totalArge);
        
        const elNetCost = document.getElementById('globalNetCost');
        if (elNetCost) {
            const textNet = numberToTurkishText(globalNetTotal);
            elNetCost.innerHTML = `${formatCurrency(globalNetTotal)} <div class="pronunciation-text">(${textNet})</div>`;
        }
        
        const elNetProfit = document.getElementById('globalNetProfit');
        if (elNetProfit) {
            const profitText = (globalNetProfit < 0 ? "Eksi " : "") + numberToTurkishText(Math.abs(globalNetProfit));
            elNetProfit.innerHTML = `${formatCurrency(globalNetProfit)} <div class="pronunciation-text">(${profitText})</div>`;
            elNetProfit.style.color = globalNetProfit >= 0 ? 'var(--success)' : 'var(--danger)';
        }

        const elNetTotalLegacy = document.getElementById('globalNetTotal');
        if (elNetTotalLegacy) {
            const textNet = numberToTurkishText(globalNetTotal);
            const profitText = (globalNetProfit < 0 ? "Eksi " : "") + numberToTurkishText(Math.abs(globalNetProfit));
            elNetTotalLegacy.innerHTML = `${formatCurrency(globalNetTotal)} <br><span style="font-size:0.8rem; color:var(--text-secondary); font-weight:normal; opacity:0.8;">(${textNet})</span><br><br><span style="color:var(--text-primary);">Toplam Brüt Kâr:</span> <span style="color: ${globalNetProfit >= 0 ? 'var(--success)' : 'var(--danger)'};">${formatCurrency(globalNetProfit)}</span><br><span style="font-size:0.8rem; color:var(--text-secondary); font-weight:normal; opacity:0.8;">(${profitText})</span>`;
        }

        saveData();
        updateChart();
    }

    function calculateDetail() {
        if (currentBranchIndex === null) return;
        const branch = branchData[currentBranchIndex];
        
        const branchLabor = branch.laborCost || 0;
        let detailBase = branch.branchBaseTotal;
        
        const branchShare = branch.branchShare || 0;
        const branchGUG = branch.branchGUG || 0;
        const branchPazarlama = branch.branchPazarlama || 0;
        const branchYonetim = branch.branchYonetim || 0;
        const branchArge = branch.branchArge || 0;
        const branchNetTotal = detailBase + branchShare + branchLabor + branchGUG + branchPazarlama + branchYonetim + branchArge; // For progress bars

        const detailMultiplier = detailBase > 0 ? (branchShare / detailBase) : 0;
        const laborMultiplier = detailBase > 0 ? (branchLabor / detailBase) : 0;
        
        branch.subClasses.forEach((cls, cIndex) => {
            const clsShare = cls.baseTotal * detailMultiplier;
            const clsLaborShare = cls.baseTotal * laborMultiplier;
            const clsGUG = cls.gug || 0;
            const clsPazarlama = cls.pazarlama || 0;
            const clsYonetim = cls.yonetim || 0;
            const clsArge = cls.arge || 0;
            const clsFinansman = cls.finansman || 0;
            const clsNet = cls.baseTotal + clsShare + clsLaborShare + clsGUG + clsPazarlama + clsYonetim + clsArge + clsFinansman;
            const clsUnitCost = cls.quantity > 0 ? (clsNet / cls.quantity) : 0;
            
            const clsUnitShare = cls.quantity > 0 ? (clsShare / cls.quantity) : 0;
            const clsUnitLaborShare = cls.quantity > 0 ? (clsLaborShare / cls.quantity) : 0;
            const clsUnitGUG = cls.quantity > 0 ? (clsGUG / cls.quantity) : 0;
            const clsUnitPazarlama = cls.quantity > 0 ? (clsPazarlama / cls.quantity) : 0;
            const clsUnitYonetim = cls.quantity > 0 ? (clsYonetim / cls.quantity) : 0;
            const clsUnitArge = cls.quantity > 0 ? (clsArge / cls.quantity) : 0;
            const clsUnitFinansman = cls.quantity > 0 ? (clsFinansman / cls.quantity) : 0;
            
            const clsProfit = (cls.salePrice || 0) - (clsUnitCost - (clsUnitPazarlama + clsUnitYonetim + clsUnitArge + clsUnitFinansman));

            const percentage = branchNetTotal > 0 ? (clsNet / branchNetTotal) * 100 : 0;

            const elBase = document.getElementById(`cls-bTotal-${cIndex}`);
            if(elBase) {
                elBase.textContent = formatCurrency(cls.baseTotal);
                document.getElementById(`cls-share-${cIndex}`).textContent = formatCurrency(clsShare);
                document.getElementById(`cls-labor-share-${cIndex}`).textContent = formatCurrency(clsLaborShare);
                document.getElementById(`cls-gug-${cIndex}`).textContent = formatCurrency(clsGUG);
                const elClsPaz = document.getElementById(`cls-paz-${cIndex}`);
                if (elClsPaz) elClsPaz.textContent = formatCurrency(clsPazarlama);
                const elClsYonetim = document.getElementById(`cls-yonetim-${cIndex}`);
                if (elClsYonetim) elClsYonetim.textContent = formatCurrency(clsYonetim);
                const elClsArge = document.getElementById(`cls-arge-${cIndex}`);
                if (elClsArge) elClsArge.textContent = formatCurrency(clsArge);
                const elClsFinansman = document.getElementById(`cls-finansman-${cIndex}`);
                if (elClsFinansman) {
                    elClsFinansman.textContent = formatCurrency(clsFinansman);
                    elClsFinansman.style.color = clsFinansman < 0 ? "var(--success)" : "var(--danger)";
                }
                const elClsFaaliyet = document.getElementById(`cls-faaliyet-${cIndex}`);
                if (elClsFaaliyet) elClsFaaliyet.textContent = formatCurrency(clsPazarlama + clsYonetim + clsArge);
                const elClsFaaliyetKar = document.getElementById(`cls-faaliyet-kar-${cIndex}`);
                if (elClsFaaliyetKar) {
                    const faaliyetKari = clsProfit - (clsPazarlama + clsYonetim + clsArge);
                    elClsFaaliyetKar.textContent = formatCurrency(faaliyetKari);
                    elClsFaaliyetKar.style.color = faaliyetKari >= 0 ? "var(--success)" : "var(--danger)";
                }
                const elClsNetKar = document.getElementById(`cls-net-kar-${cIndex}`);
                if (elClsNetKar) {
                    const netKari = clsProfit - (clsPazarlama + clsYonetim + clsArge) - clsFinansman;
                    elClsNetKar.textContent = formatCurrency(netKari);
                    elClsNetKar.style.color = netKari >= 0 ? "var(--success)" : "var(--danger)";
                }
                document.getElementById(`cls-net-${cIndex}`).textContent = formatCurrency(clsNet);
                
                const clsTotalProfit = clsProfit * cls.quantity;
                const elTotalProfit = document.getElementById(`cls-total-profit-${cIndex}`);
                if (elTotalProfit) {
                    elTotalProfit.textContent = formatCurrency(clsTotalProfit);
                    elTotalProfit.style.color = clsTotalProfit >= 0 ? 'var(--success)' : 'var(--danger)';
                }
                
                const elUnitShare = document.getElementById(`cls-unit-share-${cIndex}`);
                if (elUnitShare) elUnitShare.textContent = formatCurrency(clsUnitShare);
                
                const elUnitLaborShare = document.getElementById(`cls-unit-labor-share-${cIndex}`);
                if (elUnitLaborShare) elUnitLaborShare.textContent = formatCurrency(clsUnitLaborShare);
                
                const elUnitGug = document.getElementById(`cls-unit-gug-${cIndex}`);
                if (elUnitGug) elUnitGug.textContent = formatCurrency(clsUnitGUG);
                const elUnitPaz = document.getElementById(`cls-unit-paz-${cIndex}`);
                if (elUnitPaz) elUnitPaz.textContent = formatCurrency(clsUnitPazarlama);
                const elUnitYonetim = document.getElementById(`cls-unit-yonetim-${cIndex}`);
                if (elUnitYonetim) elUnitYonetim.textContent = formatCurrency(clsUnitYonetim);
                const elUnitArge = document.getElementById(`cls-unit-arge-${cIndex}`);
                if (elUnitArge) elUnitArge.textContent = formatCurrency(clsUnitArge);
                const elUnitFinansman = document.getElementById(`cls-unit-finansman-${cIndex}`);
                if (elUnitFinansman) {
                    elUnitFinansman.textContent = formatCurrency(clsUnitFinansman);
                    elUnitFinansman.style.color = clsUnitFinansman < 0 ? "var(--success)" : "var(--danger)";
                }
                const elUnitFaaliyet = document.getElementById(`cls-unit-faaliyet-${cIndex}`);
                if (elUnitFaaliyet) elUnitFaaliyet.textContent = formatCurrency(clsUnitPazarlama + clsUnitYonetim + clsUnitArge);
                
                const elUnitCost = document.getElementById(`cls-unit-${cIndex}`);
                if (elUnitCost) elUnitCost.textContent = formatCurrency(clsUnitCost);
                
                document.getElementById(`cls-profit-${cIndex}`).textContent = formatCurrency(clsProfit);
                const elUnitFaaliyetKar = document.getElementById(`cls-unit-faaliyet-kar-${cIndex}`);
                if (elUnitFaaliyetKar) {
                    const unitFaaliyetKari = clsProfit - (clsUnitPazarlama + clsUnitYonetim + clsUnitArge);
                    elUnitFaaliyetKar.textContent = formatCurrency(unitFaaliyetKari);
                    elUnitFaaliyetKar.style.color = unitFaaliyetKari >= 0 ? "var(--success)" : "var(--danger)";
                }
                const elUnitNetKar = document.getElementById(`cls-unit-net-kar-${cIndex}`);
                if (elUnitNetKar) {
                    const unitNetKari = clsProfit - (clsUnitPazarlama + clsUnitYonetim + clsUnitArge) - clsUnitFinansman;
                    elUnitNetKar.textContent = formatCurrency(unitNetKari);
                    elUnitNetKar.style.color = unitNetKari >= 0 ? "var(--success)" : "var(--danger)";
                }
                
                const elSaleInput = document.querySelector(`.sale-input[data-cindex="${cIndex}"]`);
                const elMarginInput = document.querySelector(`.margin-input[data-cindex="${cIndex}"]`);
                if (elSaleInput && elMarginInput) {
                    if (cls.lastModified === 'margin' && document.activeElement !== elSaleInput) {
                        elSaleInput.value = cls.salePrice.toFixed(0);
                    } else if (cls.lastModified !== 'margin' && document.activeElement !== elMarginInput) {
                        elMarginInput.value = cls.profitMargin.toFixed(1);
                    }
                }
                const elProfit = document.getElementById(`cls-profit-${cIndex}`);
                if (elProfit) {
                    elProfit.style.color = clsProfit >= 0 ? "var(--success)" : "var(--danger)";
                }
                
                // Update Progress Bar
                const progFill = document.getElementById(`prog-fill-${cIndex}`);
                const progText = document.getElementById(`prog-text-${cIndex}`);
                if (progFill) {
                    progFill.style.width = `${percentage}%`;
                    progText.textContent = `%${percentage.toFixed(1)}`;
                }
            }
        });

        const textBranchShare = numberToTurkishText(branchShare);
        detailSharedExpense.innerHTML = `${formatCurrency(branchShare)} <div class="pronunciation-text">(${textBranchShare})</div>`;
        
        const textBranchLabor = numberToTurkishText(branchLabor);
        document.getElementById('detailLaborExpense').innerHTML = `${formatCurrency(branchLabor)} <div class="pronunciation-text">(${textBranchLabor})</div>`;
        
        const textDetailBase = numberToTurkishText(detailBase);
        detailTotalBaseUnits.innerHTML = `${formatCurrency(detailBase)} <div class="pronunciation-text">(${textDetailBase})</div>`;
        
        detailDistributionMultiplier.textContent = detailMultiplier.toFixed(4);
    }

    // --- MAIN VIEW RENDERING ---
    function renderMainView() {
        const existingCards = mainBranchesContainer.querySelectorAll('.glass-card:not(.add-card)');
        existingCards.forEach(c => c.remove());
        
        branchData.forEach((branch, bIndex) => {
            const card = document.createElement('div');
            card.className = 'glass-card';
            
            const netTotal = branch.branchNetTotal || 0;
            const classCount = branch.subClasses.length;

            card.innerHTML = `
                <button class="btn-delete-card" data-bindex="${bIndex}" title="Şubeyi Sil">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
                <div class="branch-header">
                    <span class="branch-badge">Şube</span>
                    <input type="text" data-bindex="${bIndex}" class="branch-input name-input" value="${branch.name}">
                </div>
                
                <div class="input-group">
                    <label>Şube Çalışan Sayısı (Bilgi Amaçlı)</label>
                    <input type="number" data-bindex="${bIndex}" class="branch-input emp-input" value="${branch.employees || ''}" min="0" placeholder="Örn: 5">
                </div>
                
                <div class="input-group" style="margin-bottom: 1.5rem;">
                    <label>Şube İşçilik Maliyeti (₺)</label>
                    <input type="number" data-bindex="${bIndex}" class="branch-input labor-input" value="${branch.laborCost || ''}" min="0" placeholder="Örn: 10">
                </div>
                
                <div class="branch-results">
                    <div class="result-row">
                        <span>İçerdiği Sınıf Sayısı:</span>
                        <span>${classCount} adet</span>
                    </div>
                    <div class="result-row">
                        <span>Hammadde Toplamı:</span>
                        <span>${formatCurrency(branch.branchBaseTotal)}</span>
                    </div>
                    <div class="result-row">
                        <span>Eşit Dağıtılan İşçilik Payı:</span>
                        <span style="color: var(--accent-3);">${formatCurrency(branch.branchShare)}</span>
                    </div>
                    <div class="result-row">
                        <span>Şube Toplam Genel Üretim Gideri Payı:</span>
                        <span style="color: var(--accent-1);">${formatCurrency(branch.branchGUG)}</span>
                    </div>
                    <div class="result-row">
                        <span>Şube Toplam Pazarlama Gideri Payı:</span>
                        <span style="color: var(--accent-1);">${formatCurrency(branch.branchPazarlama)}</span>
                    </div>
                    <div class="result-row">
                        <span>Şube Toplam Genel Yönetim Gideri Payı:</span>
                        <span style="color: var(--accent-1);">${formatCurrency(branch.branchYonetim)}</span>
                    </div>
                    <div class="result-row">
                        <span>Şube Toplam Arge Gideri Payı:</span>
                        <span style="color: var(--accent-1);">${formatCurrency(branch.branchArge || 0)}</span>
                    </div>
                    <div class="result-row">
                        <span>Şube Finansman (Gelir/Gider) Payı:</span>
                        <span style="color: ${(branch.branchFinansman || 0) < 0 ? 'var(--success)' : 'var(--danger)'};">${formatCurrency(branch.branchFinansman || 0)}</span>
                    </div>
                    <div class="result-row">
                        <span>Şube Toplam Faaliyet Gideri:</span>
                        <span style="color: var(--accent-2);">${formatCurrency((branch.branchPazarlama || 0) + (branch.branchYonetim || 0) + (branch.branchArge || 0))}</span>
                    </div>
                    <div class="result-row total">
                        <span>Şube Net Maliyeti:</span>
                        <span>${formatCurrency(netTotal)}</span>
                    </div>
                    <div class="result-row total" style="margin-top: 1rem; border-left-color: var(--success); background: linear-gradient(90deg, rgba(16, 185, 129, 0.1) 0%, transparent 100%);">
                        <span>Şube Brüt Kâr:</span>
                        <span style="color: ${branch.branchTotalProfit >= 0 ? 'var(--success)' : 'var(--danger)'};">${formatCurrency(branch.branchTotalProfit)}</span>
                    </div>
                    <div class="result-row total" style="margin-top: 0.5rem; border-left-color: var(--accent-1); background: linear-gradient(90deg, rgba(56, 189, 248, 0.1) 0%, transparent 100%);">
                        <span>Şube Faaliyet Kârı:</span>
                        <span style="color: ${(branch.branchTotalProfit - ((branch.branchPazarlama || 0) + (branch.branchYonetim || 0) + (branch.branchArge || 0))) >= 0 ? 'var(--success)' : 'var(--danger)'};">${formatCurrency(branch.branchTotalProfit - ((branch.branchPazarlama || 0) + (branch.branchYonetim || 0) + (branch.branchArge || 0)))}</span>
                    </div>
                    <div class="result-row total" style="margin-top: 0.5rem; border-left-color: #8b5cf6; background: linear-gradient(90deg, rgba(139, 92, 246, 0.1) 0%, transparent 100%);">
                        <span>Şube Net Kâr (Vergi Öncesi):</span>
                        <span style="color: ${(branch.branchTotalProfit - ((branch.branchPazarlama || 0) + (branch.branchYonetim || 0) + (branch.branchArge || 0)) - (branch.branchFinansman || 0)) >= 0 ? 'var(--success)' : 'var(--danger)'};">${formatCurrency(branch.branchTotalProfit - ((branch.branchPazarlama || 0) + (branch.branchYonetim || 0) + (branch.branchArge || 0)) - (branch.branchFinansman || 0))}</span>
                    </div>
                </div>
                
                <button class="btn-enter" data-bindex="${bIndex}">
                    Şube İçine Gir / Sınıflara Ayır
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
            `;
            mainBranchesContainer.insertBefore(card, btnAddBranch);
        });

        document.querySelectorAll('.branch-input.name-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const bIndex = parseInt(e.target.getAttribute('data-bindex'));
                branchData[bIndex].name = e.target.value;
                saveData();
                updateChart();
            });
        });

        document.querySelectorAll('.branch-input.emp-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const bIndex = parseInt(e.target.getAttribute('data-bindex'));
                branchData[bIndex].employees = parseFloat(e.target.value) || 0;
                saveData();
            });
        });

        document.querySelectorAll('.branch-input.labor-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const bIndex = parseInt(e.target.getAttribute('data-bindex'));
                branchData[bIndex].laborCost = parseFloat(e.target.value) || 0;
                saveData();
                calculateGlobal();
                
                const totals = document.querySelectorAll('.branch-results')[bIndex].querySelectorAll('.result-row.total');
                if (totals.length >= 2) {
                    totals[0].querySelector('span:last-child').textContent = formatCurrency(branchData[bIndex].branchNetTotal);
                    const elProfit = totals[1].querySelector('span:last-child');
                    elProfit.textContent = formatCurrency(branchData[bIndex].branchTotalProfit);
                    elProfit.style.color = branchData[bIndex].branchTotalProfit >= 0 ? 'var(--success)' : 'var(--danger)';
                }
            });
        });

        document.querySelectorAll('.btn-enter').forEach(btn => {
            btn.addEventListener('click', (e) => {
                let target = e.target;
                while(!target.hasAttribute('data-bindex')) { target = target.parentElement; }
                const bIndex = parseInt(target.getAttribute('data-bindex'));
                openDetailView(bIndex);
            });
        });

        document.querySelectorAll('.btn-delete-card').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (branchData.length <= 1) {
                    alert("En az 1 şube kalmak zorundadır.");
                    return;
                }
                let target = e.target;
                while(!target.hasAttribute('data-bindex')) { target = target.parentElement; }
                const bIndex = parseInt(target.getAttribute('data-bindex'));
                
                if (confirm(`'${branchData[bIndex].name}' şubesini silmek istediğinize emin misiniz?`)) {
                    branchData.splice(bIndex, 1);
                    saveData();
                    renderMainView();
                    calculateGlobal();
                }
            });
        });
    }

    // --- DETAIL VIEW RENDERING ---
    function openDetailView(bIndex) {
        currentBranchIndex = bIndex;
        detailBranchName.textContent = branchData[bIndex].name;
        
        mainView.classList.remove('active');
        detailView.classList.add('active');
        window.scrollTo(0,0);
        
        renderDetailView();
        calculateDetail();
    }

    function renderDetailView() {
        const branch = branchData[currentBranchIndex];
        
        const existingCards = detailClassesContainer.querySelectorAll('.glass-card:not(.add-card)');
        existingCards.forEach(c => c.remove());

        branch.subClasses.forEach((cls, cIndex) => {
            const card = document.createElement('div');
            card.className = 'glass-card';

            card.innerHTML = `
                <div class="branch-header">
                    <span class="branch-badge" style="background: linear-gradient(135deg, rgba(244, 63, 94, 0.2), rgba(236, 72, 153, 0.2)); border-color: rgba(244, 63, 94, 0.3);">Alt Sınıf</span>
                    <input type="text" data-cindex="${cIndex}" class="class-input name-input" value="${cls.name}">
                </div>
                
                <div class="sm-inputs-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem 1rem;">
                    <div class="input-group">
                        <label>Adet</label>
                        <input type="number" data-cindex="${cIndex}" class="class-input qty-input" value="${cls.quantity}" min="0">
                    </div>
                    <div class="input-group">
                        <label>Hammadde (₺)</label>
                        <input type="number" data-cindex="${cIndex}" class="class-input cost-input" value="${cls.machineCost}" min="0">
                    </div>
                    <div class="input-group">
                        <label>Satış Fiyatı (₺)</label>
                        <input type="number" data-cindex="${cIndex}" class="class-input sale-input" value="${cls.salePrice || 0}" min="0">
                    </div>
                    <div class="input-group">
                        <label>Hedef Kâr (%)</label>
                        <input type="number" data-cindex="${cIndex}" class="class-input margin-input" value="${cls.profitMargin || 0}">
                    </div>
                </div>

                <!-- PROGRESS BAR -->
                <div class="progress-container">
                    <div class="progress-label">
                        <span>Şube İçi Maliyet Yükü</span>
                        <span id="prog-text-${cIndex}">%0.0</span>
                    </div>
                    <div class="progress-track">
                        <div class="progress-fill" id="prog-fill-${cIndex}" style="width: 0%"></div>
                    </div>
                </div>

                <div class="divider"></div>

                <div class="branch-results">
                    <div class="result-row">
                        <span>Sınıf Hammadde Toplamı:</span>
                        <span id="cls-bTotal-${cIndex}">0 ₺</span>
                    </div>
                    <div class="result-row">
                        <span>Sınıf Eşit Dağıtılan İşçilik Payı:</span>
                        <span id="cls-share-${cIndex}">0 ₺</span>
                    </div>
                    <div class="result-row">
                        <span>Sınıf İşçilik Payı:</span>
                        <span id="cls-labor-share-${cIndex}">0 ₺</span>
                    </div>
                    <div class="result-row">
                        <span>Sınıf Toplam Genel Üretim Gideri Payı:</span>
                        <span id="cls-gug-${cIndex}" style="color: var(--accent-1);">0 ₺</span>
                    </div>
                    <div class="result-row">
                        <span>Sınıf Pazarlama Gideri Payı:</span>
                        <span id="cls-paz-${cIndex}" style="color: var(--accent-1);">0 ₺</span>
                    </div>
                    <div class="result-row">
                        <span>Sınıf Genel Yönetim Gideri Payı:</span>
                        <span id="cls-yonetim-${cIndex}" style="color: var(--accent-1);">0 ₺</span>
                    </div>
                    <div class="result-row">
                        <span>Sınıf Arge Gideri Payı:</span>
                        <span id="cls-arge-${cIndex}" style="color: var(--accent-1);">0 ₺</span>
                    </div>
                    <div class="result-row">
                        <span>Sınıf Finansman (Gelir/Gider) Payı:</span>
                        <span id="cls-finansman-${cIndex}" style="color: var(--danger);">0 ₺</span>
                    </div>
                    <div class="result-row">
                        <span>Sınıf Toplam Faaliyet Gideri:</span>
                        <span id="cls-faaliyet-${cIndex}" style="color: var(--accent-2);">0 ₺</span>
                    </div>
                    <div class="result-row total" style="background: linear-gradient(90deg, rgba(236, 72, 153, 0.1) 0%, transparent 100%); border-left-color: var(--accent-2);">
                        <span>Sınıf Net Maliyeti:</span>
                        <span id="cls-net-${cIndex}">0 ₺</span>
                    </div>
                    <div class="result-row total" style="background: linear-gradient(90deg, rgba(16, 185, 129, 0.1) 0%, transparent 100%); border-left-color: var(--success); margin-top: 0.5rem;">
                        <span>Sınıf Brüt Kârı:</span>
                        <span id="cls-total-profit-${cIndex}" style="color: var(--success);">0 ₺</span>
                    </div>
                    <div class="result-row total" style="background: linear-gradient(90deg, rgba(56, 189, 248, 0.1) 0%, transparent 100%); border-left-color: var(--accent-1); margin-top: 0.5rem;">
                        <span>Sınıf Faaliyet Kârı:</span>
                        <span id="cls-faaliyet-kar-${cIndex}">0 ₺</span>
                    </div>
                    <div class="result-row total" style="background: linear-gradient(90deg, rgba(139, 92, 246, 0.1) 0%, transparent 100%); border-left-color: #8b5cf6; margin-top: 0.5rem;">
                        <span>Sınıf Net Kâr (Vergi Öncesi):</span>
                        <span id="cls-net-kar-${cIndex}" style="font-weight: 800;">0 ₺</span>
                    </div>
                </div>

                <div class="divider"></div>

                <div class="branch-results">
                    <div class="result-row unit">
                        <span>1 Adet Makine Eşit Dağıtılan İşçilik Payı:</span>
                        <span id="cls-unit-share-${cIndex}">0 ₺</span>
                    </div>
                    <div class="result-row unit">
                        <span>1 Adet Makine İçin İşçilik Payı:</span>
                        <span id="cls-unit-labor-share-${cIndex}">0 ₺</span>
                    </div>
                    <div class="result-row unit">
                        <span>1 Adet Makine İçin Genel Üretim Gideri Payı:</span>
                        <span id="cls-unit-gug-${cIndex}" style="color: var(--accent-1);">0 ₺</span>
                    </div>
                    <div class="result-row unit">
                        <span>1 Adet Makine İçin Pazarlama Gideri Payı:</span>
                        <span id="cls-unit-paz-${cIndex}" style="color: var(--accent-1);">0 ₺</span>
                    </div>
                    <div class="result-row unit">
                        <span>1 Adet Makine İçin Genel Yönetim Gideri Payı:</span>
                        <span id="cls-unit-yonetim-${cIndex}" style="color: var(--accent-1);">0 ₺</span>
                    </div>
                    <div class="result-row unit">
                        <span>1 Adet Makine İçin Arge Gideri Payı:</span>
                        <span id="cls-unit-arge-${cIndex}" style="color: var(--accent-1);">0 ₺</span>
                    </div>
                    <div class="result-row unit">
                        <span>1 Adet Makine İçin Finansman (Gelir/Gider) Payı:</span>
                        <span id="cls-unit-finansman-${cIndex}" style="color: var(--danger);">0 ₺</span>
                    </div>
                    <div class="result-row unit">
                        <span>1 Adet Makine İçin Toplam Faaliyet Gideri:</span>
                        <span id="cls-unit-faaliyet-${cIndex}" style="color: var(--accent-2);">0 ₺</span>
                    </div>
                    <div class="result-row total" style="margin-top: 1rem; border-left-color: var(--accent-3); background: linear-gradient(90deg, rgba(244, 63, 94, 0.15) 0%, transparent 100%); flex-direction: column; align-items: flex-start; gap: 0.5rem;">
                        <span style="font-size: 0.95rem; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;">1 Adet Makine Maliyeti</span>
                        <span id="cls-unit-${cIndex}" style="font-size: 2rem; font-weight: 800; color: var(--text-primary);">0 ₺</span>
                    </div>
                    <div class="result-row unit" style="margin-top: 1rem; font-size: 1.2rem;">
                        <span>1 Adet Makine İçin Brüt Kâr:</span>
                        <span id="cls-profit-${cIndex}" style="font-weight: 800;">0 ₺</span>
                    </div>
                    <div class="result-row unit" style="margin-top: 0.5rem; font-size: 1.2rem;">
                        <span>1 Adet Makine İçin Faaliyet Kârı:</span>
                        <span id="cls-unit-faaliyet-kar-${cIndex}" style="font-weight: 800;">0 ₺</span>
                    </div>
                    <div class="result-row unit" style="margin-top: 0.5rem; font-size: 1.2rem;">
                        <span>1 Adet Makine İçin Net Kâr (Vergi Öncesi):</span>
                        <span id="cls-unit-net-kar-${cIndex}" style="font-weight: 800;">0 ₺</span>
                    </div>
                </div>
                
                <button class="btn-remove-class" data-cindex="${cIndex}">Sınıfı Sil</button>
            `;
            detailClassesContainer.insertBefore(card, btnAddClass);
        });

        // Bind Subclass Inputs
        document.querySelectorAll('.class-input.name-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const cIndex = parseInt(e.target.getAttribute('data-cindex'));
                branchData[currentBranchIndex].subClasses[cIndex].name = e.target.value;
                saveData();
            });
        });

        document.querySelectorAll('.class-input.qty-input, .class-input.cost-input, .class-input.sale-input, .class-input.margin-input, .class-input.currency-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const cIndex = parseInt(e.target.getAttribute('data-cindex'));
                const cls = branchData[currentBranchIndex].subClasses[cIndex];
                const isCurr = e.target.classList.contains('currency-input');
                
                if (isCurr) {
                    cls.currency = e.target.value;
                } else {
                    const isQty = e.target.classList.contains('qty-input');
                    const isSale = e.target.classList.contains('sale-input');
                    const isMargin = e.target.classList.contains('margin-input');
                    const val = parseFloat(e.target.value) || 0;
                    
                    if (isQty) cls.quantity = val;
                    else if (isSale) {
                        cls.salePrice = val;
                        cls.lastModified = 'salePrice';
                    }
                    else if (isMargin) {
                        cls.profitMargin = val;
                        cls.lastModified = 'margin';
                    }
                    else cls.machineCost = val;
                }
                
                saveData();
                calculateGlobal(); 
                calculateDetail();
            });
        });

        document.querySelectorAll('.btn-remove-class').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (branchData[currentBranchIndex].subClasses.length <= 1) {
                    alert("Şubenin en az 1 alt sınıfı olmalıdır.");
                    return;
                }
                const cIndex = parseInt(e.target.getAttribute('data-cindex'));
                if (confirm("Bu sınıfı silmek istediğinize emin misiniz?")) {
                    branchData[currentBranchIndex].subClasses.splice(cIndex, 1);
                    saveData();
                    calculateGlobal();
                    renderDetailView();
                    calculateDetail();
                }
            });
        });
    }

    // --- GLOBAL EVENTS ---
    if(sharedExpenseInput) {
        sharedExpenseInput.addEventListener('input', () => {
            saveData();
            calculateGlobal();
            renderMainView();
            if (currentBranchIndex !== null) calculateDetail();
        });
    }

    if(globalGUGInput) {
        globalGUGInput.addEventListener('input', () => {
            saveData();
            calculateGlobal();
            renderMainView();
            if (currentBranchIndex !== null) calculateDetail();
        });
    }

    if(globalPazarlamaInput) {
        globalPazarlamaInput.addEventListener('input', () => {
            saveData();
            calculateGlobal();
            renderMainView();
            if (currentBranchIndex !== null) calculateDetail();
        });
    }
    if(globalYonetimInput) {
        globalYonetimInput.addEventListener('input', () => {
            saveData();
            calculateGlobal();
            renderMainView();
            if (currentBranchIndex !== null) calculateDetail();
        });
    }

    if(globalArgeInput) {
        globalArgeInput.addEventListener('input', () => {
            saveData();
            calculateGlobal();
            renderMainView();
            if (currentBranchIndex !== null) calculateDetail();
        });
    }

    if(globalFinansmanInput) {
        globalFinansmanInput.addEventListener('input', () => {
            saveData();
            calculateGlobal();
            renderMainView();
            if (currentBranchIndex !== null) calculateDetail();
        });
    }


    if(rateUSDInput) {
        rateUSDInput.addEventListener('input', () => {
            saveData();
            calculateGlobal();
            renderMainView();
            if (currentBranchIndex !== null) calculateDetail();
        });
    }

    if(rateEURInput) {
        rateEURInput.addEventListener('input', () => {
            saveData();
            calculateGlobal();
            renderMainView();
            if (currentBranchIndex !== null) calculateDetail();
        });
    }

    btnBackToMain.addEventListener('click', () => {
        currentBranchIndex = null;
        detailView.classList.remove('active');
        mainView.classList.add('active');
        window.scrollTo(0,0);
    });

    btnAddBranch.addEventListener('click', () => {
        branchData.push({
            name: "Yeni Şube",
            laborCost: 0,
            branchBaseTotal: 0,
            branchShare: 0,
            subClasses: [
                { name: "Yeni Sınıf 1", quantity: 1, machineCost: 0 }
            ]
        });
        saveData();
        renderMainView();
        calculateGlobal();
    });

    btnAddClass.addEventListener('click', function addNewClass() {
        branchData[currentBranchIndex].subClasses.push({
            name: 'Yeni Sınıf',
            quantity: 1,
            machineCost: 0,
            salePrice: 0,
            currency: 'TL',
            profitMargin: 0
        });
        saveData();
        calculateGlobal();
        renderDetailView();
        calculateDetail();
    });

    // --- SCENARIO COMPARISON ---
    const btnCompareScenarios = document.getElementById('btnCompareScenarios');
    const btnBackFromCompare = document.getElementById('btnBackFromCompare');
    const comparisonView = document.getElementById('comparison-view');
    const compareSelectA = document.getElementById('compareSelectA');
    const compareSelectB = document.getElementById('compareSelectB');
    const compareResultsA = document.getElementById('compareResultsA');
    const compareResultsB = document.getElementById('compareResultsB');

    function renderCompareResults(scenarioKey, container) {
        if (!scenarioKey || !scenarios[scenarioKey]) {
            container.innerHTML = '<p style="opacity:0.7;">Lütfen senaryo seçin</p>';
            return;
        }
        
        const s = scenarios[scenarioKey];
        // Note: we need to do a lightweight calculate for the scenario if it's not the active one
        // But for simplicity, let's assume we can compute global totals quickly or they are already stored?
        // Let's compute them manually here
        let globalBase = 0, globalLabor = 0, totalSales = 0;
        s.branchData.forEach(b => {
            let bTotal = 0;
            b.subClasses.forEach(cls => {
                let rate = 1;
                if (cls.currency === 'USD') rate = parseFloat(s.rateUSD) || 34.50;
                else if (cls.currency === 'EUR') rate = parseFloat(s.rateEUR) || 38.20;
                bTotal += (cls.machineCost || 0) * rate * (cls.quantity || 1);
                totalSales += (cls.salePrice || 0) * (cls.quantity || 1);
            });
            globalBase += bTotal;
            globalLabor += (b.laborCost || 0);
        });
        
        const gExp = parseFloat(s.sharedExpense) || 0;
        const gGug = parseFloat(s.globalGUG) || 0;
        const gPaz = parseFloat(s.globalPazarlama) || 0;
                    const gYonetim = parseFloat(s.globalYonetim) || 0;
                    const gArge = parseFloat(s.globalArge) || 0;
        const netCost = globalBase + globalLabor + gExp + gGug + gPaz;
        const grossProfit = totalSales - (netCost - gPaz - gYonetim - gArge);
        
        container.innerHTML = `
            <div class="result-row total"><span class="label">Net Maliyet</span><span class="value">${formatCurrency(netCost)}</span></div>
            <div class="result-row total"><span class="label">Brüt Kâr</span><span class="value" style="color: ${grossProfit >= 0 ? 'var(--success)' : 'var(--danger)'};">${formatCurrency(grossProfit)}</span></div>
            <hr style="margin: 1rem 0; border: none; border-top: 1px solid var(--border);">
            <div style="font-size: 0.9rem;">
                <p><strong>Dağıtılan İşçilik:</strong> ${formatCurrency(gExp)}</p>
                <p><strong>GÜG:</strong> ${formatCurrency(gGug)}</p>
                <p><strong>Pazarlama:</strong> ${formatCurrency(gPaz)}</p>
                <p><strong>Genel Yönetim:</strong> ${formatCurrency(gYonetim)}</p>
                <p><strong>Arge:</strong> ${formatCurrency(gArge)}</p>
                <p><strong>Şube İşçilikleri:</strong> ${formatCurrency(globalLabor)}</p>
                <p><strong>Hammadde Toplam:</strong> ${formatCurrency(globalBase)}</p>
            </div>
        `;
    }

    function updateComparison() {
        renderCompareResults(compareSelectA.value, compareResultsA);
        renderCompareResults(compareSelectB.value, compareResultsB);
    }

    if (btnCompareScenarios) {
        btnCompareScenarios.addEventListener('click', () => {
            mainView.classList.remove('active');
            detailView.classList.remove('active');
            comparisonView.classList.add('active');
            
            // Populate selects
            compareSelectA.innerHTML = '';
            compareSelectB.innerHTML = '';
            
            Object.keys(scenarios).forEach(key => {
                const optA = document.createElement('option');
                optA.value = key;
                optA.textContent = key;
                compareSelectA.appendChild(optA);
                
                const optB = document.createElement('option');
                optB.value = key;
                optB.textContent = key;
                compareSelectB.appendChild(optB);
            });
            
            compareSelectA.value = currentScenarioId;
            // set B to another scenario if exists
            const keys = Object.keys(scenarios);
            if (keys.length > 1) {
                compareSelectB.value = keys.find(k => k !== currentScenarioId) || currentScenarioId;
            } else {
                compareSelectB.value = currentScenarioId;
            }
            
            updateComparison();
        });
        
        compareSelectA.addEventListener('change', updateComparison);
        compareSelectB.addEventListener('change', updateComparison);
        
        btnBackFromCompare.addEventListener('click', () => {
            comparisonView.classList.remove('active');
            mainView.classList.add('active');
            window.scrollTo(0,0);
        });
    }

    // INIT
    loadData();
});



