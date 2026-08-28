import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find: <div class="branch-results">\n                      <div class="result-row unit accordion-header" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('active')">
# And insert the Hammadde row before the accordion header!

pattern = r'(<div class="branch-results">\s*<div class="result-row unit accordion-header" onclick="this\.classList\.toggle\(\'open\'\); this\.nextElementSibling\.classList\.toggle\(\'active\'\)">)'

replacement = r"""<div class="branch-results">
                      <div class="result-row unit">
                          <span>1 Adet Makine Hammadde Toplamı:</span>
                          <span id="cls-unit-base-${cIndex}" style="color: var(--text-primary);">0 ₺</span>
                      </div>
                      <div class="result-row unit accordion-header" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('active')">"""

content = re.sub(pattern, replacement, content)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
