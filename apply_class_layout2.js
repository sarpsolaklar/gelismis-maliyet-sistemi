const fs = require('fs');
let code = fs.readFileSync('script.js', 'utf-8');

const jsTarget = 'const elClsRevenue = document.getElementById(`cls-revenue-${cIndex}`);';
const jsNew = `const elClsCogs = document.getElementById(\`cls-cogs-\${cIndex}\`);
                if (elClsCogs) {
                    elClsCogs.textContent = formatCurrency(cls.baseTotal + clsShare + clsLaborShare + clsGUG);
                }
                const elClsRevenue = document.getElementById(\`cls-revenue-\${cIndex}\`);`;

if (code.includes(jsTarget)) {
    code = code.replace(jsTarget, jsNew);
    fs.writeFileSync('script.js', code);
    console.log('Fixed calculateDetail successfully');
} else {
    console.log('Not found string: ' + jsTarget);
}

// Remove old info manually
const lines = code.split('\n');
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Aşağıdaki yüzdelikler, giderlerin <b>Sınıf Net Maliyeti</b> içerisindeki payını gösterir')) {
        lines.splice(i-1, 3);
        fs.writeFileSync('script.js', lines.join('\n'));
        console.log('Removed old info successfully');
        break;
    }
}
