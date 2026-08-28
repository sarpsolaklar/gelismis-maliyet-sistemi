import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Define the old block with re.sub to avoid encoding issues with ▼
pattern = r"const html = `\s*<div class=\"result-row total\" style=\"background: linear-gradient.*?</div>\s*</div>`"

new_block = r"""const netMaliyetText = numberToTurkishText(netMaliyet);
          const netKarText = (netKar < 0 ? "Eksi " : "") + numberToTurkishText(Math.abs(netKar));
          const faaliyetKariText = (faaliyetKari < 0 ? "Eksi " : "") + numberToTurkishText(Math.abs(faaliyetKari));
          const brutKarText = (brutKar < 0 ? "Eksi " : "") + numberToTurkishText(Math.abs(brutKar));

          const html = `
              <div class="result-row total" style="background: linear-gradient(90deg, rgba(236, 72, 153, 0.1) 0%, transparent 100%); border-left-color: var(--accent-2); align-items: flex-start;">
                  <span style="margin-top: 4px;">Fabrika Net Maliyeti:</span>
                  <div style="display: flex; flex-direction: column; align-items: flex-end;">
                      <span>${formatCurrency(netMaliyet)}</span>
                      <span style="font-size: 0.75rem; color: var(--text-secondary); opacity: 0.8; font-weight: normal; margin-top: 2px;">(${netMaliyetText})</span>
                  </div>
              </div>
              <div class="result-row total accordion-header open" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('active')" style="margin-top: 1rem; border-left-color: #8b5cf6; background: linear-gradient(90deg, rgba(139, 92, 246, 0.1) 0%, transparent 100%); align-items: flex-start;">
                  <span style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">Fabrika Net Kâr: <span class="chevron">▼</span></span>
                  <div style="display: flex; flex-direction: column; align-items: flex-end;">
                      <span style="color: ${netKar >= 0 ? 'var(--success)' : 'var(--danger)'};">${formatWithPercent(netKar, netMaliyet)}</span>
                      <span style="font-size: 0.75rem; color: var(--text-secondary); opacity: 0.8; font-weight: normal; margin-top: 2px;">(${netKarText})</span>
                  </div>
              </div>
              <div class="accordion-content active">
                  <div class="result-row total" style="margin-top: 0.5rem; border-left-color: var(--accent-1); background: linear-gradient(90deg, rgba(56, 189, 248, 0.1) 0%, transparent 100%); align-items: flex-start;">
                      <span style="margin-top: 4px;">Fabrika Faaliyet Kârı:</span>
                      <div style="display: flex; flex-direction: column; align-items: flex-end;">
                          <span style="color: ${faaliyetKari >= 0 ? 'var(--success)' : 'var(--danger)'};">${formatWithPercent(faaliyetKari, netMaliyet)}</span>
                          <span style="font-size: 0.75rem; color: var(--text-secondary); opacity: 0.8; font-weight: normal; margin-top: 2px;">(${faaliyetKariText})</span>
                      </div>
                  </div>
                  <div class="result-row total" style="margin-top: 0.5rem; border-left-color: var(--success); background: linear-gradient(90deg, rgba(16, 185, 129, 0.1) 0%, transparent 100%); align-items: flex-start;">
                      <span style="margin-top: 4px;">Fabrika Brüt Kâr:</span>
                      <div style="display: flex; flex-direction: column; align-items: flex-end;">
                          <span style="color: ${brutKar >= 0 ? 'var(--success)' : 'var(--danger)'};">${formatWithPercent(brutKar, netMaliyet)}</span>
                          <span style="font-size: 0.75rem; color: var(--text-secondary); opacity: 0.8; font-weight: normal; margin-top: 2px;">(${brutKarText})</span>
                      </div>
                  </div>
              </div>`"""

content = re.sub(pattern, new_block, content, flags=re.DOTALL)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
