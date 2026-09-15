import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

rename_btn = """<button id="btnRenameScenario" class="btn-scenario-add" style="background: var(--bg-card); color: var(--text-muted); border: 1px solid var(--border-color);" title="Mevcut Dönemin Adını Değiştir">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/></svg>
                    </button>"""

html = html.replace('id="btnDeleteScenario"', rename_btn + '\n                    <button id="btnDeleteScenario"')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
