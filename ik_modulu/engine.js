/**
 * Tarım Makineleri Fabrikası İK & Maaş Hesaplama Motoru (Payroll & Operations Engine)
 * 
 * Standart Fabrika Kuralları:
 * - Aylık yasal çalışma esası: 225 Saat
 * - Saatlik Ücret = Taban Maaş / 225
 * - Hafta İçi Fazla Mesai = Saatlik Ücret * Saat * 1.5
 * - Hafta Sonu / Resmi Tatil Mesaisi = Saatlik Ücret * Saat * 2.0
 * - Saha Görevi Günlük Harcırahı = Gün * 750 TL
 * - Yasal İcra Kesintisi Sınırı = Net Ele Geçen Tutarın 1/4'ü (Borç bitene kadar)
 */

import { FACTORY_WORK_CONFIG } from './data.js';

export class HREngine {
    constructor(db) {
        this.db = db;
    }

    /**
     * Saatlik ücreti hesaplar (Türk İş Kanunu standart 225 saat kabulü)
     */
    calculateHourlyRate(baseSalary) {
        if (!baseSalary || baseSalary <= 0) return 0;
        return Number((baseSalary / 225).toFixed(2));
    }

    /**
     * Belirli bir ay ve çalışan için fazla mesai hakedişini hesaplar
     */
    calculateEmployeeOvertime(employeeId, periodPrefix = "2026-10") {
        const emp = this.db.employees.find(e => e.id === employeeId);
        if (!emp) return { hoursTotal: 0, amountTotal: 0, details: [] };

        const hourlyRate = this.calculateHourlyRate(emp.baseSalary);
        const approvedOvertimes = this.db.overtimes.filter(ot => 
            ot.employeeId === employeeId &&
            ot.status === "APPROVED" &&
            ot.date.startsWith(periodPrefix)
        );

        let totalPay = 0;
        let totalHours = 0;

        const details = approvedOvertimes.map(ot => {
            const multiplier = ot.rateType === "WEEKEND" ? FACTORY_WORK_CONFIG.weekendOvertimeRate : FACTORY_WORK_CONFIG.weekdayOvertimeRate;
            const itemPay = Number((ot.hours * hourlyRate * multiplier).toFixed(2));
            totalPay += itemPay;
            totalHours += Number(ot.hours);
            return {
                ...ot,
                hourlyRate,
                multiplier,
                totalPay: itemPay
            };
        });

        return {
            hoursTotal: totalHours,
            amountTotal: Number(totalPay.toFixed(2)),
            details
        };
    }

    /**
     * Saha görevlendirme (harcırah) tutarını hesaplar
     */
    calculateEmployeePerDiem(employeeId, periodPrefix = "2026-10") {
        const missions = this.db.fieldMissions.filter(m => 
            m.employeeId === employeeId && 
            m.startDate.startsWith(periodPrefix)
        );

        let totalDays = 0;
        let totalAmount = 0;

        missions.forEach(m => {
            totalDays += Number(m.days);
            totalAmount += Number(m.perDiemTotal);
        });

        return {
            daysTotal: totalDays,
            amountTotal: totalAmount,
            missions
        };
    }

    /**
     * Belirli bir ay için çalışanın aldığı avans toplamını hesaplar
     */
    calculateEmployeeAdvances(employeeId, period = "2026-10") {
        const approvedAdvances = this.db.advances.filter(adv => 
            adv.employeeId === employeeId && 
            adv.targetPeriod === period &&
            adv.status === "APPROVED"
        );

        const totalAdvance = approvedAdvances.reduce((sum, item) => sum + Number(item.amount), 0);
        return {
            totalAdvance,
            advances: approvedAdvances
        };
    }

    /**
     * Varsa icra kesintisini hesaplar
     */
    calculateLegalExecutionCut(employeeId, subtotalEarned) {
        const activeExecution = this.db.legalDeductions.find(leg => 
            leg.employeeId === employeeId && leg.status === "ACTIVE" && leg.remainingDebt > 0
        );

        if (!activeExecution) return { executionCut: 0, executionRecord: null };

        // Yasal 1/4 sınırı
        const maxCut = subtotalEarned * (activeExecution.monthlyRate || 0.25);
        const actualCut = Math.min(maxCut, activeExecution.remainingDebt);

        return {
            executionCut: Number(actualCut.toFixed(2)),
            executionRecord: activeExecution
        };
    }

    /**
     * Belirli bir ay için tek bir çalışanın bordrosunu çıkarır
     */
    calculateEmployeePayroll(employeeId, period = "2026-10") {
        const emp = this.db.employees.find(e => e.id === employeeId);
        if (!emp) return null;

        const baseSalary = Number(emp.baseSalary) || 0;
        const hourlyRate = this.calculateHourlyRate(baseSalary);

        // 1. Fazla Mesai
        const overtimeData = this.calculateEmployeeOvertime(employeeId, period);

        // 2. Saha Harcırahı
        const perDiemData = this.calculateEmployeePerDiem(employeeId, period);

        // 3. Sosyal Yardımlar & Ek Haklar
        const allowances = emp.allowances || {};
        const foodAllowance = Number(allowances.food) || 0;
        const roadAllowance = Number(allowances.road) || 0;
        const childAllowance = Number(allowances.child) || 0;
        const totalAllowances = foodAllowance + roadAllowance + childAllowance;

        // Toplam Hakediş (Brüt/Net Ele Geçen Ham Tutar)
        const totalEarnings = baseSalary + overtimeData.amountTotal + perDiemData.amountTotal + totalAllowances;

        // 4. Avans Kesintisi
        const advanceData = this.calculateEmployeeAdvances(employeeId, period);

        // 5. İcra Kesintisi (Avans düşülmeden önceki hakedişin 1/4'ü baz alınabilir)
        const executionData = this.calculateLegalExecutionCut(employeeId, totalEarnings);

        // 6. Net Ödenecek Maaş Tutarı
        const totalDeductions = advanceData.totalAdvance + executionData.executionCut;
        const netPayout = Math.max(0, totalEarnings - totalDeductions);

        return {
            period,
            employee: emp,
            hourlyRate,
            earnings: {
                baseSalary,
                overtimePay: overtimeData.amountTotal,
                overtimeHours: overtimeData.hoursTotal,
                perDiemPay: perDiemData.amountTotal,
                perDiemDays: perDiemData.daysTotal,
                foodAllowance,
                roadAllowance,
                childAllowance,
                totalAllowances,
                totalGross: totalEarnings
            },
            deductions: {
                advanceCut: advanceData.totalAdvance,
                executionCut: executionData.executionCut,
                totalDeductions
            },
            netPayout: Number(netPayout.toFixed(2)),
            details: {
                overtimeDetails: overtimeData.details,
                advanceDetails: advanceData.advances,
                executionRecord: executionData.executionRecord
            }
        };
    }

    /**
     * Tüm aktif fabrika personeli için toplu aylık bordro tablosu oluşturur
     */
    generateFullFactoryPayroll(period = "2026-10") {
        const list = this.db.employees
            .filter(e => e.status === "ACTIVE")
            .map(emp => this.calculateEmployeePayroll(emp.id, period));

        const summary = list.reduce((acc, curr) => {
            acc.totalBaseSalary += curr.earnings.baseSalary;
            acc.totalOvertimePay += curr.earnings.overtimePay;
            acc.totalPerDiemPay += curr.earnings.perDiemPay;
            acc.totalAllowances += curr.earnings.totalAllowances;
            acc.totalAdvances += curr.deductions.advanceCut;
            acc.totalExecutionCuts += curr.deductions.executionCut;
            acc.totalNetPayout += curr.netPayout;
            acc.employeeCount += 1;
            return acc;
        }, {
            period,
            employeeCount: 0,
            totalBaseSalary: 0,
            totalOvertimePay: 0,
            totalPerDiemPay: 0,
            totalAllowances: 0,
            totalAdvances: 0,
            totalExecutionCuts: 0,
            totalNetPayout: 0
        });

        return {
            summary,
            payrolls: list
        };
    }

    /**
     * Banka Maaş Ödeme Listesi Çıktısı (Excel / CSV uyumlu)
     */
    exportBankTransferList(period = "2026-10") {
        const full = this.generateFullFactoryPayroll(period);
        const headers = ["Sıra", "Sicil No", "Adı Soyadı", "T.C. Kimlik No", "IBAN", "Ödenecek Net Tutar (TL)", "Açıklama"];
        
        const rows = full.payrolls.map((p, index) => [
            index + 1,
            p.employee.code,
            `${p.employee.firstName} ${p.employee.lastName}`,
            p.employee.tcNo,
            p.employee.iban,
            p.netPayout.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            `Celmak Fabrika ${period} Dönemi Maaş Ödemesi`
        ]);

        return {
            headers,
            rows,
            totalAmount: full.summary.totalNetPayout
        };
    }

    /**
     * Diğer sistemlerle entegrasyon için JSON veri paketi üretir
     */
    exportERPAccountingPayload(period = "2026-10") {
        const full = this.generateFullFactoryPayroll(period);
        
        // Mavi Yaka (720 Direkt İşçilik), Saha/SSH (760 Pazarlama/Satış Dağıtım), Yönetim/Arge (770 Genel Yönetim) ayrımı
        let directLabor720 = 0;
        let salesSSH760 = 0;
        let admin770 = 0;

        full.payrolls.forEach(p => {
            const cost = p.earnings.totalGross;
            if (p.employee.category === "BLUE_COLLAR") {
                directLabor720 += cost;
            } else if (p.employee.category === "FIELD_TECH") {
                salesSSH760 += cost;
            } else {
                admin770 += cost;
            }
        });

        return {
            documentType: "IK_MAHSUP_FISI",
            period,
            currency: "TRY",
            totalCost: directLabor720 + salesSSH760 + admin770,
            costCenters: {
                "720_DIREKT_ISCI_GIDERLERI": Number(directLabor720.toFixed(2)),
                "760_PAZARLAMA_SATIS_SERVIS_GIDERLERI": Number(salesSSH760.toFixed(2)),
                "770_GENEL_YONETIM_ARGE_GIDERLERI": Number(admin770.toFixed(2))
            },
            liabilities: {
                "335_PERSONELE_BORCLAR_NET": Number(full.summary.totalNetPayout.toFixed(2)),
                "196_VERILEN_PERSONEL_AVANSLARI": Number(full.summary.totalAdvances.toFixed(2)),
                "336_DIGER_CESITLI_BORCLAR_ICRA": Number(full.summary.totalExecutionCuts.toFixed(2))
            },
            generatedAt: new Date().toISOString()
        };
    }
}
