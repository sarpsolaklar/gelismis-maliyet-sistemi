/**
 * Celmak Tarım Makineleri Fabrikası - Bağımsız İK ve Maaş Yönetim Portalı
 */

import { HRDatabase, FACTORY_WORK_CONFIG } from './data.js';
import { HREngine } from './engine.js';

// Veritabanı ve Hesaplama Motorunu Başlat
const db = new HRDatabase();
const engine = new HREngine(db);

let currentPeriod = "2026-10";
let activeTab = "personel";
let activeCategoryFilter = "ALL";
let searchQuery = "";

// DOM Yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initEventListeners();
    renderAll();
});

function initNavigation() {
    const tabs = document.querySelectorAll('.nav-tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeTab = tab.dataset.tab;

            document.querySelectorAll('.tab-view').forEach(view => {
                view.classList.remove('active');
            });
            const targetView = document.getElementById(`view-${activeTab}`);
            if (targetView) targetView.classList.add('active');

            renderCurrentTab();
        });
    });
}

function initEventListeners() {
    // Arama
    const searchInput = document.getElementById('employeeSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase();
            renderEmployees();
        });
    }

    // Kategori Filtresi
    const catFilter = document.getElementById('categoryFilter');
    if (catFilter) {
        catFilter.addEventListener('change', (e) => {
            activeCategoryFilter = e.target.value;
            renderEmployees();
        });
    }

    // Dönem Seçici
    const periodSelect = document.getElementById('periodSelect');
    if (periodSelect) {
        periodSelect.addEventListener('change', (e) => {
            currentPeriod = e.target.value;
            renderPayroll();
            renderAttendance();
        });
    }

    // Modal Kapatma
    document.querySelectorAll('.modal-close-btn, .btn-modal-cancel').forEach(btn => {
        btn.addEventListener('click', closeModal);
    });

    // Yeni Personel Butonu
    const btnNewEmp = document.getElementById('btnNewEmployee');
    if (btnNewEmp) {
        btnNewEmp.addEventListener('click', () => openModal('modalEmployee'));
    }

    // Personel Kaydet Formu
    const formEmp = document.getElementById('formEmployee');
    if (formEmp) {
        formEmp.addEventListener('submit', (e) => {
            e.preventDefault();
            const newEmp = {
                firstName: document.getElementById('empFirstName').value,
                lastName: document.getElementById('empLastName').value,
                tcNo: document.getElementById('empTcNo').value,
                category: document.getElementById('empCategory').value,
                department: document.getElementById('empDepartment').value,
                position: document.getElementById('empPosition').value,
                hireDate: document.getElementById('empHireDate').value || new Date().toISOString().split('T')[0],
                phone: document.getElementById('empPhone').value,
                bloodType: document.getElementById('empBloodType').value,
                ppeSizes: {
                    shoes: document.getElementById('empShoeSize').value,
                    suit: document.getElementById('empSuitSize').value,
                    helmet: "Standart"
                },
                iban: document.getElementById('empIban').value,
                salaryType: "NET",
                baseSalary: Number(document.getElementById('empSalary').value) || 0,
                allowances: {
                    food: Number(document.getElementById('empFoodAllowance').value) || 0,
                    road: Number(document.getElementById('empRoadAllowance').value) || 0,
                    child: Number(document.getElementById('empChildAllowance').value) || 0
                },
                status: "ACTIVE"
            };
            db.addEmployee(newEmp);
            closeModal();
            renderAll();
            alert(`${newEmp.firstName} ${newEmp.lastName} başarıyla fabrikaya kaydedildi!`);
        });
    }

    // Yeni Fazla Mesai Butonu
    const btnNewOT = document.getElementById('btnNewOvertime');
    if (btnNewOT) {
        btnNewOT.addEventListener('click', () => {
            populateEmployeeSelect('otEmployeeSelect');
            openModal('modalOvertime');
        });
    }

    // Fazla Mesai Formu
    const formOT = document.getElementById('formOvertime');
    if (formOT) {
        formOT.addEventListener('submit', (e) => {
            e.preventDefault();
            const ot = {
                employeeId: document.getElementById('otEmployeeSelect').value,
                date: document.getElementById('otDate').value,
                hours: Number(document.getElementById('otHours').value),
                rateType: document.getElementById('otRateType').value,
                reason: document.getElementById('otReason').value,
                status: "APPROVED",
                approvedBy: "Atölye Şefi / Fabrika Müdürü"
            };
            db.addOvertime(ot);
            closeModal();
            renderAll();
        });
    }

    // Yeni Avans Butonu
    const btnNewAdv = document.getElementById('btnNewAdvance');
    if (btnNewAdv) {
        btnNewAdv.addEventListener('click', () => {
            populateEmployeeSelect('advEmployeeSelect');
            openModal('modalAdvance');
        });
    }

    // Avans Formu
    const formAdv = document.getElementById('formAdvance');
    if (formAdv) {
        formAdv.addEventListener('submit', (e) => {
            e.preventDefault();
            const adv = {
                employeeId: document.getElementById('advEmployeeSelect').value,
                date: document.getElementById('advDate').value,
                amount: Number(document.getElementById('advAmount').value),
                reason: document.getElementById('advReason').value,
                targetPeriod: currentPeriod,
                status: "APPROVED"
            };
            db.addAdvance(adv);
            closeModal();
            renderAll();
        });
    }

    // Yeni Saha Görevi Butonu
    const btnNewMission = document.getElementById('btnNewMission');
    if (btnNewMission) {
        btnNewMission.addEventListener('click', () => {
            populateEmployeeSelect('misEmployeeSelect', ['FIELD_TECH', 'WHITE_COLLAR']);
            openModal('modalMission');
        });
    }

    // Saha Görevi Formu
    const formMission = document.getElementById('formMission');
    if (formMission) {
        formMission.addEventListener('submit', (e) => {
            e.preventDefault();
            const days = Number(document.getElementById('misDays').value) || 1;
            const mis = {
                employeeId: document.getElementById('misEmployeeSelect').value,
                destination: document.getElementById('misDestination').value,
                startDate: document.getElementById('misStartDate').value,
                endDate: document.getElementById('misEndDate').value,
                days: days,
                perDiemTotal: days * FACTORY_WORK_CONFIG.perDiemDailyAmount,
                vehiclePlate: document.getElementById('misPlate').value || "10 CLM 540",
                status: "IN_PROGRESS"
            };
            db.addFieldMission(mis);
            closeModal();
            renderAll();
        });
    }

    // Banka Ödeme Listesi İndir Butonu
    const btnExportBank = document.getElementById('btnExportBank');
    if (btnExportBank) {
        btnExportBank.addEventListener('click', exportBankListCSV);
    }

    // ERP/Muhasebe JSON İndir Butonu
    const btnExportERP = document.getElementById('btnExportERP');
    if (btnExportERP) {
        btnExportERP.addEventListener('click', exportERPJSON);
    }

    // Sıfırla Butonu
    const btnResetData = document.getElementById('btnResetData');
    if (btnResetData) {
        btnResetData.addEventListener('click', () => {
            if (confirm("Tüm veriler fabrika varsayılanına sıfırlansın mı?")) {
                db.resetToDefaults();
                renderAll();
            }
        });
    }
}

function openModal(modalId) {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
}

function closeModal() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
}

function populateEmployeeSelect(selectId, allowedCategories = null) {
    const sel = document.getElementById(selectId);
    if (!sel) return;
    sel.innerHTML = '';
    db.employees.forEach(emp => {
        if (!allowedCategories || allowedCategories.includes(emp.category)) {
            const opt = document.createElement('option');
            opt.value = emp.id;
            opt.textContent = `${emp.code} - ${emp.firstName} ${emp.lastName} (${emp.position})`;
            sel.appendChild(opt);
        }
    });
}

function renderAll() {
    renderHeaderStats();
    renderCurrentTab();
}

function renderHeaderStats() {
    const activeCount = db.employees.filter(e => e.status === "ACTIVE").length;
    const blueCount = db.employees.filter(e => e.category === "BLUE_COLLAR").length;
    const fieldCount = db.employees.filter(e => e.category === "FIELD_TECH").length;
    
    const fullPayroll = engine.generateFullFactoryPayroll(currentPeriod);

    const elEmpCount = document.getElementById('statEmpCount');
    if (elEmpCount) elEmpCount.textContent = activeCount;

    const elBlueCount = document.getElementById('statBlueCount');
    if (elBlueCount) elBlueCount.textContent = `${blueCount} İmalat / ${fieldCount} Saha`;

    const elTotalNet = document.getElementById('statTotalNetPayroll');
    if (elTotalNet) {
        elTotalNet.textContent = fullPayroll.summary.totalNetPayout.toLocaleString('tr-TR', { maximumFractionDigits: 0 }) + " ₺";
    }
}

function renderCurrentTab() {
    if (activeTab === "personel") renderEmployees();
    else if (activeTab === "puantaj") renderAttendance();
    else if (activeTab === "isg") renderISGAndAssets();
    else if (activeTab === "maas") renderPayroll();
    else if (activeTab === "entegrasyon") renderIntegration();
}

// 1. Personel Listesi
function renderEmployees() {
    const grid = document.getElementById('employeeCardsGrid');
    if (!grid) return;

    let filtered = db.employees.filter(emp => {
        const matchesCategory = (activeCategoryFilter === "ALL") || (emp.category === activeCategoryFilter);
        const fullName = `${emp.firstName} ${emp.lastName} ${emp.department} ${emp.position} ${emp.code}`.toLowerCase();
        const matchesSearch = !searchQuery || fullName.includes(searchQuery);
        return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 40px;">Kriterlere uygun personel bulunamadı.</div>`;
        return;
    }

    grid.innerHTML = filtered.map(emp => {
        let badgeClass = "badge-blue";
        let badgeText = "Mavi Yaka (İmalat)";
        if (emp.category === "WHITE_COLLAR") {
            badgeClass = "badge-purple";
            badgeText = "Beyaz Yaka (Ar-Ge / Ofis)";
        } else if (emp.category === "FIELD_TECH") {
            badgeClass = "badge-green";
            badgeText = "Saha & Gezici Servis";
        }

        const initials = `${emp.firstName[0]}${emp.lastName[0]}`;
        const food = emp.allowances?.food || 0;
        const road = emp.allowances?.road || 0;
        const child = emp.allowances?.child || 0;

        return `
            <div class="employee-card">
                <div class="emp-header">
                    <div class="emp-avatar">${initials}</div>
                    <span class="emp-category-badge ${badgeClass}">${badgeText}</span>
                </div>
                <div class="emp-info">
                    <h3>${emp.firstName} ${emp.lastName} <small style="font-size:0.75rem; color:var(--text-secondary);">(${emp.code})</small></h3>
                    <p class="title">${emp.department} • <strong>${emp.position}</strong></p>
                </div>
                <div class="emp-details-list">
                    <div class="detail-row">
                        <span>Net Taban Maaş:</span>
                        <span class="val">${emp.baseSalary.toLocaleString('tr-TR')} ₺</span>
                    </div>
                    <div class="detail-row">
                        <span>Sosyal Haklar:</span>
                        <span class="val">Yemek: ${food}₺ | Yol: ${road}₺ | Çocuk: ${child}₺</span>
                    </div>
                    <div class="detail-row">
                        <span>İşe Giriş:</span>
                        <span class="val">${emp.hireDate}</span>
                    </div>
                    <div class="detail-row">
                        <span>KKD & Beden:</span>
                        <span class="val">Ayakkabı: ${emp.ppeSizes?.shoes || '-'} | Tulum: ${emp.ppeSizes?.suit || '-'} | Kan: ${emp.bloodType}</span>
                    </div>
                    <div class="detail-row">
                        <span>IBAN:</span>
                        <span class="val" style="font-family: monospace; font-size: 0.8rem;">${emp.iban || '-'}</span>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn btn-outline btn-sm" onclick="window.viewEmployeePayroll('${emp.id}')">Bordro Gör</button>
                    <button class="btn btn-outline btn-sm" onclick="window.quickAddOvertime('${emp.id}')">+ Mesai Yaz</button>
                </div>
            </div>
        `;
    }).join('');
}

// 2. Puantaj & Fazla Mesai & Saha
function renderAttendance() {
    const otTableBody = document.getElementById('overtimeTableBody');
    if (otTableBody) {
        otTableBody.innerHTML = db.overtimes.map(ot => {
            const emp = db.employees.find(e => e.id === ot.employeeId);
            const empName = emp ? `${emp.firstName} ${emp.lastName} (${emp.code})` : 'Bilinmeyen';
            const rateBadge = ot.rateType === "WEEKEND" 
                ? '<span style="color:#f59e0b; font-weight:600;">%100 (Hafta Sonu / Tatil)</span>' 
                : '<span style="color:#60a5fa; font-weight:600;">%50 (Hafta İçi)</span>';
            
            return `
                <tr>
                    <td><strong>${ot.date}</strong></td>
                    <td>${empName}</td>
                    <td><strong>${ot.hours} Saat</strong></td>
                    <td>${rateBadge}</td>
                    <td>${ot.reason}</td>
                    <td><span style="color:#10b981; font-weight:600;">✔ Onaylandı</span> (${ot.approvedBy})</td>
                </tr>
            `;
        }).join('');
    }

    const missionTableBody = document.getElementById('missionTableBody');
    if (missionTableBody) {
        missionTableBody.innerHTML = db.fieldMissions.map(m => {
            const emp = db.employees.find(e => e.id === m.employeeId);
            const empName = emp ? `${emp.firstName} ${emp.lastName}` : 'Bilinmeyen';
            return `
                <tr>
                    <td>${empName}</td>
                    <td><strong>${m.destination}</strong></td>
                    <td>${m.startDate} ~ ${m.endDate} (${m.days} Gün)</td>
                    <td><span style="color:#34d399; font-weight:700;">${m.perDiemTotal.toLocaleString('tr-TR')} ₺</span></td>
                    <td>${m.vehiclePlate}</td>
                    <td><span class="emp-category-badge badge-green">${m.status}</span></td>
                </tr>
            `;
        }).join('');
    }
}

// 3. İSG, Sertifika ve Zimmet
function renderISGAndAssets() {
    const certGrid = document.getElementById('certTableBody');
    if (certGrid) {
        certGrid.innerHTML = db.certifications.map(c => {
            const emp = db.employees.find(e => e.id === c.employeeId);
            const empName = emp ? `${emp.firstName} ${emp.lastName} (${emp.position})` : 'Bilinmeyen';
            
            let statusBadge = '<span class="emp-category-badge badge-green">Geçerli</span>';
            if (c.status === "EXPIRING_SOON") {
                statusBadge = '<span class="emp-category-badge badge-blue" style="background:rgba(245,158,11,0.2); color:#fbbf24; border:1px solid #fbbf24;">Süresi Yaklaşıyor (Yenileme Gerekiyor)</span>';
            }

            return `
                <tr>
                    <td><strong>${c.type}</strong></td>
                    <td>${empName}</td>
                    <td><code>${c.documentNo}</code></td>
                    <td>${c.issueDate}</td>
                    <td><strong>${c.expiryDate}</strong></td>
                    <td>${statusBadge}</td>
                </tr>
            `;
        }).join('');
    }

    const assetGrid = document.getElementById('assetTableBody');
    if (assetGrid) {
        assetGrid.innerHTML = db.assets.map(a => {
            const emp = db.employees.find(e => e.id === a.employeeId);
            const empName = emp ? `${emp.firstName} ${emp.lastName}` : 'Bilinmeyen';
            return `
                <tr>
                    <td><span class="emp-category-badge badge-purple">${a.category}</span></td>
                    <td><strong>${a.name}</strong></td>
                    <td><code>${a.identifier}</code></td>
                    <td>${empName}</td>
                    <td>${a.assignedDate}</td>
                    <td>${a.condition}</td>
                </tr>
            `;
        }).join('');
    }
}

// 4. Bordro ve Maaş Tablosu
function renderPayroll() {
    const fullPayroll = engine.generateFullFactoryPayroll(currentPeriod);
    const tbody = document.getElementById('payrollTableBody');
    if (!tbody) return;

    // Özet Kartları Güncelle
    document.getElementById('payrollSummaryBase').textContent = fullPayroll.summary.totalBaseSalary.toLocaleString('tr-TR') + " ₺";
    document.getElementById('payrollSummaryOvertime').textContent = fullPayroll.summary.totalOvertimePay.toLocaleString('tr-TR') + " ₺";
    document.getElementById('payrollSummaryPerDiem').textContent = fullPayroll.summary.totalPerDiemPay.toLocaleString('tr-TR') + " ₺";
    document.getElementById('payrollSummaryAdvances').textContent = "-" + fullPayroll.summary.totalAdvances.toLocaleString('tr-TR') + " ₺";
    document.getElementById('payrollSummaryExecution').textContent = "-" + fullPayroll.summary.totalExecutionCuts.toLocaleString('tr-TR') + " ₺";
    document.getElementById('payrollSummaryNet').textContent = fullPayroll.summary.totalNetPayout.toLocaleString('tr-TR') + " ₺";

    tbody.innerHTML = fullPayroll.payrolls.map(p => {
        return `
            <tr>
                <td><strong>${p.employee.code}</strong></td>
                <td>${p.employee.firstName} ${p.employee.lastName}<br><small style="color:var(--text-secondary);">${p.employee.position}</small></td>
                <td>${p.earnings.baseSalary.toLocaleString('tr-TR')} ₺</td>
                <td>
                    <span style="color:#60a5fa; font-weight:600;">+${p.earnings.overtimePay.toLocaleString('tr-TR')} ₺</span>
                    <br><small>(${p.earnings.overtimeHours} Saat)</small>
                </td>
                <td>
                    ${p.earnings.perDiemPay > 0 ? `<span style="color:#34d399; font-weight:600;">+${p.earnings.perDiemPay.toLocaleString('tr-TR')} ₺</span>` : '-'}
                </td>
                <td>+${p.earnings.totalAllowances.toLocaleString('tr-TR')} ₺</td>
                <td>
                    ${p.deductions.advanceCut > 0 ? `<span style="color:#ef4444;">-${p.deductions.advanceCut.toLocaleString('tr-TR')} ₺</span>` : '-'}
                </td>
                <td>
                    ${p.deductions.executionCut > 0 ? `<span style="color:#ef4444; font-weight:600;">-${p.deductions.executionCut.toLocaleString('tr-TR')} ₺</span>` : '-'}
                </td>
                <td>
                    <strong style="color:#38bdf8; font-size:1.05rem;">${p.netPayout.toLocaleString('tr-TR')} ₺</strong>
                </td>
                <td>
                    <button class="btn btn-outline btn-sm" onclick="window.viewEmployeePayroll('${p.employee.id}')">Bordro Zarfı</button>
                </td>
            </tr>
        `;
    }).join('');
}

// 5. Entegrasyon ve API Ekranı
function renderIntegration() {
    const erpPayload = engine.exportERPAccountingPayload(currentPeriod);
    const jsonContainer = document.getElementById('erpJsonPreview');
    if (jsonContainer) {
        jsonContainer.textContent = JSON.stringify(erpPayload, null, 2);
    }
}

// Global Fonksiyonlar (Arayüz Butonları İçin)
window.viewEmployeePayroll = function(employeeId) {
    const p = engine.calculateEmployeePayroll(employeeId, currentPeriod);
    if (!p) return;

    const modalBody = document.getElementById('slipModalBody');
    if (!modalBody) return;

    modalBody.innerHTML = `
        <div style="border: 2px dashed rgba(255,255,255,0.2); padding: 20px; border-radius: 12px; background: rgba(0,0,0,0.2);">
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:10px; margin-bottom:15px;">
                <div>
                    <h3 style="font-size:1.2rem; color:var(--accent-primary);">CELMAK TARIM MAKİNELERİ SAN. TİC. A.Ş.</h3>
                    <p style="font-size:0.85rem; color:var(--text-secondary);">Aylık Ücret ve Hesap Pusulası (${p.period})</p>
                </div>
                <div style="text-align:right;">
                    <strong>${p.employee.code}</strong><br>
                    <span>${p.employee.department}</span>
                </div>
            </div>

            <table style="width:100%; font-size:0.9rem; margin-bottom:15px;">
                <tr><td><strong>Personel:</strong> ${p.employee.firstName} ${p.employee.lastName}</td> <td><strong>TC Kimlik:</strong> ${p.employee.tcNo}</td></tr>
                <tr><td><strong>Görevi:</strong> ${p.employee.position}</td> <td><strong>IBAN:</strong> ${p.employee.iban}</td></tr>
                <tr><td><strong>Saatlik Ücret Esası:</strong> ${p.hourlyRate} ₺/Saat</td> <td><strong>Kadro:</strong> ${p.employee.category}</td></tr>
            </table>

            <h4 style="color:#60a5fa; margin-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:4px;">HAKEDİŞLER</h4>
            <div class="detail-row"><span>Taban Maaş:</span> <span class="val">${p.earnings.baseSalary.toLocaleString('tr-TR')} ₺</span></div>
            <div class="detail-row"><span>Fazla Mesai (${p.earnings.overtimeHours} Saat):</span> <span class="val">+${p.earnings.overtimePay.toLocaleString('tr-TR')} ₺</span></div>
            <div class="detail-row"><span>Saha Görev Harcırahı (${p.earnings.perDiemDays} Gün):</span> <span class="val">+${p.earnings.perDiemPay.toLocaleString('tr-TR')} ₺</span></div>
            <div class="detail-row"><span>Sosyal Yardımlar (Yol/Yemek/Çocuk):</span> <span class="val">+${p.earnings.totalAllowances.toLocaleString('tr-TR')} ₺</span></div>
            <div class="detail-row" style="font-weight:700; color:#34d399; margin-top:5px; border-top:1px solid rgba(255,255,255,0.1); padding-top:5px;">
                <span>Toplam Kazanç (Brüt Ele Geçen):</span> <span class="val">${p.earnings.totalGross.toLocaleString('tr-TR')} ₺</span>
            </div>

            <h4 style="color:#f87171; margin-top:15px; margin-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:4px;">KESİNTİLER</h4>
            <div class="detail-row"><span>Avans Mahsubu:</span> <span class="val" style="color:#ef4444;">-${p.deductions.advanceCut.toLocaleString('tr-TR')} ₺</span></div>
            <div class="detail-row"><span>İcra / Yasal Kesinti:</span> <span class="val" style="color:#ef4444;">-${p.deductions.executionCut.toLocaleString('tr-TR')} ₺</span></div>
            <div class="detail-row" style="font-weight:700; color:#ef4444; margin-top:5px; border-top:1px solid rgba(255,255,255,0.1); padding-top:5px;">
                <span>Toplam Kesintiler:</span> <span class="val">-${p.deductions.totalDeductions.toLocaleString('tr-TR')} ₺</span>
            </div>

            <div style="margin-top:20px; padding:15px; background:rgba(37,99,235,0.15); border:1px solid #3b82f6; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:1.1rem; font-weight:700;">BANKAYA YATACAK NET TUTAR:</span>
                <span style="font-size:1.4rem; font-weight:800; color:#38bdf8;">${p.netPayout.toLocaleString('tr-TR')} ₺</span>
            </div>
            
            <div style="margin-top:25px; display:flex; justify-content:space-between; font-size:0.8rem; color:var(--text-secondary); text-align:center;">
                <div style="width:40%;">İşveren / İK Yetkilisi Kaşe - İmza<br><br>____________________</div>
                <div style="width:40%;">Personel Teslim Aldım İmzası<br><br>____________________</div>
            </div>
        </div>
    `;

    openModal('modalSlip');
};

window.quickAddOvertime = function(employeeId) {
    populateEmployeeSelect('otEmployeeSelect');
    document.getElementById('otEmployeeSelect').value = employeeId;
    openModal('modalOvertime');
};

function exportBankListCSV() {
    const bankData = engine.exportBankTransferList(currentPeriod);
    let csvContent = "\uFEFF"; // UTF-8 BOM
    csvContent += bankData.headers.join(";") + "\r\n";
    bankData.rows.forEach(r => {
        csvContent += r.join(";") + "\r\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Celmak_Fabrika_Banka_Maas_Listesi_${currentPeriod}.csv`;
    link.click();
}

function exportERPJSON() {
    const erpPayload = engine.exportERPAccountingPayload(currentPeriod);
    const blob = new Blob([JSON.stringify(erpPayload, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Celmak_IK_Mahsup_Fisi_${currentPeriod}.json`;
    link.click();
}
