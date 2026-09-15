const fs = require('fs');
const lines = fs.readFileSync('script.js', 'utf-8').split('\n');

const startIdx = lines.findIndex((l, i) => i > 1090 && l.includes('<div class="divider"></div>'));
const endIdx = lines.findIndex((l, i) => i > startIdx && l.includes('<div class="divider"></div>'));

if (startIdx === -1 || endIdx === -1) {
    console.error("Could not find boundaries");
    process.exit(1);
}

const replacement = `
                    <div class="divider"></div>

                    <div class="branch-results">
                        <div class="result-row total">
                            <span>Sınıf Toplam Satış Geliri (Ciro):</span>
                            <div style="display: flex; flex-direction: column; align-items: flex-end;">
                                <span id="cls-revenue-\${cIndex}" style="color: var(--success); font-weight: 600;">0 ₺</span>
                            </div>
                        </div>
                        
                        <div class="result-row total accordion-header" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('active')" style="margin-top: 0.5rem; border-left-color: var(--success); background: linear-gradient(90deg, rgba(16, 185, 129, 0.1) 0%, transparent 100%); align-items: flex-start; cursor: pointer;">
                            <span style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">Sınıf Brüt Kârı: <span class="chevron">▼</span></span>
                            <div style="display: flex; flex-direction: column; align-items: flex-end;">
                                <span id="cls-total-profit-\${cIndex}">0 ₺</span>
                            </div>
                        </div>
                        <div class="accordion-content">
                            <div class="result-row" style="padding-left: 1rem; margin-bottom: 0.5rem; padding-bottom: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.1);">
                                <span style="font-weight: 600; color: var(--danger);">Satılan Malın Maliyeti (SMM):</span>
                                <span id="cls-cogs-\${cIndex}" style="font-weight: 600; color: var(--danger);">0 ₺</span>
                            </div>
                            <div class="result-row" style="padding-left: 1rem;">
                                <span>Sınıf Hammadde Toplamı:</span>
                                <span id="cls-bTotal-\${cIndex}">0 ₺</span>
                            </div>
                            <div class="result-row accordion-header" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('active')" style="padding-left: 1rem; cursor: pointer;">
                                <span style="display: flex; align-items: center; gap: 8px;">Sınıf Toplam İşçilik Payı: <span class="chevron">▼</span></span>
                                <span id="cls-total-labor-\${cIndex}" style="color: var(--warning);">0 ₺</span>
                            </div>
                            <div class="accordion-content">
                                <div class="result-row" style="padding-left: 2rem;">
                                    <span>Sınıf Eşit Dağıtılan İşçilik Payı:</span>
                                    <span id="cls-share-\${cIndex}" style="color: var(--warning);">0 ₺</span>
                                </div>
                                <div class="result-row" style="padding-left: 2rem;">
                                    <span>Sınıf Direkt İşçilik Maliyeti:</span>
                                    <span id="cls-labor-share-\${cIndex}" style="color: var(--warning);">0 ₺</span>
                                </div>
                            </div>
                            <div class="result-row" style="padding-left: 1rem;">
                                <span>Sınıf Genel Üretim Gideri Payı:</span>
                                <span id="cls-gug-\${cIndex}" style="color: var(--accent-4);">0 ₺</span>
                            </div>
                        </div>

                        <div class="result-row total accordion-header" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('active')" style="margin-top: 0.5rem; border-left-color: var(--accent-1); background: linear-gradient(90deg, rgba(56, 189, 248, 0.1) 0%, transparent 100%); align-items: flex-start; cursor: pointer;">
                            <span style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">Sınıf Faaliyet Kârı: <span class="chevron">▼</span></span>
                            <div style="display: flex; flex-direction: column; align-items: flex-end;">
                                <span id="cls-faaliyet-kar-\${cIndex}">0 ₺</span>
                            </div>
                        </div>
                        <div class="accordion-content">
                            <div class="result-row" style="padding-left: 1rem;">
                                <span>Sınıf Pazarlama Gideri Payı:</span>
                                <span id="cls-paz-\${cIndex}" style="color: var(--accent-1);">0 ₺</span>
                            </div>
                            <div class="result-row" style="padding-left: 1rem;">
                                <span>Sınıf Genel Yönetim Gideri Payı:</span>
                                <span id="cls-yonetim-\${cIndex}" style="color: var(--accent-1);">0 ₺</span>
                            </div>
                            <div class="result-row" style="padding-left: 1rem;">
                                <span>Sınıf AR-GE Gideri Payı:</span>
                                <span id="cls-arge-\${cIndex}" style="color: var(--accent-1);">0 ₺</span>
                            </div>
                        </div>

                        <div class="result-row total accordion-header open" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('active')" style="margin-top: 1rem; border-left-color: #8b5cf6; background: linear-gradient(90deg, rgba(139, 92, 246, 0.1) 0%, transparent 100%); align-items: flex-start; cursor: pointer;">
                            <span style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">Sınıf Net Kârı: <span class="chevron">▼</span></span>
                            <div style="display: flex; flex-direction: column; align-items: flex-end;">
                                <span id="cls-net-kar-\${cIndex}" style="font-weight: 800;">0 ₺</span>
                            </div>
                        </div>
                        <div class="accordion-content active">
                            <div class="result-row" style="padding-left: 1rem;">
                                <span>Sınıf Finansman (Gelir/Gider) Payı:</span>
                                <span id="cls-finansman-\${cIndex}">0 ₺</span>
                            </div>
                        </div>

                        <div class="result-row total" style="background: linear-gradient(90deg, rgba(236, 72, 153, 0.1) 0%, transparent 100%); border-left-color: var(--accent-2); align-items: flex-start; margin-top: 1rem; margin-bottom: 2rem;">
                            <span style="margin-top: 4px;">Sınıf Net Maliyeti:</span>
                            <div style="display: flex; flex-direction: column; align-items: flex-end;">
                                <span id="cls-net-\${cIndex}">0 ₺</span>
                            </div>
                        </div>
                    </div>
`;

lines.splice(startIdx, endIdx - startIdx, replacement);
let newCode = lines.join('\n');

fs.writeFileSync('script.js', newCode);
console.log('Class html updated successfully!');
