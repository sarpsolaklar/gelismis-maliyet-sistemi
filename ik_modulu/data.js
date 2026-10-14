/**
 * Tarım Makineleri Fabrikası Bağımsız İK Modülü - Çekirdek Veri Modeli ve Depolama Katmanı
 * 
 * Bu dosya, diğer fabrika modülleriyle (ERP, Üretim, Satış, Muhasebe) kolayca entegre olabilen
 * esnek veri modellerini ve başlangıç (mock) fabrika verilerini içerir.
 */

const IK_DATA_STORAGE_KEY = 'CELMAK_HR_SYSTEM_DATA_V1';

// Varsayılan Sabit Fabrika Çalışma Saatleri (Vardiyasız)
export const FACTORY_WORK_CONFIG = {
    startHour: "08:00",
    endHour: "18:00",
    dailyWorkMinutes: 540, // 9 saat net (1 saat öğle/çay molası hariç)
    weeklyWorkHours: 45,
    weekdayOvertimeRate: 1.5, // Hafta içi fazla mesai %50 zamlı
    weekendOvertimeRate: 2.0, // Hafta sonu / tatil mesaisi %100 zamlı
    perDiemDailyAmount: 750 // Saha/servis günlük harcırah tutarı (TL)
};

// Başlangıç Fabrika Personel Verisi
const INITIAL_EMPLOYEES = [
    {
        id: "EMP-001",
        code: "SC-101",
        firstName: "Mehmet",
        lastName: "Kaya",
        tcNo: "12345678901",
        category: "BLUE_COLLAR", // Mavi Yaka
        department: "Kaynak & Şasi Atölyesi",
        position: "Kıdemli Gazaltı Kaynak Ustası",
        hireDate: "2021-03-15",
        phone: "0532 111 22 33",
        bloodType: "A Rh+",
        ppeSizes: { shoes: "43", suit: "XL", helmet: "Standart" },
        iban: "TR330006100511123456789001",
        salaryType: "NET",
        baseSalary: 42000,
        allowances: { food: 5000, road: 2500, child: 1000 },
        status: "ACTIVE"
    },
    {
        id: "EMP-002",
        code: "SC-102",
        firstName: "Ali",
        lastName: "Demir",
        tcNo: "23456789012",
        category: "BLUE_COLLAR",
        department: "Montaj Hattı",
        position: "Traktör & Balya Montaj Teknisyeni",
        hireDate: "2022-06-01",
        phone: "0533 222 33 44",
        bloodType: "0 Rh+",
        ppeSizes: { shoes: "42", suit: "L", helmet: "Standart" },
        iban: "TR560006200511123456789002",
        salaryType: "NET",
        baseSalary: 38500,
        allowances: { food: 5000, road: 2500, child: 0 },
        status: "ACTIVE"
    },
    {
        id: "EMP-003",
        code: "SC-103",
        firstName: "Murat",
        lastName: "Çelik",
        tcNo: "34567890123",
        category: "FIELD_TECH", // Gezici Saha Servis
        department: "Satış Sonrası Hizmetler (SSH)",
        position: "Gezici Servis Teknisyeni",
        hireDate: "2020-01-10",
        phone: "0542 333 44 55",
        bloodType: "B Rh+",
        ppeSizes: { shoes: "44", suit: "XL", helmet: "Standart" },
        iban: "TR880006400511123456789003",
        salaryType: "NET",
        baseSalary: 45000,
        allowances: { food: 5000, road: 0, child: 1500 }, // Aracı var, yol yardımı yok
        status: "ACTIVE"
    },
    {
        id: "EMP-004",
        code: "SC-104",
        firstName: "Ayşe",
        lastName: "Yılmaz",
        tcNo: "45678901234",
        category: "WHITE_COLLAR", // Beyaz Yaka
        department: "Tasarım & Ar-Ge",
        position: "Ziraat / Makine Mühendisi",
        hireDate: "2019-09-01",
        phone: "0555 444 55 66",
        bloodType: "AB Rh+",
        ppeSizes: { shoes: "38", suit: "M", helmet: "Standart" },
        iban: "TR120006700511123456789004",
        salaryType: "NET",
        baseSalary: 62000,
        allowances: { food: 5000, road: 3000, child: 0 },
        status: "ACTIVE"
    },
    {
        id: "EMP-005",
        code: "SC-105",
        firstName: "Burak",
        lastName: "Öztürk",
        tcNo: "56789012345",
        category: "BLUE_COLLAR",
        department: "Talaşlı İmalat",
        position: "CNC Freze & Torna Operatörü",
        hireDate: "2023-02-15",
        phone: "0536 555 66 77",
        bloodType: "0 Rh-",
        ppeSizes: { shoes: "41", suit: "M", helmet: "Standart" },
        iban: "TR900001500511123456789005",
        salaryType: "NET",
        baseSalary: 37000,
        allowances: { food: 5000, road: 2500, child: 0 },
        status: "ACTIVE"
    }
];

// İSG ve Yeterlilik Sertifikaları (Kaynak, Forklift, Periyodik Muayene)
const INITIAL_CERTIFICATIONS = [
    {
        id: "CERT-001",
        employeeId: "EMP-001",
        type: "MYK Gazaltı Kaynakçı Belgesi (Seviye 4)",
        documentNo: "MYK-2023-9981",
        issueDate: "2023-04-10",
        expiryDate: "2027-04-10",
        status: "VALID"
    },
    {
        id: "CERT-002",
        employeeId: "EMP-002",
        type: "Tavan Vinci Operatörlük Belgesi",
        documentNo: "TVC-5521",
        issueDate: "2022-07-01",
        expiryDate: "2026-11-15", // Süresi yaklaşan örnek (uyarı testi için)
        status: "EXPIRING_SOON"
    },
    {
        id: "CERT-003",
        employeeId: "EMP-003",
        type: "SRC 4 Belgesi & Psikoteknik",
        documentNo: "SRC-44912",
        issueDate: "2021-02-10",
        expiryDate: "2028-02-10",
        status: "VALID"
    },
    {
        id: "CERT-004",
        employeeId: "EMP-005",
        type: "Forklift Operatörlük Belgesi (G Sınıfı)",
        documentNo: "EHL-7712",
        issueDate: "2021-05-20",
        expiryDate: "2026-10-30", // Çok yakında bitiyor
        status: "EXPIRING_SOON"
    }
];

// Zimmetler (Takım çantaları, servis araçları, ölçüm cihazları)
const INITIAL_ASSETS = [
    {
        id: "AST-001",
        employeeId: "EMP-001",
        category: "Ekipman / Alet",
        name: "Optik Kaynakçı Başlığı & Havalandırma Ünitesi",
        identifier: "KB-2023-09",
        assignedDate: "2023-04-12",
        condition: "İyi"
    },
    {
        id: "AST-002",
        employeeId: "EMP-003",
        category: "Araç",
        name: "Gezici Servis Aracı (Ford Transit)",
        identifier: "10 CLM 540",
        assignedDate: "2022-01-15",
        condition: "Aktif - Rutin Bakım Yapıldı"
    },
    {
        id: "AST-003",
        employeeId: "EMP-003",
        category: "Cihaz & Takım",
        name: "Diagnostik Arıza Tespit Cihazı & Tablet",
        identifier: "DIAG-TAB-03",
        assignedDate: "2023-05-10",
        condition: "İyi"
    }
];

// Günlük Puantaj & Zaman Kayıtları (Örnek Ay: Ekim 2026)
const INITIAL_ATTENDANCE = [
    {
        id: "ATT-001",
        employeeId: "EMP-001",
        date: "2026-10-12",
        checkIn: "07:55",
        checkOut: "18:05",
        regularHours: 9,
        overtimeHours: 0,
        status: "PRESENT",
        note: "Zamanında giriş"
    },
    {
        id: "ATT-002",
        employeeId: "EMP-001",
        date: "2026-10-13",
        checkIn: "07:50",
        checkOut: "20:30", // 2.5 saat fazla mesai
        regularHours: 9,
        overtimeHours: 2.5,
        status: "PRESENT",
        note: "Şasi kaynak yetiştirme mesaisi"
    },
    {
        id: "ATT-003",
        employeeId: "EMP-002",
        date: "2026-10-13",
        checkIn: "08:15", // 15 dk geç kalma
        checkOut: "18:00",
        regularHours: 8.75,
        overtimeHours: 0,
        status: "LATE",
        note: "Servis gecikmesi"
    },
    {
        id: "ATT-004",
        employeeId: "EMP-003",
        date: "2026-10-13",
        checkIn: "08:00",
        checkOut: "18:00",
        regularHours: 9,
        overtimeHours: 0,
        status: "FIELD_MISSION", // Sahada görevli
        note: "Bandırma Tarım Kooperatifi Balya Makinesi Devreye Alma"
    }
];

// Fazla Mesai Onay Kayıtları
const INITIAL_OVERTIMES = [
    {
        id: "OT-001",
        employeeId: "EMP-001",
        date: "2026-10-13",
        hours: 2.5,
        rateType: "WEEKDAY", // %50 zamlı
        reason: "İhracat römork şasileri kaynak tamamlama",
        status: "APPROVED",
        approvedBy: "Atölye Şefi Kemal Usta"
    },
    {
        id: "OT-002",
        employeeId: "EMP-002",
        date: "2026-10-11", // Cumartesi fabrika mesaisi
        hours: 5.0,
        rateType: "WEEKEND", // %100 zamlı
        reason: "Hafta sonu montaj hattı ek bakım/üretim",
        status: "APPROVED",
        approvedBy: "Fabrika Müdürü"
    }
];

// Saha Görevlendirmeleri (Çiftlik / Bayi arıza ve devreye alma)
const INITIAL_FIELD_MISSIONS = [
    {
        id: "MIS-001",
        employeeId: "EMP-003",
        destination: "Balıkesir Gönen - Çiftçi Mehmet Bey (Biçerdöver Tabla Ayarı)",
        startDate: "2026-10-08",
        endDate: "2026-10-09",
        days: 2,
        perDiemTotal: 1500, // 2 gün x 750 TL
        vehiclePlate: "10 CLM 540",
        status: "COMPLETED"
    },
    {
        id: "MIS-002",
        employeeId: "EMP-003",
        destination: "Bursa Yenişehir - Yetkili Bayi Personel Eğitimi",
        startDate: "2026-10-13",
        endDate: "2026-10-14",
        days: 2,
        perDiemTotal: 1500,
        vehiclePlate: "10 CLM 540",
        status: "IN_PROGRESS"
    }
];

// Avans & Kesinti Talepleri
const INITIAL_ADVANCES = [
    {
        id: "ADV-001",
        employeeId: "EMP-001",
        date: "2026-10-05",
        amount: 8000,
        reason: "Acil ev tadilatı",
        targetPeriod: "2026-10",
        status: "APPROVED"
    },
    {
        id: "ADV-002",
        employeeId: "EMP-005",
        date: "2026-10-08",
        amount: 5000,
        reason: "Kişisel ihtiyaç",
        targetPeriod: "2026-10",
        status: "APPROVED"
    }
];

// İcra ve Yasal Kesinti Kayıtları
const INITIAL_LEGAL_DEDUCTIONS = [
    {
        id: "EXE-001",
        employeeId: "EMP-005",
        icraDairesi: "Balıkesir 2. İcra Dairesi",
        dosyaNo: "2025/1420",
        totalDebt: 32000,
        remainingDebt: 21500,
        monthlyRate: 0.25, // Maaşın 1/4'ü
        status: "ACTIVE"
    }
];

/**
 * Veri Yöneticisi Sınıfı (LocalStorage & Dış Modül Senkronizasyonu)
 */
export class HRDatabase {
    constructor() {
        this.load();
    }

    load() {
        try {
            if (typeof localStorage !== 'undefined') {
                const raw = localStorage.getItem(IK_DATA_STORAGE_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    this.employees = parsed.employees || INITIAL_EMPLOYEES;
                    this.certifications = parsed.certifications || INITIAL_CERTIFICATIONS;
                    this.assets = parsed.assets || INITIAL_ASSETS;
                    this.attendance = parsed.attendance || INITIAL_ATTENDANCE;
                    this.overtimes = parsed.overtimes || INITIAL_OVERTIMES;
                    this.fieldMissions = parsed.fieldMissions || INITIAL_FIELD_MISSIONS;
                    this.advances = parsed.advances || INITIAL_ADVANCES;
                    this.legalDeductions = parsed.legalDeductions || INITIAL_LEGAL_DEDUCTIONS;
                    return;
                }
            }
        } catch (e) {
            console.warn("Veri yüklenirken hata oluştu, varsayılan veriler yükleniyor:", e);
        }
        this.resetToDefaults();
    }

    save() {
        if (typeof localStorage === 'undefined') return;
        const payload = {
            employees: this.employees,
            certifications: this.certifications,
            assets: this.assets,
            attendance: this.attendance,
            overtimes: this.overtimes,
            fieldMissions: this.fieldMissions,
            advances: this.advances,
            legalDeductions: this.legalDeductions,
            updatedAt: new Date().toISOString()
        };
        localStorage.setItem(IK_DATA_STORAGE_KEY, JSON.stringify(payload));
    }

    resetToDefaults() {
        this.employees = [...INITIAL_EMPLOYEES];
        this.certifications = [...INITIAL_CERTIFICATIONS];
        this.assets = [...INITIAL_ASSETS];
        this.attendance = [...INITIAL_ATTENDANCE];
        this.overtimes = [...INITIAL_OVERTIMES];
        this.fieldMissions = [...INITIAL_FIELD_MISSIONS];
        this.advances = [...INITIAL_ADVANCES];
        this.legalDeductions = [...INITIAL_LEGAL_DEDUCTIONS];
        this.save();
    }

    // CRUD - Personel
    addEmployee(emp) {
        if (!emp.id) emp.id = "EMP-" + String(Date.now()).slice(-4);
        if (!emp.code) emp.code = "SC-" + (100 + this.employees.length + 1);
        this.employees.push(emp);
        this.save();
        return emp;
    }

    updateEmployee(id, updatedFields) {
        const idx = this.employees.findIndex(e => e.id === id);
        if (idx !== -1) {
            this.employees[idx] = { ...this.employees[idx], ...updatedFields };
            this.save();
            return this.employees[idx];
        }
        return null;
    }

    deleteEmployee(id) {
        this.employees = this.employees.filter(e => e.id !== id);
        this.save();
    }

    // CRUD - Puantaj
    logAttendance(record) {
        if (!record.id) record.id = "ATT-" + String(Date.now()).slice(-5);
        this.attendance.push(record);
        this.save();
        return record;
    }

    // CRUD - Fazla Mesai
    addOvertime(record) {
        if (!record.id) record.id = "OT-" + String(Date.now()).slice(-5);
        this.overtimes.push(record);
        this.save();
        return record;
    }

    approveOvertime(id, approver) {
        const ot = this.overtimes.find(o => o.id === id);
        if (ot) {
            ot.status = "APPROVED";
            ot.approvedBy = approver;
            this.save();
            return ot;
        }
        return null;
    }

    // CRUD - Avans
    addAdvance(adv) {
        if (!adv.id) adv.id = "ADV-" + String(Date.now()).slice(-4);
        this.advances.push(adv);
        this.save();
        return adv;
    }

    // CRUD - Saha Görevi
    addFieldMission(mission) {
        if (!mission.id) mission.id = "MIS-" + String(Date.now()).slice(-4);
        this.fieldMissions.push(mission);
        this.save();
        return mission;
    }

    // CRUD - Sertifika
    addCertification(cert) {
        if (!cert.id) cert.id = "CERT-" + String(Date.now()).slice(-4);
        this.certifications.push(cert);
        this.save();
        return cert;
    }

    // CRUD - Zimmet
    addAsset(asset) {
        if (!asset.id) asset.id = "AST-" + String(Date.now()).slice(-4);
        this.assets.push(asset);
        this.save();
        return asset;
    }
}
