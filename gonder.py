import pandas as pd
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formatdate, make_msgid, formataddr
import time

# --- AYARLAR (BURAYI KENDİ BİLGİLERİNİZE GÖRE DOLDURUN) ---
SMTP_SERVER = "mail.altikodtech.com.tr"  # Örn: Yandex için smtp.yandex.com, Kurumsal için mail.site.com
SMTP_PORT = 465                 # Genelde TLS için 587 (veya SSL için 465)
SMTP_EMAIL = "altikodtech" # Sunucuya giriş yaparken kullandığınız kullanıcı adı
SMTP_PASSWORD = "eEJcK0FLjuuFsbk" # Mail şifreniz

GONDEREN_AD = "Altıkod Digital Solutions" # E-posta gönderen ismi
GONDEREN_EMAIL = "altikodtech@altikodtech.com.tr" # Karşı tarafın göreceği asıl e-posta adresiniz
KONU = "Mağazanızda Bir Şey Eksik!"       # Gönderilecek e-postanın konusu

EXCEL_DOSYASI = "mail_olanlar.xlsx"

SABLON_1 = "altikod-chatbot-eposta-sablonu.html"
SABLON_2 = "altikod-ucretsiz-deneme-eposta-sablonu.html"
# --------------------------------------------------------

def mail_gonder():
    print("=== ŞABLON SEÇİMİ ===")
    print("1: Standart Şablon (altikod-chatbot-eposta-sablonu.html)")
    print("2: Ücretsiz Deneme Şablonu (altikod-ucretsiz-deneme-eposta-sablonu.html)")
    secim = input("Hangi şablonu kullanmak istersiniz? (1 veya 2): ").strip()
    
    secilen_sablon = SABLON_2 if secim == "2" else SABLON_1
    secilen_konu = KONU # İsterseniz 2. şablon için farklı bir konu ekleyebilirsiniz.

    print("\n=== LİSTE SEÇİMİ ===")
    print("1: Asıl Liste (ticimax_chatbot_dijital_asistan_olmayan_siteler_epostali.xlsx)")
    print("2: Deneme Listesi (deneme.xlsx)")
    liste_secim = input("Hangi listeye göndermek istersiniz? (1 veya 2): ").strip()
    secilen_excel = "deneme.xlsx" if liste_secim == "2" else EXCEL_DOSYASI

    print(f"\n1. HTML Şablonu ({secilen_sablon}) okunuyor...")
    try:
        with open(secilen_sablon, 'r', encoding='utf-8') as f:
            html_icerik = f.read()
    except Exception as e:
        print(f"Şablon okuma hatası: {e}")
        return

    print(f"2. Excel dosyası ({secilen_excel}) okunuyor...")
    df = pd.read_excel(secilen_excel)
    
    # E-posta sütunu kontrolü
    if 'E-posta' not in df.columns:
        print("\nHATA: Excel dosyasında 'E-posta' isimli bir sütun bulunamadı!")
        print("Lütfen maillerin kime gideceğini belirten 'E-posta' adında yeni bir sütun ekleyin.")
        return

    print("3. Mail sunucusuna bağlanılıyor...")
    try:
        if SMTP_PORT == 465:
            server = smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT)
        else:
            server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
            server.starttls() # Güvenli bağlantı başlatır
        
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        print("-> Sunucu bağlantısı başarılı!\n")
    except Exception as e:
        print(f"Bağlantı hatası: {e}\nLütfen Ayarlar kısmındaki sunucu/şifre bilgilerinizi kontrol edin.")
        return

    basarili = 0
    hatali = 0
    gonderilen_batch = 0

    # "Durum" sütunu yoksa oluştur
    if 'Durum' not in df.columns:
        df['Durum'] = ""

    print("--- GÖNDERİM BAŞLIYOR ---")
    for index, row in df.iterrows():
        durum = str(row.get('Durum', '')).strip()
        if durum == 'Gönderildi':
            continue

        alici_email = str(row.get('E-posta', '')).strip()
        marka = str(row.get('Marka', '')).strip()
        site = str(row.get('Site', '')).strip()
        
        # 'https://' ve 'http://' kısımlarını temizle, sondaki '/' işaretini sil
        site_temiz = site.replace("https://", "").replace("http://", "").rstrip("/")
        
        # E-posta satırı boşsa gönderimi atla
        if not alici_email or alici_email.lower() == 'nan':
            continue

        # Marka '-' veya 'NaN' ise daha iyi görünmesi için düzelt
        if marka.lower() == 'nan' or marka == '-':
            marka = 'Değerli'
            
        # URL'nin Gmail tarafından otomatik mavi yapılmasını engellemek için görünmez bir a etiketi içine alıyoruz
        # (Böylece bulunduğu yerin rengini otomatik alır - üstte kırmızı, altta gri)
        site_html = f'<a href="https://{site_temiz}" style="color:inherit; text-decoration:none;">{site_temiz}</a>'
            
        # Önce HTML linklerinin içindeki (href vs.) Site parametrelerini temiz (saf) URL ile değiştir
        kisisel_html = html_icerik.replace("ref={{Site}}", f"ref={site_temiz}")
        
        # Sonra geriye kalan (metin içindeki) tüm {{Site}} etiketlerini gizli a etiketi ile değiştir
        kisisel_html = kisisel_html.replace("{{Marka}}", marka).replace("{{Site}}", site_html)

        # Mail mesajını oluştur
        msg = MIMEMultipart()
        # formataddr kullanarak gönderen adı (Türkçe karakterli) ile e-posta adresini doğru ayırıyoruz
        msg['From'] = formataddr((GONDEREN_AD, GONDEREN_EMAIL))
        msg['To'] = alici_email
        msg['Subject'] = secilen_konu
        
        # Spam filtrelerini geçmek için gerekli güvenlik/kimlik etiketleri
        msg['Date'] = formatdate(localtime=True)
        msg['Message-ID'] = make_msgid(domain="altikodtech.com.tr")
        msg['Reply-To'] = GONDEREN_EMAIL
        
        msg.attach(MIMEText(kisisel_html, 'html'))

        try:
            server.send_message(msg)
            print(f"[{index+1}] GÖNDERİLDİ: {alici_email} (Marka: {marka})")
            
            # Excel'de durumu güncelle ve kaydet
            df.at[index, 'Durum'] = 'Gönderildi'
            df.to_excel(EXCEL_DOSYASI, index=False)
            
            basarili += 1
            gonderilen_batch += 1
            
            if gonderilen_batch == 10:
                print("\n[!] 10 adet mail gönderildi. Spam filtrelerini atlatmak için 31 dakika bekleniyor...")
                server.quit()
                time.sleep(31 * 60) # 31 dakika bekle
                gonderilen_batch = 0
                print("\n[!] Süre doldu, sonraki 10 mail için sunucuya yeniden bağlanılıyor...")
                
                if SMTP_PORT == 465:
                    server = smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT)
                else:
                    server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
                    server.starttls()
                server.login(SMTP_EMAIL, SMTP_PASSWORD)
            else:
                # Sunucunun sizi spam olarak algılamaması için normal her mail arasına 2 saniye bekleme koyuyoruz
                time.sleep(2)  
        except Exception as e:
            print(f"[{index+1}] HATA: {alici_email} adresine gönderilemedi. Hata: {e}")
            hatali += 1

    server.quit()
    print("-" * 30)
    print(f"İŞLEM TAMAMLANDI! {basarili} başarılı, {hatali} hatalı gönderim.")

if __name__ == "__main__":
    mail_gonder()
