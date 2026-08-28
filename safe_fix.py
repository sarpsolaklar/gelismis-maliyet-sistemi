with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

target = """        const elNetCost = document.getElementById('globalNetCost');
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
        }"""

replacement = """        // Update the new branch summary widgets
        const elBranchCount = document.getElementById('totalBranchCountWidget');
        if (elBranchCount) elBranchCount.textContent = branchData.length + ' Adet';
        
        let totalClassCount = 0;
        branchData.forEach(branch => {
            totalClassCount += (branch.subClasses && branch.subClasses.length) ? branch.subClasses.length : 0;
        });
        
        const elClassCount = document.getElementById('totalClassCountWidget');
        if (elClassCount) elClassCount.textContent = totalClassCount + ' Adet';"""

content = content.replace(target, replacement)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
