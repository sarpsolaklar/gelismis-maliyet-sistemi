const fs = require('fs');
let indexHtml = fs.readFileSync('index.html', 'utf-8');

const targetHtml = `<div class="comparison-container" style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 2rem;">`;

const newBranchFilter = `
            <div class="glass-card" style="margin-top: 2rem; padding: 1.5rem 2rem;">
                <h3 style="margin-bottom: 1rem; color: var(--text-primary); font-size: 1.1rem; display: flex; align-items: center; gap: 10px;">
                    <span class="icon">📊</span> Kıyaslanacak Şube / Ürün Grubu
                </h3>
                <select id="compareBranchSelect" class="class-input" style="width: 100%; max-width: 400px; font-size: 1rem;">
                    <option value="ALL">Tüm Fabrika (Genel Özet)</option>
                </select>
                <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 10px; opacity: 0.8;">
                    Dönem A ve Dönem B arasındaki <span style="color: var(--success); font-weight: bold;">değişim yüzdeleri</span>, seçili şubenin sonuçlarına göre sağ taraftaki (Dönem B) tabloda otomatik hesaplanır.
                </p>
            </div>

            <div class="comparison-container" style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 2rem;">`;

if (!indexHtml.includes('compareBranchSelect')) {
    indexHtml = indexHtml.replace(targetHtml, newBranchFilter);
}

indexHtml = indexHtml.replace(/script\.js\?v=\d+/, 'script.js?v=147');
fs.writeFileSync('index.html', indexHtml);
console.log('index.html updated successfully');
