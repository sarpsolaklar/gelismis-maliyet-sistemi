const fs = require('fs');
let code = fs.readFileSync('script.js', 'utf-8');

// 1. Add `smm` to currentTotals in renderCompareResults
const currentTotalsStr = 'const currentTotals = {';
const currentTotalsReplacement = `
        const smm = totalHammadde + totalIscilik + totalGUG;
        const currentTotals = {
            smm, `;
code = code.replace(currentTotalsStr, currentTotalsReplacement);

// 2. Add SMM row in renderCompareResults accordion
const compareAccordionStr = `<div class="accordion-content">
                <div class="result-row" style="padding-left: 1rem;">
                    <span>Hammadde Toplamı:</span>`;
const compareAccordionReplacement = `<div class="accordion-content">
                <div class="result-row" style="padding-left: 1rem; margin-bottom: 0.5rem; padding-bottom: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <span style="font-weight: 600; color: var(--danger);">Satılan Malın Maliyeti (SMM):</span>
                    <span style="font-weight: 600; color: var(--danger); display: flex; align-items: center;">\${formatCurrency(smm)} \${varHtml('smm', true)}</span>
                </div>
                <div class="result-row" style="padding-left: 1rem;">
                    <span>Hammadde Toplamı:</span>`;
code = code.replace(compareAccordionStr, compareAccordionReplacement);

// 3. Add SMM row in renderFactorySummary accordion
const factoryAccordionStr = `<div class="accordion-content">
                <div class="result-row" style="padding-left: 1rem;">
                    <span>Fabrika Hammadde Toplamı:</span>`;
const factoryAccordionReplacement = `<div class="accordion-content">
                <div class="result-row" style="padding-left: 1rem; margin-bottom: 0.5rem; padding-bottom: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <span style="font-weight: 600; color: var(--danger);">Satılan Malın Maliyeti (SMM):</span>
                    <span style="font-weight: 600; color: var(--danger);">\${formatCurrency(totalHammadde + totalIscilik + totalGUG)}</span>
                </div>
                <div class="result-row" style="padding-left: 1rem;">
                    <span>Fabrika Hammadde Toplamı:</span>`;
code = code.replace(factoryAccordionStr, factoryAccordionReplacement);

fs.writeFileSync('script.js', code);
console.log('script.js updated with SMM logic!');
