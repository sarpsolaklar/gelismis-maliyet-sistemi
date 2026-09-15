const fs = require('fs');
let code = fs.readFileSync('script.js', 'utf-8');

const lines = code.split('\n');
let replaced = false;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('<span>Fabrika Hammadde Toplamı:</span>') && lines[i-1].includes('<div class="result-row"') && lines[i-2].includes('<div class="accordion-content">')) {
        const replacement = `
<div class="result-row" style="padding-left: 1rem; margin-bottom: 0.5rem; padding-bottom: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.1);">
    <span style="font-weight: 600; color: var(--danger);">Satılan Malın Maliyeti (SMM):</span>
    <span style="font-weight: 600; color: var(--danger);">\${formatCurrency(totalHammadde + totalIscilik + totalGUG)}</span>
</div>`;
        lines.splice(i-1, 0, replacement);
        replaced = true;
        break;
    }
}

if (replaced) {
    fs.writeFileSync('script.js', lines.join('\n'));
    console.log('Successfully added SMM to Fabrika Ozeti');
} else {
    console.log('Could not find injection point');
}
