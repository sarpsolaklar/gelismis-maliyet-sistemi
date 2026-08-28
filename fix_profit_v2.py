import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# We need to move `const clsTotalProfit = clsProfit * cls.quantity;` above `const elClsFaaliyetKar`.
# Let's find:
old_str = """                  const elClsFaaliyet = document.getElementById(`cls-faaliyet-${cIndex}`);
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
                  
                  const clsTotalProfit = clsProfit * cls.quantity;"""

new_str = """                  const elClsFaaliyet = document.getElementById(`cls-faaliyet-${cIndex}`);
                  if (elClsFaaliyet) elClsFaaliyet.textContent = formatCurrency(clsPazarlama + clsYonetim + clsArge);
                  
                  const clsTotalProfit = clsProfit * cls.quantity;

                  const elClsFaaliyetKar = document.getElementById(`cls-faaliyet-kar-${cIndex}`);
                  if (elClsFaaliyetKar) {
                      const faaliyetKari = clsTotalProfit - (clsPazarlama + clsYonetim + clsArge);
                      elClsFaaliyetKar.textContent = formatCurrency(faaliyetKari);
                      elClsFaaliyetKar.style.color = faaliyetKari >= 0 ? "var(--success)" : "var(--danger)";
                  }
                  const elClsNetKar = document.getElementById(`cls-net-kar-${cIndex}`);
                  if (elClsNetKar) {
                      const netKari = clsTotalProfit - (clsPazarlama + clsYonetim + clsArge) - clsFinansman;
                      elClsNetKar.textContent = formatCurrency(netKari);
                      elClsNetKar.style.color = netKari >= 0 ? "var(--success)" : "var(--danger)";
                  }
                  document.getElementById(`cls-net-${cIndex}`).textContent = formatCurrency(clsNet);"""

content = content.replace(old_str, new_str)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
