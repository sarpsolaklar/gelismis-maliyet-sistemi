import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the "Sistem Toplam Maliyeti" widget
pattern1 = r'(<div class="metric-widget">\s*<div class="metric-icon" style="background: rgba\(244, 63, 94, 0\.2\); color: #f43f5e;">\s*<svg width="20" height="20" viewBox="0 0 24 24".*?</svg>\s*</div>\s*<span class="metric-title">Sistem Toplam Maliyeti.*?</span>\s*<span class="metric-value grand-total" id="globalNetCost">.*?</span>\s*</div>)'

replacement1 = r'''<div class="metric-widget">
                                <div class="metric-icon" style="background: rgba(244, 63, 94, 0.2); color: #f43f5e;">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
                                </div>
                                <span class="metric-title">Toplam Şube Sayısı</span>
                                <span class="metric-value" id="totalBranchCountWidget">0 Adet</span>
                            </div>'''

content = re.sub(pattern1, replacement1, content, flags=re.DOTALL)

# Replace the "Sistem Toplam Brüt Kârı" widget
pattern2 = r'(<div class="metric-widget" style="grid-column: span 2;">\s*<div class="metric-icon" style="background: rgba\(16, 185, 129, 0\.2\); color: #10b981;">\s*<svg width="20" height="20" viewBox="0 0 24 24".*?</svg>\s*</div>\s*<span class="metric-title">Sistem Toplam Brüt Kârı.*?</span>\s*<span class="metric-value grand-total".*?</span>\s*</div>)'

replacement2 = r'''<div class="metric-widget" style="grid-column: span 2;">
                                <div class="metric-icon" style="background: rgba(16, 185, 129, 0.2); color: #10b981;">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                                </div>
                                <span class="metric-title">Toplam Sınıf Sayısı</span>
                                <span class="metric-value" id="totalClassCountWidget">0 Adet</span>
                            </div>'''

content = re.sub(pattern2, replacement2, content, flags=re.DOTALL)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
