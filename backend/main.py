from fastapi import FastAPI, BackgroundTasks, HTTPException, File, UploadFile, Depends, Header, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, RedirectResponse
from pydantic import BaseModel
import pandas as pd
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formatdate, make_msgid, formataddr
import time
import os
import threading
import shutil
import json
import jwt
from datetime import datetime, timedelta
import re
import random
import urllib.parse

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = "altikod_secret_key"
CONFIG_FILE = "config.json"
BLACKLIST_FILE = "blacklist.json"
HISTORY_FILE = "history.json"

def load_blacklist():
    if not os.path.exists(BLACKLIST_FILE):
        return []
    with open(BLACKLIST_FILE, "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except:
            return []

def save_blacklist(data):
    with open(BLACKLIST_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

def load_history():
    if not os.path.exists(HISTORY_FILE):
        return []
    with open(HISTORY_FILE, "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except:
            return []

def save_history(data):
    with open(HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

OPENS_FILE = "opens.json"

def load_opens():
    if not os.path.exists(OPENS_FILE):
        return []
    with open(OPENS_FILE, "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except:
            return []

def save_opens(data):
    with open(OPENS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

CLICKS_FILE = "clicks.json"

def load_clicks():
    if not os.path.exists(CLICKS_FILE):
        return []
    with open(CLICKS_FILE, "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except:
            return []

def save_clicks(data):
    with open(CLICKS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

POOL_FILE = "contacts_pool.json"

def load_pool():
    if not os.path.exists(POOL_FILE):
        return []
    with open(POOL_FILE, "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except:
            return []

def save_pool(data):
    with open(POOL_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

state = {
    "is_running": False,
    "total_sent": 0,
    "total_failed": 0,
    "pending": 0,
    "current_status": "Idle",
    "logs": [],
    "active_file": None,
    "active_template": None,
    "wait_seconds_remaining": 0,
    "campaign_id": None,
    "scheduled_time": None,
    "scheduled_payload": None,
    "is_paused": False
}

stop_event = threading.Event()
pause_event = threading.Event()
excel_lock = threading.Lock()

def log_msg(msg):
    time_str = datetime.now().strftime("%H:%M:%S")
    formatted_msg = f"[{time_str}] {msg}"
    print(formatted_msg)
    state["logs"].insert(0, formatted_msg)
    if len(state["logs"]) > 50:
        state["logs"].pop()

def load_config():
    with open(CONFIG_FILE, "r", encoding="utf-8") as f:
        config = json.load(f)
        
    # Migration for v6.0 (Multi-SMTP support)
    if "smtp_accounts" not in config:
        config["smtp_accounts"] = []
        if "smtp_server" in config:
            config["smtp_accounts"].append({
                "smtp_server": config.get("smtp_server", ""),
                "smtp_port": config.get("smtp_port", 465),
                "smtp_email": config.get("smtp_email", ""),
                "smtp_password": config.get("smtp_password", ""),
                "sender_name": config.get("sender_name", ""),
                "sender_email": config.get("sender_email", "")
            })
            # Clean up old keys
            for key in ["smtp_server", "smtp_port", "smtp_email", "smtp_password", "sender_name", "sender_email"]:
                if key in config:
                    del config[key]
            save_config(config)
            
    return config

def save_config(config_data):
    with open(CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump(config_data, f, indent=4, ensure_ascii=False)

def verify_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Geçersiz veya eksik token.")
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token süresi dolmuş.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Geçersiz token.")

class LoginPayload(BaseModel):
    username: str
    password: str

@app.post("/api/templates/spam_check")
def check_spam(payload: dict):
    html = payload.get("html", "").lower()
    spam_words = ['bedava', 'ücretsiz', 'kampanya', 'tıkla', 'kazan', 'şimdi', 'fırsat', '%100', 'garanti', 'aciliyet', 'tebrikler', 'ödül', 'hediye']
    
    score = 100
    found_words = []
    
    for word in spam_words:
        if word in html:
            score -= 8
            found_words.append(word)
            
    if score < 0: score = 0
    return {"score": score, "found_words": found_words}

class StartPayload(BaseModel):
    batch_size: int = 10
    wait_minutes: int = 31
    warmup_mode: bool = False
    template_b: str | None = None
    campaign_name: str | None = None

@app.post("/api/login")
def login(payload: LoginPayload):
    config = load_config()
    if payload.username == config["admin_user"] and payload.password == config["admin_pass"]:
        token = jwt.encode({
            "sub": payload.username,
            "exp": datetime.utcnow() + timedelta(days=1)
        }, SECRET_KEY, algorithm="HS256")
        return {"token": token}
    raise HTTPException(status_code=401, detail="Hatalı kullanıcı adı veya şifre.")

@app.get("/api/settings", dependencies=[Depends(verify_token)])
def get_settings():
    config = load_config()
    # Şifreyi güvenlik için gizleyebiliriz ama ayarlar panelinde göstermek gerekebilir
    return config

@app.post("/api/settings", dependencies=[Depends(verify_token)])
def update_settings(new_config: dict):
    config = load_config()
    config.update(new_config)
    save_config(config)
    return {"message": "Ayarlar kaydedildi."}

@app.get("/api/blacklist", dependencies=[Depends(verify_token)])
def get_blacklist():
    return {"blacklist": load_blacklist()}

class BlacklistPayload(BaseModel):
    email: str

@app.post("/api/blacklist", dependencies=[Depends(verify_token)])
def add_blacklist(payload: BlacklistPayload):
    bl = load_blacklist()
    email = payload.email.strip().lower()
    if email not in bl:
        bl.append(email)
        save_blacklist(bl)
    return {"message": "E-posta kara listeye eklendi.", "blacklist": bl}

@app.post("/api/blacklist/remove", dependencies=[Depends(verify_token)])
def remove_blacklist(payload: BlacklistPayload):
    bl = load_blacklist()
    email = payload.email.strip().lower()
    if email in bl:
        bl.remove(email)
        save_blacklist(bl)
    return {"message": "E-posta kara listeden çıkarıldı.", "blacklist": bl}

@app.get("/api/history", dependencies=[Depends(verify_token)])
def get_history():
    hist = load_history()
    opens = load_opens()
    clicks = load_clicks()
    for h in hist:
        camp_id = h.get("campaign_id", "old")
        opened_emails = set(o["email"] for o in opens if o["campaign_id"] == camp_id)
        h["open_count"] = len(opened_emails)
        
        clicked_emails = set(c["email"] for c in clicks if c["campaign_id"] == camp_id)
        h["click_count"] = len(clicked_emails)
    return {"history": hist}

class HistoryActionPayload(BaseModel):
    campaign_id: str
    new_name: str | None = None

@app.post("/api/history/delete", dependencies=[Depends(verify_token)])
def delete_history_item(payload: HistoryActionPayload):
    hist = load_history()
    new_hist = [h for h in hist if h.get("campaign_id") != payload.campaign_id]
    save_history(new_hist)
    
    opens = load_opens()
    save_opens([o for o in opens if o.get("campaign_id") != payload.campaign_id])
    
    clicks = load_clicks()
    save_clicks([c for c in clicks if c.get("campaign_id") != payload.campaign_id])
    
    return {"message": "Kampanya geçmişten silindi."}

@app.post("/api/history/rename", dependencies=[Depends(verify_token)])
def rename_history_item(payload: HistoryActionPayload):
    if not payload.new_name:
        raise HTTPException(status_code=400, detail="Yeni isim gerekli.")
        
    hist = load_history()
    for h in hist:
        if h.get("campaign_id") == payload.campaign_id:
            h["campaign_name"] = payload.new_name
            break
    save_history(hist)
    return {"message": "Kampanya adı güncellendi."}

@app.get("/api/history/download", dependencies=[Depends(verify_token)])
def download_history_excel(campaign_id: str):
    hist = load_history()
    for h in hist:
        if h.get("campaign_id") == campaign_id:
            file_name = h.get("file")
            if file_name and file_name != "Bilinmiyor":
                full_path = f"../{file_name}"
                if os.path.exists(full_path):
                    return FileResponse(full_path, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", filename=file_name)
    raise HTTPException(status_code=404, detail="Rapor dosyası bulunamadı.")

@app.get("/api/opens", dependencies=[Depends(verify_token)])
def get_opens():
    return {"opens": load_opens()}

@app.get("/api/track")
def track_open(email: str, camp: str):
    email = email.strip().lower()
    opens = load_opens()
    opens.append({
        "email": email,
        "campaign_id": camp,
        "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    })
    save_opens(opens)
    
    # Şeffaf 1x1 GIF piksel döndür
    pixel = b'GIF89a\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\x00\x00\x00!\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;'
    return Response(content=pixel, media_type="image/gif")

@app.get("/api/click")
def track_click(url: str, email: str, camp: str):
    email = email.strip().lower()
    clicks = load_clicks()
    clicks.append({
        "email": email,
        "campaign_id": camp,
        "url": url,
        "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    })
    save_clicks(clicks)
    
    # Gerçek URL'ye yönlendir
    return RedirectResponse(url=url)

@app.get("/api/unsubscribe")
def unsubscribe(email: str):
    email = email.strip().lower()
    bl = load_blacklist()
    if email not in bl:
        bl.append(email)
        save_blacklist(bl)
    return {"message": f"{email} başarıyla abonelikten çıkarıldı. Artık e-posta almayacaksınız."}

@app.get("/api/templates", dependencies=[Depends(verify_token)])
def get_templates():
    parent_dir = ".."
    templates = [f for f in os.listdir(parent_dir) if f.endswith(".html")]
    if not state["active_template"] and templates:
        state["active_template"] = templates[0]
    return {
        "templates": templates,
        "active_template": state["active_template"]
    }

@app.post("/api/templates/select", dependencies=[Depends(verify_token)])
def select_template(payload: dict):
    template_name = payload.get("template")
    if not template_name:
        raise HTTPException(status_code=400, detail="Şablon adı gerekli.")
    state["active_template"] = template_name
    return {"message": f"{template_name} seçildi."}

@app.post("/api/templates/upload", dependencies=[Depends(verify_token)])
async def upload_template(file: UploadFile = File(...)):
    if not file.filename.endswith(".html"):
        raise HTTPException(status_code=400, detail="Sadece .html dosyaları yüklenebilir.")
    file_location = f"../{file.filename}"
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)
    # Yeni yüklenen şablonu aktif yap
    state["active_template"] = file.filename
    return {"message": "Şablon yüklendi", "filename": file.filename}

@app.get("/api/templates/preview", dependencies=[Depends(verify_token)])
def preview_template(template: str):
    file_location = f"../{template}"
    if not os.path.exists(file_location):
        raise HTTPException(status_code=404, detail="Şablon bulunamadı.")
    with open(file_location, "r", encoding="utf-8") as f:
        content = f.read()
    return {"html": content}

@app.post("/api/templates/delete", dependencies=[Depends(verify_token)])
def delete_template(payload: dict):
    template_name = payload.get("template")
    if not template_name:
        raise HTTPException(status_code=400, detail="Şablon adı gerekli.")
    file_location = f"../{template_name}"
    if os.path.exists(file_location):
        os.remove(file_location)
        if state["active_template"] == template_name:
            state["active_template"] = None
        return {"message": "Şablon silindi."}
    raise HTTPException(status_code=404, detail="Şablon bulunamadı.")

@app.post("/api/templates/rename", dependencies=[Depends(verify_token)])
def rename_template(payload: dict):
    old_name = payload.get("old_name")
    new_name = payload.get("new_name")
    if not old_name or not new_name:
        raise HTTPException(status_code=400, detail="Eski ve yeni isim gerekli.")
    if not new_name.endswith(".html"):
        new_name += ".html"
        
    old_location = f"../{old_name}"
    new_location = f"../{new_name}"
    
    if not os.path.exists(old_location):
        raise HTTPException(status_code=404, detail="Şablon bulunamadı.")
    
    if os.path.exists(new_location):
        raise HTTPException(status_code=400, detail="Bu isimde bir şablon zaten var.")
        
    os.rename(old_location, new_location)
    
    if state["active_template"] == old_name:
        state["active_template"] = new_name
        
        
    return {"message": "Şablon adı değiştirildi."}

class TemplateUpdatePayload(BaseModel):
    template: str
    content: str

@app.post("/api/templates/update", dependencies=[Depends(verify_token)])
def update_template(payload: TemplateUpdatePayload):
    if not payload.template or not payload.content:
        raise HTTPException(status_code=400, detail="Şablon adı ve içerik gerekli.")
        
    file_location = f"../{payload.template}"
    if not os.path.exists(file_location):
        raise HTTPException(status_code=404, detail="Şablon bulunamadı.")
        
    with open(file_location, "w", encoding="utf-8") as f:
        f.write(payload.content)
        
    return {"message": "Şablon başarıyla güncellendi."}

class TestSendPayload(BaseModel):
    template: str
    email: str

@app.post("/api/templates/test_send", dependencies=[Depends(verify_token)])
def test_send_template(payload: TestSendPayload):
    config = load_config()
    accounts = config.get("smtp_accounts", [])
    if not accounts:
        raise HTTPException(status_code=400, detail="Önce Ayarlar kısmından SMTP hesabı ekleyin.")
        
    file_location = f"../{payload.template}"
    if not os.path.exists(file_location):
        raise HTTPException(status_code=404, detail="Şablon bulunamadı.")
        
    with open(file_location, "r", encoding="utf-8") as f:
        html_icerik = f.read()
        
    acc = accounts[0] # İlk hesabı kullanalım
    
    marka = "TEST MARKA"
    site_temiz = "test.com"
    alici_email = payload.email.strip()
    unsub_link = f'http://localhost:8000/api/unsubscribe?email={alici_email}'
    site_html = f'<a href="https://{site_temiz}" style="color:inherit; text-decoration:none;">{site_temiz}</a>'
    
    kisisel_html = html_icerik.replace("ref={{Site}}", f"ref={site_temiz}").replace("ref={{site}}", f"ref={site_temiz}")
    kisisel_html = kisisel_html.replace("{{Marka}}", marka).replace("{{Site}}", site_html).replace("{{E-posta}}", alici_email)
    kisisel_html = kisisel_html.replace("{{marka}}", marka).replace("{{site}}", site_html).replace("{{email}}", alici_email)
    kisisel_html = kisisel_html.replace("{{unsubscribe_link}}", unsub_link)

    msg = MIMEMultipart()
    msg['From'] = formataddr((acc["sender_name"], acc["sender_email"]))
    msg['To'] = alici_email
    msg['Subject'] = "[TEST] " + config.get("subject", "E-Posta")
    msg['Date'] = formatdate(localtime=True)
    domain = acc["sender_email"].split("@")[-1] if "@" in acc["sender_email"] else "altikodtech.com.tr"
    msg['Message-ID'] = make_msgid(domain=domain)
    msg['Reply-To'] = acc["sender_email"]
    msg.attach(MIMEText(kisisel_html, 'html'))

    try:
        s = smtplib.SMTP_SSL(acc["smtp_server"], acc["smtp_port"])
        s.login(acc["smtp_email"], acc["smtp_password"])
        s.send_message(msg)
        s.quit()
        return {"message": "Test e-postası başarıyla gönderildi."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SMTP Hatası: {str(e)}")

@app.get("/api/status", dependencies=[Depends(verify_token)])
def get_status():
    return state

@app.get("/api/download", dependencies=[Depends(verify_token)])
def download_excel():
    if not state["active_file"] or not os.path.exists(state["active_file"]):
        raise HTTPException(status_code=404, detail="Aktif liste bulunamadı.")
    return FileResponse(state["active_file"], media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", filename=os.path.basename(state["active_file"]))

@app.post("/api/upload", dependencies=[Depends(verify_token)])
async def upload_excel(file: UploadFile = File(...)):
    if state["is_running"]:
        raise HTTPException(status_code=400, detail="Gönderim devam ederken dosya yüklenemez.")
    
    file_location = f"../{file.filename}"
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)
        
    state["active_file"] = file_location
    
    try:
        df = pd.read_excel(file_location)
        if 'Durum' not in df.columns:
            df['Durum'] = ""
            
        # Geçerli olmayan e-postaları iptal et ve önceden iptal edilmiş olanları (gönderilenler hariç) sıfırla
        for idx, row in df.iterrows():
            email_val = str(row.get('E-posta', '')).strip().lower()
            if not email_val or email_val == 'nan':
                df.at[idx, 'Durum'] = 'İptal'
            elif df.at[idx, 'Durum'] != 'Gönderildi':
                df.at[idx, 'Durum'] = ''
                
        df.to_excel(file_location, index=False)
        
        state["total_sent"] = len(df[df['Durum'] == 'Gönderildi'])
        state["pending"] = len(df[(df['Durum'] != 'Gönderildi') & (df['Durum'] != 'İptal')])
        state["total_failed"] = 0
        log_msg(f"Dosya yüklendi: {file.filename}")
        
        # Otomatik olarak Kişiler (Havuz) veritabanına ekle
        if 'E-posta' in df.columns:
            pool = load_pool()
            existing_emails = {p.get("E-posta", "").lower() for p in pool}
            added_count = 0
            for index, row in df.iterrows():
                email = str(row.get('E-posta', '')).strip().lower()
                if email and email != 'nan' and email not in existing_emails:
                    contact = {
                        "E-posta": email,
                        "Marka": str(row.get('Marka', '')),
                        "Site": str(row.get('Site', ''))
                    }
                    pool.append(contact)
                    existing_emails.add(email)
                    added_count += 1
            if added_count > 0:
                save_pool(pool)
                log_msg(f"Yüklenen dosyadan {added_count} yeni kişi otomatik olarak Havuz'a eklendi.")
                
    except Exception as e:
        log_msg(f"Dosya okuma hatası: {e}")
        
    return {"message": "Dosya başarıyla yüklendi", "filename": file.filename}

@app.get("/api/pool", dependencies=[Depends(verify_token)])
def get_pool():
    return {"pool": load_pool()}

@app.post("/api/pool/upload", dependencies=[Depends(verify_token)])
async def upload_to_pool(file: UploadFile = File(...)):
    if not file.filename.endswith('.xlsx'):
        raise HTTPException(status_code=400, detail="Sadece .xlsx desteklenir")
    
    contents = await file.read()
    temp_path = f"../temp_{file.filename}"
    with open(temp_path, "wb") as f:
        f.write(contents)
        
    try:
        df = pd.read_excel(temp_path)
    except Exception as e:
        if os.path.exists(temp_path): os.remove(temp_path)
        raise HTTPException(status_code=400, detail="Excel okunamadı")
        
    if 'E-posta' not in df.columns:
        if os.path.exists(temp_path): os.remove(temp_path)
        raise HTTPException(status_code=400, detail="Sütunlarda 'E-posta' bulunamadı")
        
    pool = load_pool()
    existing_emails = {p["E-posta"] for p in pool}
    added_count = 0
    
    for index, row in df.iterrows():
        email = str(row.get('E-posta', '')).strip().lower()
        if email and email != 'nan' and email not in existing_emails:
            contact = {
                "E-posta": email,
                "Marka": str(row.get('Marka', '')),
                "Site": str(row.get('Site', ''))
            }
            pool.append(contact)
            existing_emails.add(email)
            added_count += 1
            
    save_pool(pool)
    if os.path.exists(temp_path): os.remove(temp_path)
    return {"message": f"{added_count} yeni kişi havuza eklendi.", "total": len(pool)}

@app.post("/api/pool/use", dependencies=[Depends(verify_token)])
def use_pool_as_active():
    pool = load_pool()
    if not pool:
        raise HTTPException(status_code=400, detail="Havuz boş.")
        
    df = pd.DataFrame(pool)
    df['Durum'] = ""
    out_path = f"../havuz_kampanya_{datetime.now().strftime('%Y%m%d%H%M%S')}.xlsx"
    df.to_excel(out_path, index=False)
    
    state["active_file"] = out_path
    state["total_sent"] = 0
    state["pending"] = len(df)
    
    return {"message": "Kişi havuzu kampanya listesi olarak ayarlandı.", "file": out_path}

@app.get("/api/contacts", dependencies=[Depends(verify_token)])
def get_contacts():
    if not state["active_file"] or not os.path.exists(state["active_file"]):
        return {"contacts": []}
    try:
        df = pd.read_excel(state["active_file"])
        if 'Durum' not in df.columns:
            df['Durum'] = ""
        # NaN değerleri boş string yapalım ki JSON'a çevrilirken hata olmasın
        df = df.fillna("")
        
        contacts = []
        for index, row in df.iterrows():
            contacts.append({
                "id": index,
                "email": str(row.get("E-posta", "")),
                "brand": str(row.get("Marka", "")),
                "site": str(row.get("Site", "")),
                "status": str(row.get("Durum", ""))
            })
        return {"contacts": contacts}
    except Exception as e:
        log_msg(f"Kişi okuma hatası: {e}")
        return {"contacts": []}

class ContactUpdatePayload(BaseModel):
    id: int
    status: str

@app.post("/api/contacts/update", dependencies=[Depends(verify_token)])
def update_contact_status(payload: ContactUpdatePayload):
    if not state["active_file"] or not os.path.exists(state["active_file"]):
        raise HTTPException(status_code=400, detail="Aktif dosya yok.")
    if state["is_running"]:
        raise HTTPException(status_code=400, detail="Çalışırken durum değiştirilemez.")
    
    try:
        with excel_lock:
            df = pd.read_excel(state["active_file"])
            df['Durum'] = df['Durum'].astype(object) # Prevent float64 type error on empty columns
            df.at[payload.id, 'Durum'] = payload.status
            df.to_excel(state["active_file"], index=False)
        
        # update states
        df['Durum'] = df['Durum'].fillna("")
        state["total_sent"] = len(df[df['Durum'] == 'Gönderildi'])
        state["pending"] = len(df[(df['Durum'] != 'Gönderildi') & (df['Durum'] != 'İptal')])
        return {"message": "Güncellendi"}
    except Exception as e:
        print(f"Exception in update_contact_status: {e}")
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Güncelleme hatası: {e}")

class ContactDeletePayload(BaseModel):
    id: int

@app.post("/api/contacts/delete", dependencies=[Depends(verify_token)])
def delete_contact(payload: ContactDeletePayload):
    if not state["active_file"] or not os.path.exists(state["active_file"]):
        raise HTTPException(status_code=400, detail="Aktif dosya yok.")
    if state["is_running"]:
        raise HTTPException(status_code=400, detail="Çalışırken kişi silinemez.")
    
    try:
        with excel_lock:
            df = pd.read_excel(state["active_file"])
            if payload.id not in df.index:
                raise HTTPException(status_code=404, detail="Kişi bulunamadı.")
            
            # Find email to remove from pool
            email_to_remove = str(df.at[payload.id, 'E-posta']).strip().lower()
            
            # Drop the row
            df = df.drop(index=payload.id)
            df.to_excel(state["active_file"], index=False)
            
            # Remove from pool.json
            if email_to_remove and email_to_remove != 'nan':
                pool = load_pool()
                new_pool = [p for p in pool if str(p.get("E-posta", "")).strip().lower() != email_to_remove]
                if len(new_pool) != len(pool):
                    save_pool(new_pool)
        
        # update states
        df['Durum'] = df['Durum'].fillna("")
        state["total_sent"] = len(df[df['Durum'] == 'Gönderildi'])
        state["pending"] = len(df[(df['Durum'] != 'Gönderildi') & (df['Durum'] != 'İptal')])
        return {"message": "Kişi silindi"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Silme hatası: {e}")

def send_emails_background(batch_size: int, wait_minutes: int, warmup_mode: bool = False, template_b: str | None = None):
    if not state["active_file"] or not os.path.exists(state["active_file"]):
        log_msg("Hata: Gönderilecek Excel dosyası bulunamadı.")
        state["is_running"] = False
        state["current_status"] = "Error"
        return
        
    if not state["active_template"]:
        log_msg("Hata: Şablon seçilmedi.")
        state["is_running"] = False
        state["current_status"] = "Error"
        return

    config = load_config()
    sablon_yolu = f"../{state['active_template']}"
    
    if not os.path.exists(sablon_yolu):
        log_msg("Hata: Seçilen şablon dosyası bulunamadı.")
        state["is_running"] = False
        state["current_status"] = "Error"
        return
        
    state["is_running"] = True
    state["is_paused"] = False
    state["current_status"] = "Running"
    state["wait_seconds_remaining"] = 0
    stop_event.clear()
    
    try:
        df = pd.read_excel(state["active_file"])
        if 'Durum' in df.columns:
            df['Durum'] = df['Durum'].astype(object) # Prevent float64 assignment error
    except Exception as e:
        log_msg(f"Excel okuma hatası: {e}")
        state["is_running"] = False
        state["current_status"] = "Error"
        return

    if 'Durum' not in df.columns:
        df['Durum'] = ""

    state["total_sent"] = len(df[df['Durum'] == 'Gönderildi'])
    state["pending"] = len(df[df['Durum'] != 'Gönderildi'])

    with open(sablon_yolu, "r", encoding="utf-8") as f:
        html_icerik_a = f.read()
        
    html_icerik_b = None
    if template_b and os.path.exists(f"../{template_b}"):
        with open(f"../{template_b}", "r", encoding="utf-8") as f:
            html_icerik_b = f.read()

    config = load_config()
    accounts = config.get("smtp_accounts", [])
    if not accounts:
        log_msg("HATA: Hiç SMTP hesabı tanımlanmamış.")
        state["is_running"] = False
        state["current_status"] = "Error"
        return
        
    gonderilen_batch = 0
    current_account_idx = 0
    
    # Kampanya ID oluştur (Tracking için)
    camp_id = state.get("campaign_id", "camp_" + datetime.now().strftime("%Y%m%d%H%M%S"))
    state["campaign_id"] = camp_id
    
    def get_server():
        acc = accounts[current_account_idx]
        try:
            s = smtplib.SMTP_SSL(acc["smtp_server"], acc["smtp_port"])
            s.login(acc["smtp_email"], acc["smtp_password"])
            log_msg(f"Bağlanıldı: {acc['smtp_email']}")
            return s, acc
        except Exception as e:
            log_msg(f"SMTP Bağlantı hatası ({acc['smtp_email']}): {e}")
            return None, None

    try:
        server, current_acc = get_server()
        if not server:
            state["is_running"] = False
            state["current_status"] = "Error"
            return
    except Exception as e:
        log_msg(f"SMTP Bağlantı hatası: {e}")
        state["is_running"] = False
        state["current_status"] = "Error"
        return

    gonderilen_batch = 0
    bl = load_blacklist()

    for index, row in df.iterrows():
        if stop_event.is_set():
            log_msg("Gönderim durduruldu.")
            break
            
        # Manuel Duraklatma Kontrolü
        while state.get("is_paused", False):
            if stop_event.is_set(): break
            time.sleep(1)
            
        if stop_event.is_set():
            break

        # Çalışma Saatleri (Mola) Kontrolü
        conf = load_config()
        work_start = conf.get("work_start_time", "")
        work_end = conf.get("work_end_time", "")
        
        if work_start and work_end:
            while True:
                if stop_event.is_set(): break
                if state.get("is_paused", False): break
                
                now = datetime.now()
                current_time = now.strftime("%H:%M")
                
                is_working = False
                if work_start < work_end:
                    is_working = work_start <= current_time <= work_end
                else: # Gece yarısını geçen saatler (Örn: 22:00 - 06:00)
                    is_working = current_time >= work_start or current_time <= work_end
                    
                if not is_working:
                    if not state["current_status"].startswith("Mola"):
                        state["current_status"] = f"Mola (Çalışma saati dışı: {work_start}-{work_end})"
                        log_msg(f"Sistem Mola Durumunda! Belirlenen saat bekleniyor: {work_start}")
                    time.sleep(60) # 1 dakika bekle ve tekrar kontrol et
                else:
                    if state["current_status"].startswith("Mola"):
                        state["current_status"] = "Running"
                        log_msg("Çalışma saatine girildi, gönderim devam ediyor.")
                    break
                    
        if stop_event.is_set():
            break

        durum = str(row.get('Durum', '')).strip()
        alici_email = str(row.get('E-posta', '')).strip()
        
        if durum == 'Gönderildi' or durum == 'İptal' or durum == 'Kara Liste':
            continue

        if not alici_email or alici_email.lower() == 'nan':
            continue

        if alici_email.lower() in bl:
            df.at[index, 'Durum'] = 'Kara Liste'
            df.to_excel(state["active_file"], index=False)
            log_msg(f"ATLANDI (Kara Liste): {alici_email}")
            state["pending"] -= 1
            continue

        marka = str(row.get('Marka', '')).strip()
        site = str(row.get('Site', '')).strip()
        
        site_temiz = site.replace("https://", "").replace("http://", "").rstrip("/")
        
        if marka.lower() == 'nan' or marka == '-':
            marka = 'Değerli'
            
        unsub_link = f'http://localhost:8000/api/unsubscribe?email={alici_email}'
        track_link = f'http://localhost:8000/api/track?email={alici_email}&camp={camp_id}'
        site_html = f'<a href="https://{site_temiz}" style="color:inherit; text-decoration:none;">{site_temiz}</a>'
            
        if html_icerik_b:
            if index % 2 == 0:
                html_icerik = html_icerik_a
                kullanilan_sablon = state['active_template']
            else:
                html_icerik = html_icerik_b
                kullanilan_sablon = template_b
        else:
            html_icerik = html_icerik_a
            kullanilan_sablon = state['active_template']
            
        kisisel_html = html_icerik.replace("ref={{Site}}", f"ref={site_temiz}").replace("ref={{site}}", f"ref={site_temiz}")
        kisisel_html = kisisel_html.replace("{{Marka}}", marka).replace("{{Site}}", site_html).replace("{{E-posta}}", alici_email)
        kisisel_html = kisisel_html.replace("{{marka}}", marka).replace("{{site}}", site_html).replace("{{email}}", alici_email)
        base_url = config.get("tracking_domain", "").rstrip("/")
        
        if base_url and base_url.startswith("http"):
            unsub_link = f'{base_url}/api/unsubscribe?email={alici_email}'
            track_link = f'{base_url}/api/track?email={alici_email}&camp={camp_id}'
            
            kisisel_html = kisisel_html.replace("{{unsubscribe_link}}", unsub_link)
            
            def link_replacer(match):
                orijinal_link = match.group(1)
                if "unsubscribe" in orijinal_link or "track" in orijinal_link:
                    return match.group(0)
                encoded_url = urllib.parse.quote(orijinal_link, safe='')
                yeni_link = f'{base_url}/api/click?url={encoded_url}&email={alici_email}&camp={camp_id}'
                return f'href="{yeni_link}"'

            kisisel_html = re.sub(r'href="(https?://[^"]+)"', link_replacer, kisisel_html)
            
            pixel_html = f'<img src="{track_link}" width="1" height="1" style="display:none;" />'
            if "</body>" in kisisel_html.lower():
                kisisel_html = re.sub(r'(?i)</body>', f'{pixel_html}</body>', kisisel_html)
            else:
                kisisel_html += pixel_html
        else:
            # Tıklama takibi yapılandırılmamış, abonelikten çıkma linki yerine boş bırak veya '#' koy
            kisisel_html = kisisel_html.replace("{{unsubscribe_link}}", "#")

        msg = MIMEMultipart()
        msg['From'] = formataddr((current_acc["sender_name"], current_acc["sender_email"]))
        msg['To'] = alici_email
        msg['Subject'] = config.get("subject", "E-Posta")
        msg['Date'] = formatdate(localtime=True)
        # Domain can be extracted from current_acc
        domain = current_acc["sender_email"].split("@")[-1] if "@" in current_acc["sender_email"] else "altikodtech.com.tr"
        msg['Message-ID'] = make_msgid(domain=domain)
        msg['Reply-To'] = current_acc["sender_email"]
        msg.attach(MIMEText(kisisel_html, 'html'))

        try:
            server.send_message(msg)
            df.at[index, 'Durum'] = 'Gönderildi'
            df.at[index, 'Şablon'] = kullanilan_sablon
            df.to_excel(state["active_file"], index=False)
            
            state["total_sent"] += 1
            state["pending"] -= 1
            gonderilen_batch += 1
            log_msg(f"GÖNDERİLDİ: {alici_email}")
            
            if gonderilen_batch >= batch_size:
                if wait_minutes > 0:
                    log_msg(f"{batch_size} mail gönderildi. {wait_minutes} dk bekleniyor...")
                    state["current_status"] = "Waiting"
                    try:
                        server.quit()
                    except:
                        pass
                    
                    wait_seconds = wait_minutes * 60
                    state["wait_seconds_remaining"] = wait_seconds
                    
                    while state["wait_seconds_remaining"] > 0:
                        if stop_event.is_set():
                            break
                        
                        # Bekleme sırasında da duraklatılabilir (geri sayım donar)
                        while state.get("is_paused", False):
                            if stop_event.is_set(): break
                            time.sleep(1)
                            
                        if stop_event.is_set():
                            break
                            
                        time.sleep(1)
                        state["wait_seconds_remaining"] -= 1
                    
                    state["wait_seconds_remaining"] = 0
                    
                    if stop_event.is_set():
                        break
                        
                    state["current_status"] = "Running"
                    
                    # Rotasyon: Bir sonraki SMTP hesabına geç
                    current_account_idx = (current_account_idx + 1) % len(accounts)
                    server, current_acc = get_server()
                    if not server:
                        state["is_running"] = False
                        state["current_status"] = "Error"
                        return
                else:
                    log_msg(f"{batch_size} mail gönderildi. Bekleme süresi 0 olduğu için devam ediliyor...")
                    # Eğer bekleme yoksa da rotasyon yapabiliriz (opsiyonel)
                    current_account_idx = (current_account_idx + 1) % len(accounts)
                    try:
                        server.quit()
                    except:
                        pass
                    server, current_acc = get_server()
                    if not server:
                        state["is_running"] = False
                        state["current_status"] = "Error"
                        return
                
                gonderilen_batch = 0
            else:
                if warmup_mode:
                    wait_sec = random.randint(15, 60)
                    time.sleep(wait_sec)
                else:
                    time.sleep(2)
        except Exception as e:
            hata_mesaji = f"Hata: {str(e)}"
            log_msg(f"HATA: {alici_email} - {e}")
            df.at[index, 'Durum'] = hata_mesaji
            df.to_excel(state["active_file"], index=False)
            state["total_failed"] += 1

    try:
        server.quit()
    except:
        pass
        
    state["is_running"] = False
    state["current_status"] = "Idle"
    state["wait_seconds_remaining"] = 0
    log_msg("İşlem tamamlandı.")

    # Geçmişe kaydet
    hist = load_history()
    hist.insert(0, {
        "campaign_id": state.get("campaign_id", "unknown"),
        "campaign_name": state.get("campaign_name") or state.get("campaign_id", "unknown"),
        "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "file": state["active_file"].replace("../", "") if state["active_file"] else "Bilinmiyor",
        "template": state["active_template"] or "Bilinmiyor",
        "total_sent": state["total_sent"],
        "total_failed": state["total_failed"],
        "pending": state["pending"]
    })
    save_history(hist)

@app.post("/api/start", dependencies=[Depends(verify_token)])
def start_campaign(payload: StartPayload, background_tasks: BackgroundTasks):
    if state["is_running"]:
        raise HTTPException(status_code=400, detail="Zaten çalışıyor.")
    if not state["active_file"]:
        raise HTTPException(status_code=400, detail="Önce Excel dosyası yükleyin.")
    if not state["active_template"]:
        raise HTTPException(status_code=400, detail="Önce bir şablon seçin.")
    
    state["scheduled_time"] = None
    state["scheduled_payload"] = None
    state["campaign_id"] = "camp_" + datetime.now().strftime("%Y%m%d%H%M%S")
    state["campaign_name"] = payload.campaign_name
    background_tasks.add_task(send_emails_background, payload.batch_size, payload.wait_minutes, payload.warmup_mode, payload.template_b)
    return {"message": "Başlatıldı"}

class SchedulePayload(StartPayload):
    scheduled_time: str # Format: "YYYY-MM-DD HH:MM"

@app.post("/api/schedule", dependencies=[Depends(verify_token)])
def schedule_campaign(payload: SchedulePayload):
    if state["is_running"]:
        raise HTTPException(status_code=400, detail="Zaten çalışan bir kampanya var.")
    if not state["active_file"]:
        raise HTTPException(status_code=400, detail="Önce Excel dosyası yükleyin.")
    if not state["active_template"]:
        raise HTTPException(status_code=400, detail="Önce bir şablon seçin.")
    
    try:
        dt = datetime.strptime(payload.scheduled_time, "%Y-%m-%d %H:%M")
        if dt <= datetime.now():
            raise ValueError()
    except:
        raise HTTPException(status_code=400, detail="Geçersiz ileri tarih/saat.")
        
    state["scheduled_time"] = payload.scheduled_time
    state["scheduled_payload"] = {"batch_size": payload.batch_size, "wait_minutes": payload.wait_minutes, "warmup_mode": payload.warmup_mode, "template_b": payload.template_b}
    state["campaign_id"] = "camp_" + datetime.now().strftime("%Y%m%d%H%M%S")
    state["campaign_name"] = payload.campaign_name
    state["current_status"] = f"Zamanlandı: {payload.scheduled_time}"
    
    return {"message": f"Kampanya {payload.scheduled_time} tarihine zamanlandı."}

@app.post("/api/schedule/cancel", dependencies=[Depends(verify_token)])
def cancel_schedule():
    state["scheduled_time"] = None
    state["scheduled_payload"] = None
    if not state["is_running"]:
        state["current_status"] = "Idle"
    return {"message": "Zamanlanmış kampanya iptal edildi."}

@app.post("/api/stop", dependencies=[Depends(verify_token)])
def stop_campaign():
    if not state["is_running"]:
        raise HTTPException(status_code=400, detail="Zaten durmuş durumda.")
    stop_event.set()
    return {"message": "Durduruluyor..."}

@app.post("/api/pause", dependencies=[Depends(verify_token)])
def pause_campaign():
    if not state["is_running"]:
        raise HTTPException(status_code=400, detail="Çalışan bir kampanya yok.")
    if state.get("is_paused", False):
        raise HTTPException(status_code=400, detail="Zaten duraklatıldı.")
    state["is_paused"] = True
    state["current_status"] = "Duraklatıldı"
    return {"message": "Kampanya duraklatıldı."}

@app.post("/api/resume", dependencies=[Depends(verify_token)])
def resume_campaign():
    if not state["is_running"]:
        raise HTTPException(status_code=400, detail="Çalışan bir kampanya yok.")
    if not state.get("is_paused", False):
        raise HTTPException(status_code=400, detail="Kampanya zaten çalışıyor.")
    state["is_paused"] = False
    state["current_status"] = "Running"
    return {"message": "Kampanya devam ediyor."}

def scheduler_loop():
    while True:
        time.sleep(10)
        if state["scheduled_time"] and not state["is_running"]:
            try:
                target_dt = datetime.strptime(state["scheduled_time"], "%Y-%m-%d %H:%M")
                if datetime.now() >= target_dt:
                    payload = state["scheduled_payload"]
                    state["scheduled_time"] = None
                    state["scheduled_payload"] = None
                    state["campaign_id"] = "camp_sch_" + datetime.now().strftime("%Y%m%d%H%M%S")
                    t = threading.Thread(target=send_emails_background, args=(payload["batch_size"], payload["wait_minutes"], payload.get("warmup_mode", False), payload.get("template_b", None)))
                    t.daemon = True
                    t.start()
            except Exception as e:
                pass

if __name__ == "__main__":
    t = threading.Thread(target=scheduler_loop)
    t.daemon = True
    t.start()
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
