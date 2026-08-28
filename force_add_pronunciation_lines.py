import re

with open('script.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

start = -1
end = -1
for i, line in enumerate(lines):
    if "const html = `" in line and "const netMaliyet = globalNetTotal;" in lines[i-3]:
        start = i
    if start != -1 and "</div>" in line and "document.getElementById('factorySummaryResults').innerHTML = html;" in lines[i+2]:
        end = i
        break

if start != -1 and end != -1:
    print(f"Found block from {start} to {end}")
    
    new_block = [
        '          const netMaliyetText = numberToTurkishText(netMaliyet);\n',
        '          const netKarText = (netKar < 0 ? "Eksi " : "") + numberToTurkishText(Math.abs(netKar));\n',
        '          const faaliyetKariText = (faaliyetKari < 0 ? "Eksi " : "") + numberToTurkishText(Math.abs(faaliyetKari));\n',
        '          const brutKarText = (brutKar < 0 ? "Eksi " : "") + numberToTurkishText(Math.abs(brutKar));\n',
        '\n',
        '          const html = `\n',
        '              <div class="result-row total" style="background: linear-gradient(90deg, rgba(236, 72, 153, 0.1) 0%, transparent 100%); border-left-color: var(--accent-2); align-items: flex-start;">\n',
        '                  <span style="margin-top: 4px;">Fabrika Net Maliyeti:</span>\n',
        '                  <div style="display: flex; flex-direction: column; align-items: flex-end;">\n',
        '                      <span>${formatCurrency(netMaliyet)}</span>\n',
        '                      <span style="font-size: 0.75rem; color: var(--text-secondary); opacity: 0.8; font-weight: normal; margin-top: 2px;">(${netMaliyetText})</span>\n',
        '                  </div>\n',
        '              </div>\n',
        '              <div class="result-row total accordion-header open" onclick="this.classList.toggle(\'open\'); this.nextElementSibling.classList.toggle(\'active\')" style="margin-top: 1rem; border-left-color: #8b5cf6; background: linear-gradient(90deg, rgba(139, 92, 246, 0.1) 0%, transparent 100%); align-items: flex-start;">\n',
        '                  <span style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">Fabrika Net Kâr: <span class="chevron">▼</span></span>\n',
        '                  <div style="display: flex; flex-direction: column; align-items: flex-end;">\n',
        '                      <span style="color: ${netKar >= 0 ? \'var(--success)\' : \'var(--danger)\'};">${formatWithPercent(netKar, netMaliyet)}</span>\n',
        '                      <span style="font-size: 0.75rem; color: var(--text-secondary); opacity: 0.8; font-weight: normal; margin-top: 2px;">(${netKarText})</span>\n',
        '                  </div>\n',
        '              </div>\n',
        '              <div class="accordion-content active">\n',
        '                  <div class="result-row total" style="margin-top: 0.5rem; border-left-color: var(--accent-1); background: linear-gradient(90deg, rgba(56, 189, 248, 0.1) 0%, transparent 100%); align-items: flex-start;">\n',
        '                      <span style="margin-top: 4px;">Fabrika Faaliyet Kârı:</span>\n',
        '                      <div style="display: flex; flex-direction: column; align-items: flex-end;">\n',
        '                          <span style="color: ${faaliyetKari >= 0 ? \'var(--success)\' : \'var(--danger)\'};">${formatWithPercent(faaliyetKari, netMaliyet)}</span>\n',
        '                          <span style="font-size: 0.75rem; color: var(--text-secondary); opacity: 0.8; font-weight: normal; margin-top: 2px;">(${faaliyetKariText})</span>\n',
        '                      </div>\n',
        '                  </div>\n',
        '                  <div class="result-row total" style="margin-top: 0.5rem; border-left-color: var(--success); background: linear-gradient(90deg, rgba(16, 185, 129, 0.1) 0%, transparent 100%); align-items: flex-start;">\n',
        '                      <span style="margin-top: 4px;">Fabrika Brüt Kâr:</span>\n',
        '                      <div style="display: flex; flex-direction: column; align-items: flex-end;">\n',
        '                          <span style="color: ${brutKar >= 0 ? \'var(--success)\' : \'var(--danger)\'};">${formatWithPercent(brutKar, netMaliyet)}</span>\n',
        '                          <span style="font-size: 0.75rem; color: var(--text-secondary); opacity: 0.8; font-weight: normal; margin-top: 2px;">(${brutKarText})</span>\n',
        '                      </div>\n',
        '                  </div>\n',
        '              </div>\n'
    ]
    
    lines = lines[:start] + new_block + lines[end+1:]
    
    with open('script.js', 'w', encoding='utf-8') as f:
        f.writelines(lines)
else:
    print("Failed to find block!")
