import os

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

replacements = {
    'title="Yeni Boş Senaryo Oluştur"': 'title="Yeni Dönem Ekle (Mevcut Veriyi Kopyalar)"',
    'title="Mevcut Senaryoyu Sil"': 'title="Mevcut Dönemi Sil"',
    'title="Senaryoları Kıyasla"': 'title="Dönemleri Kıyasla"',
    '<h1>Senaryo Karşılaştırma</h1>': '<h1>Dönem Karşılaştırma</h1>',
    '>Senaryo A<': '>Dönem A<',
    '>Senaryo B<': '>Dönem B<'
}

for o, n in replacements.items():
    html = html.replace(o, n)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('HTML updated.')
