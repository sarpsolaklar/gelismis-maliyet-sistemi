import React, { useState, useEffect, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_BASE = 'http://localhost:8000/api';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [status, setStatus] = useState({
    is_running: false,
    total_sent: 0,
    total_failed: 0,
    pending: 0,
    current_status: "Idle",
    logs: [],
    active_file: null,
    wait_seconds_remaining: 0,
    active_template: null
  });

  const [batchSize, setBatchSize] = useState(10);
  const [waitMinutes, setWaitMinutes] = useState(31);
  const [settings, setSettings] = useState({});
  const [templates, setTemplates] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [contactFilter, setContactFilter] = useState('Hepsi');
  const [blacklist, setBlacklist] = useState([]);
  const [blacklistInput, setBlacklistInput] = useState('');
  const [historyList, setHistoryList] = useState([]);
  const [scheduledTime, setScheduledTime] = useState('');
  const [warmupMode, setWarmupMode] = useState(false);
  const [templateB, setTemplateB] = useState('');
  
  const [previewMode, setPreviewMode] = useState('A');
  const [previewHtml, setPreviewHtml] = useState('');
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [spamScore, setSpamScore] = useState(null);
  const [spamWords, setSpamWords] = useState([]);
  const [editHtml, setEditHtml] = useState('');
  
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  
  const [poolCount, setPoolCount] = useState(0);
  
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const fileInputRef = useRef(null);
  const templateInputRef = useRef(null);

  useEffect(() => {
    if (!token) return;
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${API_BASE}/status`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setStatus(await res.json());
        else if (res.status === 401) handleLogout();
      } catch (err) {}
    };
    if (token) {
      const interval = setInterval(fetchStatus, 3000);
      fetchTemplates();
      fetchBlacklist();
      fetchHistory();
      fetchPoolCount();
      return () => clearInterval(interval);
    }
  }, [token]);

  useEffect(() => {
    if (token && activeTab === 'settings') fetchSettings();
    if (token && activeTab === 'templates') fetchTemplates();
    if (token && activeTab === 'contacts') fetchContacts();
    if (token && activeTab === 'blacklist') fetchBlacklist();
    if (token && activeTab === 'history') fetchHistory();
  }, [token, activeTab]);
  
  // Update preview when template changes or tab is opened
  useEffect(() => {
    if (token && activeTab === 'templates') {
      if (previewMode === 'A' && status.active_template) {
        fetchPreview(status.active_template);
      } else if (previewMode === 'B' && templateB) {
        fetchPreview(templateB);
      } else {
        setPreviewHtml('');
      }
    }
  }, [token, activeTab, status.active_template, templateB, previewMode]);

  const fetchSettings = async () => {
    const res = await fetch(`${API_BASE}/settings`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) setSettings(await res.json());
  };

  const fetchTemplates = async () => {
    const res = await fetch(`${API_BASE}/templates`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) {
      const data = await res.json();
      setTemplates(data.templates);
      if(data.active_template) setStatus(s => ({...s, active_template: data.active_template}));
    }
  };

  const fetchPreview = async (tmpl) => {
    try {
      const res = await fetch(`${API_BASE}/templates/preview?template=${tmpl}`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setPreviewHtml(data.html);
        setEditHtml(data.html);
      }
    } catch(e) {
      setPreviewHtml('<p>Önizleme yüklenemedi.</p>');
      setEditHtml('');
    }
  };

  const fetchContacts = async () => {
    const res = await fetch(`${API_BASE}/contacts`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) {
      const data = await res.json();
      setContacts(data.contacts);
    }
  };

  const fetchBlacklist = async () => {
    const res = await fetch(`${API_BASE}/blacklist`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) {
      const data = await res.json();
      setBlacklist(data.blacklist);
    }
  };

  const fetchHistory = async () => {
    const res = await fetch(`${API_BASE}/history`, { headers: { 'Authorization': `Bearer ${token}` } });
    if(res.ok) {
      const data = await res.json();
      setHistoryList(data.history);
    }
  };

  const addToBlacklist = async () => {
    if(!blacklistInput.trim()) return;
    const res = await fetch(`${API_BASE}/blacklist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ email: blacklistInput })
    });
    if(res.ok) {
      setBlacklistInput('');
      fetchBlacklist();
    }
  };

  const removeFromBlacklist = async (email) => {
    if(!window.confirm(`"${email}" adresini kara listeden çıkarmak istediğinize emin misiniz?`)) return;
    const res = await fetch(`${API_BASE}/blacklist/remove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ email })
    });
    if(res.ok) fetchBlacklist();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginForm)
    });
    if (res.ok) {
      const data = await res.json();
      setToken(data.token);
      localStorage.setItem('token', data.token);
      toast.success("Başarıyla giriş yapıldı.");
    } else {
      toast.error("Hatalı giriş.");
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  const startCampaign = async () => {
    const campaignName = window.prompt("Lütfen bu kampanya için bir isim girin (İsteğe bağlı):");
    if (campaignName === null) return; // İptal edildi

    const payload = { 
      batch_size: parseInt(batchSize), 
      wait_minutes: parseInt(waitMinutes), 
      warmup_mode: warmupMode,
      template_b: templateB || null,
      campaign_name: campaignName || null
    };

    // Ayarları (Çalışma saatleri vb.) backend'e kaydet ki güncel kalsın
    await fetch(`${API_BASE}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(settings)
    });
    
    if (scheduledTime) {
      // Zamanlanmış Gönderim
      payload.scheduled_time = scheduledTime.replace('T', ' ');
      const res = await fetch(`${API_BASE}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if(res.ok) {
        setScheduledTime('');
        toast.success("Kampanya başarıyla zamanlandı!");
      } else {
        const data = await res.json();
        toast.error(data.detail);
      }
    } else {
      // Hemen Gönderim
      const res = await fetch(`${API_BASE}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if(res.ok) {
        toast.success("Kampanya başlatıldı!");
      } else {
        const d = await res.json();
        toast.error(d.detail || "Hata oluştu");
      }
    }
  };

  const stopCampaign = async () => {
    if (status.current_status && status.current_status.startsWith('Zamanlandı')) {
      const res = await fetch(`${API_BASE}/schedule/cancel`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
      if(res.ok) toast.success("Zamanlanmış kampanya iptal edildi.");
      else toast.error("İptal edilemedi.");
    } else {
      const res = await fetch(`${API_BASE}/stop`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
      if(res.ok) toast.success("Gönderim durduruldu.");
    }
  };

  const pauseCampaign = async () => {
    const res = await fetch(`${API_BASE}/pause`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
    if(res.ok) toast.success("Gönderim duraklatıldı.");
  };

  const resumeCampaign = async () => {
    const res = await fetch(`${API_BASE}/resume`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
    if(res.ok) toast.success("Gönderime devam ediliyor.");
  };

  const deleteHistory = async (campaignId) => {
    if (!window.confirm("Bu kampanyayı geçmişten silmek istediğinize emin misiniz? (Veriler silinecek)")) return;
    const res = await fetch(`${API_BASE}/history/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ campaign_id: campaignId })
    });
    if(res.ok) {
      toast.success("Kampanya silindi.");
      fetchHistory();
    }
  };

  const renameHistory = async (campaignId, currentName) => {
    const newName = window.prompt("Yeni kampanya adı:", currentName || campaignId);
    if (!newName) return;
    const res = await fetch(`${API_BASE}/history/rename`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ campaign_id: campaignId, new_name: newName })
    });
    if(res.ok) {
      toast.success("Kampanya adı değiştirildi.");
      fetchHistory();
    }
  };

  const downloadHistoryReport = async (campaignId, fileName) => {
    const res = await fetch(`${API_BASE}/history/download?campaign_id=${campaignId}`, { headers: { 'Authorization': `Bearer ${token}` } });
    if(res.ok) {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName && fileName !== "Bilinmiyor" ? fileName : `rapor_${campaignId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } else {
      toast.error("Rapor dosyası bulunamadı veya silinmiş.");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    if(res.ok) {
      toast.success("Dosya yüklendi.");
      if (activeTab === 'contacts') fetchContacts();
    } else {
      toast.error("Yükleme hatası.");
    }
  };

  const handleTemplateUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE}/templates/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    if(res.ok) {
      toast.success("Şablon yüklendi.");
      fetchTemplates();
    } else {
      toast.error("Yükleme hatası.");
    }
  };

  const generateAiTemplate = async () => {
    if(!aiPrompt) return;
    setIsGenerating(true);
    
    // Fake AI generation delay
    setTimeout(async () => {
      const generatedHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>AI Tarafından Üretildi</title>
</head>
<body style="margin:0; padding:20px; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#f4f4f5;">
  <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 6px rgba(0,0,0,0.05);">
    <div style="background:#60A5FA; padding:30px; text-align:center;">
      <h1 style="color:white; margin:0; font-size:24px;">{{Marka}}</h1>
    </div>
    <div style="padding:40px 30px;">
      <h2 style="color:#1f2937; margin-top:0;">Merhaba {{E-posta}},</h2>
      <p style="color:#4b5563; line-height:1.6; font-size:16px;">
        Yapay zeka asistanı tarafından isteğinize göre oluşturulmuş şablondur. Konu: <strong>${aiPrompt}</strong>
      </p>
      <div style="text-align:center; margin:30px 0;">
        <a href="https://{{Site}}" style="display:inline-block; background:#4ADE80; color:white; text-decoration:none; padding:12px 24px; border-radius:6px; font-weight:bold; font-size:16px;">Hemen İncele</a>
      </div>
    </div>
    <div style="background:#f9fafb; padding:20px; text-align:center; border-top:1px solid #e5e7eb;">
      <p style="color:#9ca3af; font-size:12px; margin:0;">
        Bu e-postayı almak istemiyorsanız <a href="{{unsubscribe_link}}" style="color:#60A5FA;">buradan abonelikten çıkabilirsiniz</a>.
      </p>
    </div>
  </div>
</body>
</html>`;

      const res = await fetch(`${API_BASE}/templates/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ template: `ai-sablon-${Date.now()}.html`, html: generatedHtml })
      });
      if(res.ok) {
        toast.success("Yapay zeka şablonu oluşturdu ve kaydetti!");
        fetchTemplates();
        setIsAiModalOpen(false);
        setAiPrompt('');
      }
      setIsGenerating(false);
    }, 2500);
  };

  const fetchPoolCount = async () => {
    const res = await fetch(`${API_BASE}/pool`, { headers: { 'Authorization': `Bearer ${token}` } });
    if(res.ok) {
      const data = await res.json();
      setPoolCount(data.pool.length);
    }
  };

  const handlePoolUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE}/pool/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    if(res.ok) {
      const data = await res.json();
      toast.success(data.message);
      fetchPoolCount();
    } else {
      toast.error("Havuza ekleme hatası.");
    }
  };

  const usePool = async () => {
    const res = await fetch(`${API_BASE}/pool/use`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if(res.ok) {
      toast.success("Kişi havuzu kampanya için ayarlandı.");
      fetchContacts();
    } else {
      toast.error("Havuz başlatılamadı.");
    }
  };

  const saveSettings = async () => {
    await fetch(`${API_BASE}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(settings)
    });
    toast.success("Ayarlar kaydedildi.");
  };

  const selectTemplate = async (tmpl) => {
    await fetch(`${API_BASE}/templates/select`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ template: tmpl })
    });
    setStatus({...status, active_template: tmpl});
    
    // Auto-check spam when selected
    const res = await fetch(`${API_BASE}/templates/preview?template=${tmpl}`, { headers: { 'Authorization': `Bearer ${token}` } });
    if(res.ok) {
      const data = await res.json();
      checkSpamScore(data.html);
    }
  };

  const checkSpamScore = async (html) => {
    const res = await fetch(`${API_BASE}/templates/spam_check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ html })
    });
    if (res.ok) {
      const data = await res.json();
      setSpamScore(data.score);
      setSpamWords(data.found_words);
    }
  };
  
  const selectTemplateB = (tmpl) => {
    setTemplateB(tmpl);
    toast.success(`A/B Testi için Şablon B olarak seçildi: ${tmpl}`);
  };

  const deleteTemplate = async (tmpl) => {
    if(!window.confirm("Silmek istediğinize emin misiniz?")) return;
    const res = await fetch(`${API_BASE}/templates/delete?template=${tmpl}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    if(res.ok) {
      toast.success("Şablon silindi.");
      fetchTemplates();
    }
  };

  const renameTemplate = async (tmpl) => {
    const newName = window.prompt("Yeni isim (örn: yeni-sablon.html):", tmpl);
    if (!newName) return;
    const res = await fetch(`${API_BASE}/templates/rename`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ old_name: tmpl, new_name: newName })
    });
    if(res.ok) {
      toast.success("Şablon yeniden adlandırıldı.");
      fetchTemplates();
    }
  };

  const saveEditedTemplate = async () => {
    const targetTemplate = previewMode === 'A' ? status.active_template : templateB;
    const res = await fetch(`${API_BASE}/templates/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ template: targetTemplate, html: editHtml })
    });
    if(res.ok) {
      toast.success("Şablon kaydedildi!");
      setIsEditingTemplate(false);
      setPreviewHtml(editHtml);
    } else {
      toast.error("Kaydetme başarısız!");
    }
  };

  const sendTestMail = async () => {
    const targetTemplate = previewMode === 'A' ? status.active_template : templateB;
    if (!targetTemplate) return;
    const email = window.prompt("Test e-postası kime gönderilsin?");
    if (!email) return;
    const res = await fetch(`${API_BASE}/templates/test_send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ template: targetTemplate, email })
    });
    if(res.ok) toast.success("Test maili gönderildi.");
    else toast.error("Gönderim başarısız.");
  };

  const downloadReport = async () => {
    const res = await fetch(`${API_BASE}/download`, { headers: { 'Authorization': `Bearer ${token}` } });
    if(res.ok) {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = status.active_file ? status.active_file.replace("../", "") : "rapor.xlsx";
      a.click();
    } else alert("İndirilecek aktif dosya bulunamadı.");
  };

  const toggleContactStatus = async (contact) => {
    if(status.is_running) return;
    
    // Eğer şu an tikliyse (İptal değil ve Gönderildi değil), tiki kaldır (İptal yap)
    // Eğer şu an tiksizse (İptal veya Gönderildi ise), tikle (Boş yap, yani Bekliyor)
    const isChecked = contact.status !== 'İptal' && contact.status !== 'Gönderildi';
    const newStatus = isChecked ? 'İptal' : '';
    
    // Optimistic UI Update
    setContacts(contacts.map(c => c.id === contact.id ? { ...c, status: newStatus } : c));
    
    try {
      const res = await fetch(`${API_BASE}/contacts/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ id: contact.id, status: newStatus })
      });
      if(!res.ok) {
        toast.error("Durum güncellenemedi.");
        fetchContacts(); // Revert on backend error
      }
    } catch (err) {
      console.error(err);
      toast.error("Ağ hatası.");
      fetchContacts(); // Revert on failure
    }
  };

  const deleteContact = async (contact) => {
    if(status.is_running) return;
    if(!window.confirm(`${contact.email} adresini listeden (ve varsa havuzdan) tamamen silmek istediğinize emin misiniz?`)) return;

    try {
      const res = await fetch(`${API_BASE}/contacts/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ id: contact.id })
      });
      if(res.ok) {
        toast.success("Kişi başarıyla silindi.");
        fetchContacts();
      } else {
        const data = await res.json();
        toast.error(data.detail || "Silinemedi.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Ağ hatası.");
    }
  };

  const toggleAll = async (cancelAll) => {
    if(status.is_running) return;
    alert("Bu işlem biraz sürebilir, lütfen bekleyin...");
    const targetStatus = cancelAll ? 'İptal' : '';
    
    for (let contact of filteredContacts) {
      if (contact.status === 'Gönderildi') continue;
      if (contact.status !== targetStatus) {
         const res = await fetch(`${API_BASE}/contacts/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ id: contact.id, status: targetStatus })
        });
        if(!res.ok) {
           toast.error("Bazı kişiler güncellenemedi.");
           break;
        }
      }
    }
    fetchContacts();
    toast.success("Toplu işlem tamamlandı.");
  };

  if (!token) {
    return (
      <div className="glass-container" style={{justifyContent: 'center', alignItems: 'center'}}>
        <Toaster position="top-right" toastOptions={{style: {background: '#333', color: '#fff'}}} />
        <div className="glass-card" style={{width: '400px', textAlign: 'center'}}>
          <div className="logo" style={{marginBottom: '2rem'}}>
            <h1 style={{fontSize: '32px'}}>ALTIKOD</h1>
            <span>DIGITAL SOLUTIONS</span>
          </div>
          <form onSubmit={handleLogin} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            <input type="text" placeholder="Kullanıcı Adı" 
              style={{padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white'}}
              value={loginForm.username} onChange={e => setLoginForm({...loginForm, username: e.target.value})} />
            <input type="password" placeholder="Şifre" 
              style={{padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white'}}
              value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} />
            <button type="submit" className="btn btn-primary" style={{marginTop: '1rem'}}>Sisteme Giriş Yap</button>
          </form>
        </div>
      </div>
    );
  }

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const filteredContacts = contacts.filter(c => {
    const searchMatch = c.email.toLowerCase().includes(searchTerm.toLowerCase()) || c.brand.toLowerCase().includes(searchTerm.toLowerCase());
    let filterMatch = true;
    if (contactFilter === 'Gönderildi') filterMatch = c.status === 'Gönderildi';
    else if (contactFilter === 'İptal') filterMatch = c.status === 'İptal';
    else if (contactFilter === 'Bekliyor') filterMatch = c.status !== 'Gönderildi' && c.status !== 'İptal' && !(c.status || '').startsWith('Hata');
    else if (contactFilter === 'Hata') filterMatch = (c.status || '').startsWith('Hata');
    return searchMatch && filterMatch;
  });

  return (
    <div className="glass-container">
      <Toaster position="top-right" toastOptions={{style: {background: '#333', color: '#fff', border: '1px solid #444'}, success: {iconTheme: {primary: '#4ADE80', secondary: '#333'}}}} />
      <aside className="sidebar">
        <div className="logo">
          <h1>ALTIKOD</h1>
          <span>DIGITAL SOLUTIONS</span>
        </div>
        <nav className="nav-menu">
          <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <span className="icon">📊</span> Gösterge Paneli
          </button>
          <button className={`nav-item ${activeTab === 'templates' ? 'active' : ''}`} onClick={() => setActiveTab('templates')}>
            <span style={{fontSize: '1.2rem'}}>🎨</span> Şablonlar
          </button>
          <button className={`nav-item ${activeTab === 'contacts' ? 'active' : ''}`} onClick={() => setActiveTab('contacts')}>
            <span style={{fontSize: '1.2rem'}}>👥</span> Kişi Listesi
          </button>
          <button className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
            <span style={{fontSize: '1.2rem'}}>📂</span> Kampanya Geçmişi
          </button>
          <button className={`nav-item ${activeTab === 'blacklist' ? 'active' : ''}`} onClick={() => setActiveTab('blacklist')} style={{color: activeTab === 'blacklist' ? 'white' : 'var(--danger-color)'}}>
            <span style={{fontSize: '1.2rem'}}>🚫</span> Kara Liste
          </button>
          <button className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <span style={{fontSize: '1.2rem'}}>⚙️</span> Ayarlar
          </button>
          <a onClick={handleLogout} style={{marginTop: 'auto', color: 'var(--danger-color)', cursor: 'pointer'}}>🚪 Çıkış Yap</a>
        </nav>
      </aside>

      <main className="content">
        {activeTab === 'dashboard' && (
          <>
            <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
              <h2>Toplu Gönderim Panosu</h2>
              <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                <div className={`status-badge ${status.current_status === 'Waiting' ? 'Waiting' : status.current_status}`}>
                  {status.current_status === 'Waiting' ? `Bekleniyor (${formatTime(status.wait_seconds_remaining)})` : status.current_status}
                </div>
                {status.is_running && <span className="pulse-indicator"></span>}
              </div>
            </header>

            {historyList.length > 0 && (
              <section className="glass-card" style={{marginBottom: '1.5rem', padding: '1.5rem'}}>
                <h3 style={{marginBottom: '1rem', color: '#9AA3B5', fontSize: '15px'}}>Kampanya Performans Trendi</h3>
                <div style={{height: '250px', width: '100%'}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historyList.slice(-10)} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="date" stroke="#9AA3B5" fontSize={12} tickFormatter={(tick) => tick.split(' ')[0]} />
                      <YAxis stroke="#9AA3B5" fontSize={12} />
                      <Tooltip contentStyle={{background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff'}} />
                      <Legend />
                      <Line type="monotone" dataKey="total_sent" name="Gönderilen" stroke="#4ADE80" strokeWidth={3} dot={{r: 4}} />
                      <Line type="monotone" dataKey="open_count" name="Açılan" stroke="#60A5FA" strokeWidth={3} dot={{r: 4}} />
                      <Line type="monotone" dataKey="click_count" name="Tıklanan" stroke="#C084FC" strokeWidth={3} dot={{r: 4}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}

            <section className="stats-grid">
              <div className="stat-card glass-card" style={{cursor: 'pointer', transition: 'transform 0.2s'}} onClick={() => { setContactFilter('Gönderildi'); setActiveTab('contacts'); }}>
                <h3>Gönderilen</h3>
                <div className="value success">{status.total_sent}</div>
              </div>
              <div className="stat-card glass-card" style={{cursor: 'pointer', transition: 'transform 0.2s'}} onClick={() => { setContactFilter('Bekliyor'); setActiveTab('contacts'); }}>
                <h3>Bekleyen</h3>
                <div className="value warning">{status.pending}</div>
              </div>
              <div className="stat-card glass-card" style={{cursor: 'pointer', transition: 'transform 0.2s'}} onClick={() => { setContactFilter('Hata'); setActiveTab('contacts'); }}>
                <h3>Hatalı / Atlanan</h3>
                <div className="value danger">{status.total_failed}</div>
              </div>
            </section>

            <section className="glass-card" style={{padding: '1.5rem'}}>
              <h3 style={{marginBottom: '1rem', color: '#9AA3B5', fontSize: '14px'}}>Kampanya İlerleme Durumu</h3>
              <div style={{width: '100%', height: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', overflow: 'hidden', display: 'flex', border: '1px solid var(--glass-border)'}}>
                {(() => {
                  const total = (status.total_sent || 0) + (status.pending || 0) + (status.total_failed || 0);
                  if (total === 0) return <div style={{width: '100%', background: 'transparent'}} />;
                  const pSent = ((status.total_sent / total) * 100).toFixed(1);
                  const pFail = ((status.total_failed / total) * 100).toFixed(1);
                  const pPend = ((status.pending / total) * 100).toFixed(1);
                  return (
                    <>
                      <div style={{width: `${pSent}%`, background: '#4ADE80', transition: 'width 0.5s ease'}} title={`Gönderilen: ${pSent}%`} />
                      <div style={{width: `${pPend}%`, background: '#FACC15', transition: 'width 0.5s ease'}} title={`Bekleyen: ${pPend}%`} />
                      <div style={{width: `${pFail}%`, background: '#EF4444', transition: 'width 0.5s ease'}} title={`Hata/Atlanan: ${pFail}%`} />
                    </>
                  );
                })()}
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '12px', color: '#666'}}>
                <span><span style={{color: '#4ADE80'}}>●</span> Başarılı</span>
                <span><span style={{color: '#FACC15'}}>●</span> Bekleyen</span>
                <span><span style={{color: '#EF4444'}}>●</span> Hatalı/Atlanan</span>
              </div>
            </section>

            <section className="controls glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="settings-panel" style={{ display: 'flex', gap: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#9AA3B5' }}>Kaçarlı Mail?</label>
                  <input type="number" value={batchSize} onChange={(e) => setBatchSize(e.target.value)} disabled={status.is_running}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '8px', borderRadius: '6px', width: '100px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#9AA3B5' }}>Bekleme (Dk)</label>
                  <input type="number" value={waitMinutes} onChange={(e) => setWaitMinutes(e.target.value)} disabled={status.is_running}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '8px', borderRadius: '6px', width: '100px' }} />
                </div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#9AA3B5' }}>İleri Tarihe Zamanla</label>
                  <input type="datetime-local" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} disabled={status.is_running || (status.current_status && status.current_status.startsWith('Zamanlandı'))}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '8px', borderRadius: '6px', width: '200px' }} />
                </div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#9AA3B5' }}>Gönderim (Örn: 09:00 - 18:00)</label>
                  <div style={{display: 'flex', gap: '4px'}}>
                    <input type="time" title="Başlama Saati" value={settings.work_start_time || ''} onChange={(e) => setSettings({...settings, work_start_time: e.target.value})} disabled={status.is_running}
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '8px', borderRadius: '6px', width: '100px' }} />
                    <span style={{color: '#9AA3B5', alignSelf: 'center'}}>-</span>
                    <input type="time" title="Mola Saati" value={settings.work_end_time || ''} onChange={(e) => setSettings({...settings, work_end_time: e.target.value})} disabled={status.is_running}
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '8px', borderRadius: '6px', width: '100px' }} />
                  </div>
                </div>
                <div style={{display: 'flex', alignItems: 'flex-end'}}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#9AA3B5', padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', height: '37px', boxSizing: 'border-box' }}>
                    <input type="checkbox" checked={warmupMode} onChange={(e) => setWarmupMode(e.target.checked)} disabled={status.is_running || (status.current_status && status.current_status.startsWith('Zamanlandı'))} />
                    🔥 Isıtma Modu
                  </label>
                </div>
              </div>

              <div className="action-panel">
                <div>
                  <h3>Aktif Durum</h3>
                  {status.active_file ? <p style={{color: '#4ADE80'}}>✓ Liste: {status.active_file.replace("../", "")}</p> : <p style={{color: 'var(--danger-color)'}}>X Liste Yüklenmedi</p>}
                  {status.active_template ? <p style={{color: '#4ADE80'}}>✓ Şablon A: {status.active_template}</p> : <p style={{color: 'var(--danger-color)'}}>X Şablon A Seçilmedi</p>}
                  {templateB && <p style={{color: '#C084FC'}}>✓ Şablon B (A/B Testi): {templateB}</p>}
                </div>
                <div className="buttons">
                  <input type="file" accept=".xlsx" ref={fileInputRef} onChange={handleFileUpload} style={{display: 'none'}} />
                  <button className="upload-btn" onClick={() => fileInputRef.current.click()} disabled={status.is_running || (status.current_status && status.current_status.startsWith('Zamanlandı'))}>📁 Excel Yükle</button>
                  <button className="upload-btn" onClick={downloadReport}>⬇️ Rapor İndir</button>
                  <button className="btn btn-primary" onClick={startCampaign} disabled={status.is_running || (status.current_status && status.current_status.startsWith('Zamanlandı'))}>
                    {scheduledTime ? '⏰ Zamanla' : '🚀 Başlat'}
                  </button>
                  <button className="btn btn-danger" onClick={stopCampaign} disabled={!status.is_running && !(status.current_status && status.current_status.startsWith('Zamanlandı'))}>
                    {(status.current_status && status.current_status.startsWith('Zamanlandı')) ? '🛑 İptal Et' : '⏹️ Durdur'}
                  </button>
                  {status.is_paused ? (
                    <button className="btn" style={{background: '#4ADE80', color: '#1e1e2e', border: 'none', fontWeight: 'bold'}} onClick={resumeCampaign} disabled={!status.is_running}>▶️ Devam Et</button>
                  ) : (
                    <button className="btn" style={{background: '#FACC15', color: '#1e1e2e', border: 'none', fontWeight: 'bold'}} onClick={pauseCampaign} disabled={!status.is_running || (status.current_status && status.current_status.startsWith('Zamanlandı'))}>⏸️ Duraklat</button>
                  )}
                </div>
              </div>
            </section>

            <section className="logs glass-card" style={{flex: 1}}>
              <h3>Canlı Gönderim Kayıtları</h3>
              <div className="log-container">
                {status.logs.map((log, i) => <div key={i} className="log-entry">{log}</div>)}
              </div>
            </section>
          </>
        )}

        {activeTab === 'contacts' && (
          <div className="glass-card" style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem'}}>
              <h2>Kişi Listesi ve Seçim ({filteredContacts.filter(c => c.status !== 'İptal' && c.status !== 'Gönderildi').length} Seçili / {filteredContacts.length} Toplam)</h2>
              <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                <div style={{background: 'rgba(96, 165, 250, 0.1)', border: '1px solid #60A5FA', padding: '8px 16px', borderRadius: '6px', color: '#60A5FA'}}>
                  <strong>🗂️ Kalıcı Havuz:</strong> {poolCount} Kişi
                </div>
                <input type="file" accept=".xlsx" id="poolUpload" onChange={handlePoolUpload} style={{display: 'none'}} />
                <button className="btn" style={{background: 'rgba(255,255,255,0.1)', color: 'white'}} onClick={() => document.getElementById('poolUpload').click()}>
                  + Havuza Excel Ekle
                </button>
                <button className="btn btn-primary" onClick={usePool} disabled={poolCount === 0 || status.is_running}>
                  Havuzu Kullan
                </button>
              </div>
            </div>
            
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem'}}>
              <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
                <input 
                  type="text" 
                  placeholder="Geçerli Listede Ara..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{padding: '8px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white'}}
                />
                <select 
                  value={contactFilter} 
                  onChange={e => setContactFilter(e.target.value)}
                  style={{padding: '8px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', outline: 'none'}}
                >
                  <option value="Hepsi" style={{color: '#1e1e2e'}}>Tümü</option>
                  <option value="Gönderildi" style={{color: '#1e1e2e'}}>Gönderilenler</option>
                  <option value="Bekliyor" style={{color: '#1e1e2e'}}>Bekleyenler</option>
                  <option value="Hata" style={{color: '#1e1e2e'}}>Hatalı Olanlar</option>
                  <option value="İptal" style={{color: '#1e1e2e'}}>İptal Edilenler</option>
                </select>
              </div>
              <div style={{display: 'flex', gap: '1rem'}}>
                <button className="btn btn-primary" onClick={() => toggleAll(false)} disabled={status.is_running}>Hepsini Seç</button>
                <button className="btn btn-danger" onClick={() => toggleAll(true)} disabled={status.is_running}>Seçimi Kaldır</button>
              </div>
            </div>
            
            <div style={{overflowY: 'auto', flex: 1, background: 'rgba(0,0,0,0.2)', borderRadius: '8px'}}>
              <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
                <thead style={{background: 'rgba(255,255,255,0.05)', position: 'sticky', top: 0}}>
                  <tr>
                    <th style={{padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>Gönderilsin mi?</th>
                    <th style={{padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>E-Posta</th>
                    <th style={{padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>Marka</th>
                    <th style={{padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>Site</th>
                    <th style={{padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>Durum</th>
                    <th style={{padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'right'}}>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.map(c => (
                    <tr key={c.id} style={{borderBottom: '1px solid rgba(255,255,255,0.05)', opacity: c.status === 'Gönderildi' ? 0.5 : 1}}>
                      <td style={{padding: '12px'}}>
                        <input 
                          type="checkbox" 
                          checked={c.status !== 'İptal' && c.status !== 'Gönderildi'} 
                          disabled={status.is_running}
                          onChange={() => toggleContactStatus(c)}
                          style={{width: '18px', height: '18px', cursor: 'pointer'}}
                        />
                      </td>
                      <td style={{padding: '12px'}}>{c.email}</td>
                      <td style={{padding: '12px'}}>{c.brand}</td>
                      <td style={{padding: '12px'}}>{c.site}</td>
                      <td style={{padding: '12px'}}>
                        {c.status === 'Gönderildi' && <span style={{color: '#4ADE80'}}>Gönderildi</span>}
                        {c.status === 'İptal' && <span style={{color: 'var(--danger-color)'}}>Atlanacak (İptal)</span>}
                        {!c.status && <span style={{color: 'white'}}>Bekliyor</span>}
                      </td>
                      <td style={{padding: '12px', textAlign: 'right'}}>
                        <button 
                          className="btn" 
                          style={{padding: '6px 10px', fontSize: '13px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', border: '1px solid rgba(239, 68, 68, 0.2)'}}
                          onClick={() => deleteContact(c)}
                          disabled={status.is_running}
                          title="Sil"
                        >
                          🗑️ Sil
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredContacts.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{padding: '2rem', textAlign: 'center', color: '#9AA3B5'}}>Gösterilecek kişi bulunamadı. Lütfen Excel dosyası yükleyin.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="glass-card" style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem'}}>
              <h2>Şablon Yöneticisi</h2>
              <div style={{display: 'flex', gap: '1rem'}}>
                <button className="btn" style={{background: 'linear-gradient(45deg, #C084FC, #60A5FA)', color: 'white', border: 'none', fontWeight: 'bold'}} onClick={() => setIsAiModalOpen(true)}>
                  ✨ Yapay Zeka ile Üret
                </button>
                <input type="file" accept=".html" ref={templateInputRef} onChange={handleTemplateUpload} style={{display: 'none'}} />
                <button className="btn btn-primary" onClick={() => templateInputRef.current.click()}>
                  + Yeni Şablon (HTML) Yükle
                </button>
              </div>
            </div>

            {isAiModalOpen && (
              <div style={{background: 'rgba(0,0,0,0.7)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(5px)'}}>
                <div className="glass-card" style={{width: '500px', padding: '2rem', background: 'rgba(20, 24, 39, 0.95)', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)'}}>
                  <h3 style={{marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>✨ AI Şablon Üretici (Beta)</h3>
                  <p style={{color: '#9AA3B5', fontSize: '14px', marginBottom: '1rem'}}>Şablonun içeriğini veya amacını yazın. AI sizin için dakikalar içinde modern bir şablon kodlayacaktır.</p>
                  <textarea 
                    placeholder="Örn: Yazılım ajansımız için indirim kampanyası duyurusu, koyu mavi tonlarında kurumsal bir tasarım..."
                    value={aiPrompt}
                    onChange={e => setAiPrompt(e.target.value)}
                    style={{width: '100%', height: '100px', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px', marginBottom: '1rem', resize: 'none'}}
                  />
                  <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem'}}>
                    <button className="btn" style={{background: 'rgba(255,255,255,0.1)', color: 'white'}} onClick={() => setIsAiModalOpen(false)}>İptal</button>
                    <button className="btn btn-primary" style={{background: 'linear-gradient(45deg, #C084FC, #60A5FA)', border: 'none'}} onClick={generateAiTemplate} disabled={!aiPrompt || isGenerating}>
                      {isGenerating ? 'Üretiliyor...' : 'Şablonu Oluştur'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div style={{display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem', flex: 1}}>
              <div>
                <h3 style={{marginBottom: '1rem', color: '#9AA3B5'}}>Mevcut Şablonlar</h3>
                <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                  {templates.map(t => (
                    <div key={t} style={{padding: '1rem', background: status.active_template === t ? 'rgba(241, 74, 58, 0.2)' : 'rgba(255,255,255,0.05)', borderRadius: '8px', border: status.active_template === t ? '1px solid var(--primary-color)' : '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <span style={{wordBreak: 'break-all', fontSize: '13px'}}>{t}</span>
                      <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end'}}>
                        <button className="btn" style={{padding: '6px', fontSize: '12px', background: 'rgba(255,255,255,0.1)', color: 'white'}} onClick={() => renameTemplate(t)} title="Yeniden Adlandır">✏️</button>
                        <button className="btn" style={{padding: '6px', fontSize: '12px', background: 'rgba(255,255,255,0.1)', color: 'white'}} onClick={() => deleteTemplate(t)} title="Sil">🗑️</button>
                        <button className="btn btn-primary" style={{padding: '6px 12px', fontSize: '12px'}} onClick={() => selectTemplate(t)}>Şablon A Yap</button>
                        <button className="btn" style={{padding: '6px 12px', fontSize: '12px', background: templateB === t ? 'rgba(192, 132, 252, 0.2)' : 'rgba(255,255,255,0.1)', color: templateB === t ? '#C084FC' : 'white', border: templateB === t ? '1px solid #C084FC' : '1px solid transparent'}} onClick={() => selectTemplateB(t)}>Şablon B Yap</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{display: 'flex', flexDirection: 'column'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                    <h3 style={{color: '#9AA3B5'}}>
                      {isEditingTemplate ? `Kod Düzenleniyor: ${previewMode === 'A' ? status.active_template : templateB}` : `Canlı Önizleme: ${previewMode === 'A' ? status.active_template : templateB}`}
                    </h3>
                    {!isEditingTemplate && (status.active_template || templateB) && (
                      <div style={{display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', padding: '2px'}}>
                        <button 
                          className="btn" 
                          style={{padding: '4px 12px', fontSize: '12px', background: previewMode === 'A' ? 'rgba(255,255,255,0.1)' : 'transparent', color: previewMode === 'A' ? 'white' : '#9AA3B5', outline: 'none', border: 'none'}} 
                          onClick={() => setPreviewMode('A')}
                        >
                          Şablon A
                        </button>
                        <button 
                          className="btn" 
                          style={{padding: '4px 12px', fontSize: '12px', background: previewMode === 'B' ? 'rgba(255,255,255,0.1)' : 'transparent', color: previewMode === 'B' ? 'white' : '#9AA3B5', opacity: templateB ? 1 : 0.5, outline: 'none', border: 'none'}} 
                          onClick={() => { if(templateB) setPreviewMode('B'); else toast.error('Önce soldan bir şablonu A/B Testi için B Şablonu olarak seçmelisiniz.'); }}
                        >
                          Şablon B
                        </button>
                      </div>
                    )}
                  </div>
                  {(previewMode === 'A' ? status.active_template : templateB) && (
                    <div style={{display: 'flex', gap: '0.5rem'}}>
                      {isEditingTemplate ? (
                        <>
                          <button className="btn" style={{background: 'rgba(255,255,255,0.1)', color: 'white'}} onClick={() => {setIsEditingTemplate(false); setEditHtml(previewHtml);}}>İptal</button>
                          <button className="btn btn-primary" onClick={saveEditedTemplate}>Kaydet</button>
                        </>
                      ) : (
                        <>
                          <button className="btn" style={{background: 'rgba(74, 222, 128, 0.2)', color: '#4ADE80', border: '1px solid rgba(74, 222, 128, 0.3)'}} onClick={sendTestMail}>Kendime Test Maili Gönder</button>
                          <button className="btn btn-primary" onClick={() => setIsEditingTemplate(true)}>Kodu Düzenle</button>
                        </>
                      )}
                    </div>
                  )}
                </div>
                
                {spamScore !== null && !isEditingTemplate && (
                  <div style={{marginBottom: '1rem', padding: '1rem', borderRadius: '8px', background: spamScore > 80 ? 'rgba(74, 222, 128, 0.1)' : spamScore > 50 ? 'rgba(250, 204, 21, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: `1px solid ${spamScore > 80 ? '#4ADE80' : spamScore > 50 ? '#FACC15' : '#EF4444'}`}}>
                    <h4 style={{color: spamScore > 80 ? '#4ADE80' : spamScore > 50 ? '#FACC15' : '#EF4444', marginBottom: '0.5rem'}}>🤖 AI Spam Analiz Skoru: {spamScore}/100</h4>
                    {spamWords.length > 0 ? (
                      <p style={{fontSize: '13px', color: '#9AA3B5'}}>Dikkat, şu spam kelimeler tespit edildi: <strong style={{color: 'white'}}>{spamWords.join(", ")}</strong>. E-postanızın gereksiz klasörüne düşmemesi için bu kelimeleri azaltmayı düşünebilirsiniz.</p>
                    ) : (
                      <p style={{fontSize: '13px', color: '#9AA3B5'}}>Harika! Metniniz temiz ve spam filtrelere takılma ihtimali düşük.</p>
                    )}
                  </div>
                )}

                <div style={{flex: 1, background: 'white', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--glass-border)', display: 'flex'}}>
                  {isEditingTemplate ? (
                    <textarea 
                      value={editHtml} 
                      onChange={e => {
                        setEditHtml(e.target.value);
                        if (e.target.value.length % 20 === 0) checkSpamScore(e.target.value); // canlı analiz
                      }} 
                      style={{width: '100%', height: '100%', padding: '1rem', border: 'none', background: '#1e1e1e', color: '#d4d4d4', fontFamily: 'monospace', resize: 'none', outline: 'none'}}
                      spellCheck="false"
                    />
                  ) : previewHtml ? (
                    <iframe 
                      title="HTML Preview"
                      srcDoc={previewHtml}
                      style={{width: '100%', height: '100%', border: 'none'}}
                    />
                  ) : (
                    <div style={{padding: '2rem', textAlign: 'center', color: '#666', width: '100%'}}>
                      Önizleme yükleniyor veya şablon seçilmedi...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="glass-card" style={{maxWidth: '1000px', margin: '0 auto', width: '100%'}}>
            <h2 style={{marginBottom: '2rem'}}>📂 Kampanya Geçmişi</h2>
            <div style={{overflowY: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: '8px'}}>
              <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
                <thead style={{background: 'rgba(255,255,255,0.05)'}}>
                  <tr>
                    <th style={{padding: '12px'}}>Kampanya</th>
                    <th style={{padding: '12px'}}>Tarih</th>
                    <th style={{padding: '12px'}}>Şablon</th>
                    <th style={{padding: '12px'}}>Liste Dosyası</th>
                    <th style={{padding: '12px'}}>Gönderilen</th>
                    <th style={{padding: '12px'}}>Hata</th>
                    <th style={{padding: '12px'}}>Açılma</th>
                    <th style={{padding: '12px'}}>Tıklama</th>
                    <th style={{padding: '12px'}}>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {historyList.map((hist, i) => (
                    <tr key={i} style={{borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
                      <td style={{padding: '12px'}}><strong>{hist.campaign_name || hist.campaign_id}</strong></td>
                      <td style={{padding: '12px'}}>{hist.date}</td>
                      <td style={{padding: '12px'}}>{hist.template}</td>
                      <td style={{padding: '12px'}}>{hist.file}</td>
                      <td style={{padding: '12px', color: '#4ADE80', fontWeight: 'bold'}}>{hist.total_sent}</td>
                      <td style={{padding: '12px', color: '#EF4444', fontWeight: 'bold'}}>{hist.total_failed}</td>
                      <td style={{padding: '12px', color: '#60A5FA', fontWeight: 'bold'}}>{hist.open_count || 0}</td>
                      <td style={{padding: '12px', color: '#C084FC', fontWeight: 'bold'}}>{hist.click_count || 0}</td>
                      <td style={{padding: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                        <button onClick={() => downloadHistoryReport(hist.campaign_id, hist.file)} style={{background: 'rgba(74,222,128,0.1)', border: 'none', color: 'var(--success-color)', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px'}}>Rapor</button>
                        <button onClick={() => renameHistory(hist.campaign_id, hist.campaign_name)} style={{background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px'}}>Adlandır</button>
                        <button onClick={() => deleteHistory(hist.campaign_id)} style={{background: 'rgba(248,113,113,0.1)', border: 'none', color: 'var(--danger-color)', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px'}}>Sil</button>
                      </td>
                    </tr>
                  ))}
                  {historyList.length === 0 && (
                    <tr>
                      <td colSpan="9" style={{padding: '2rem', textAlign: 'center', color: '#9AA3B5'}}>Henüz tamamlanmış bir kampanya bulunmuyor.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'blacklist' && (
          <div className="glass-card" style={{maxWidth: '800px', margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column'}}>
            <h2 style={{marginBottom: '1rem', color: 'var(--danger-color)'}}>🚫 Kara Liste (Unsubscribe)</h2>
            <p style={{color: '#9AA3B5', marginBottom: '2rem'}}>Bu listedeki e-posta adreslerine, Excel dosyanızda olsalar dahi gönderim yapılmaz. Şablonlarınızda <code>{"{{"}unsubscribe_link{"}}"}</code> etiketini kullandığınızda, listeden çıkmak isteyenler otomatik olarak buraya eklenir.</p>
            
            <div style={{display: 'flex', gap: '1rem', marginBottom: '2rem'}}>
              <input 
                type="text" 
                placeholder="E-Posta adresi ekle..." 
                value={blacklistInput}
                onChange={(e) => setBlacklistInput(e.target.value)}
                style={{flex: 1, padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white'}}
              />
              <button className="btn btn-primary" onClick={addToBlacklist}>Kara Listeye Ekle</button>
            </div>

            <div style={{flex: 1, background: 'rgba(0,0,0,0.2)', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
              {blacklist.length > 0 ? (
                <ul style={{listStyle: 'none', padding: 0, margin: 0, overflowY: 'auto', flex: 1}}>
                  {blacklist.map(email => (
                    <li key={email} style={{padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <span style={{color: '#d4d4d4'}}>{email}</span>
                      <button className="btn" style={{padding: '6px 12px', fontSize: '12px', background: 'rgba(255,0,0,0.2)', color: '#ff4d4d', border: '1px solid rgba(255,0,0,0.3)'}} onClick={() => removeFromBlacklist(email)}>
                        Kaldır
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div style={{padding: '3rem', textAlign: 'center', color: '#666'}}>Kara liste şu an boş.</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="glass-card" style={{maxWidth: '800px', margin: '0 auto', width: '100%'}}>
            <h2 style={{marginBottom: '2rem'}}>SMTP ve Genel Ayarlar</h2>
            <div style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
              
              {/* Genel Ayarlar */}
              <div style={{background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)'}}>
                <h3 style={{marginBottom: '1rem', color: '#9AA3B5'}}>Genel Kampanya Ayarları</h3>
                <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                  <div>
                    <label style={{display: 'block', marginBottom: '8px', color: '#9AA3B5'}}>Varsayılan E-Posta Konusu</label>
                    <input type="text" value={settings.subject || ''} onChange={e => setSettings({...settings, subject: e.target.value})} style={{width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white'}} />
                  </div>
                  
                  <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
                    <div style={{flex: 1}}>
                      <label style={{display: 'block', marginBottom: '8px', color: '#9AA3B5'}}>Otomatik Gönderim Başlama (Örn: 09:00)</label>
                      <input type="time" value={settings.work_start_time || ''} onChange={e => setSettings({...settings, work_start_time: e.target.value})} style={{width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none'}} />
                    </div>
                    <div style={{flex: 1}}>
                      <label style={{display: 'block', marginBottom: '8px', color: '#9AA3B5'}}>Otomatik Mola Saati (Örn: 18:00)</label>
                      <input type="time" value={settings.work_end_time || ''} onChange={e => setSettings({...settings, work_end_time: e.target.value})} style={{width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none'}} />
                    </div>
                  </div>
                  <p style={{fontSize: '12px', color: '#666', marginTop: '-0.5rem'}}>* Bu aralık dışında sistem aktif gönderimdeyse otomatik duraklar ve Mola'ya girer. Boş bırakırsanız molasız 7/24 gönderir.</p>
                </div>
              </div>

              {/* SMTP Hesapları */}
              <div>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                  <h3 style={{color: '#9AA3B5'}}>SMTP Hesapları (Rotasyon)</h3>
                  <button className="btn" style={{background: 'rgba(74, 222, 128, 0.2)', color: '#4ADE80', border: '1px solid rgba(74, 222, 128, 0.3)'}} onClick={() => {
                    const accs = settings.smtp_accounts || [];
                    setSettings({...settings, smtp_accounts: [...accs, {smtp_server: '', smtp_port: 465, smtp_email: '', smtp_password: '', sender_name: '', sender_email: ''}]});
                  }}>+ Yeni Hesap Ekle</button>
                </div>
                
                <p style={{color: '#666', fontSize: '13px', marginBottom: '1.5rem'}}>Sistem, eklediğiniz hesaplar arasında sırayla geçiş yaparak gönderim yapar. Bu, spam filtrelerine takılmanızı engeller.</p>

                <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                  {(settings.smtp_accounts || []).map((acc, index) => (
                    <div key={index} style={{background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative'}}>
                      <button className="btn" style={{position: 'absolute', top: '1rem', right: '1rem', padding: '6px 12px', fontSize: '12px', background: 'rgba(255,0,0,0.2)', color: '#ff4d4d'}} onClick={() => {
                        const accs = [...settings.smtp_accounts];
                        accs.splice(index, 1);
                        setSettings({...settings, smtp_accounts: accs});
                      }}>Hesabı Sil</button>
                      
                      <h4 style={{marginBottom: '1rem', color: 'white'}}>Hesap #{index + 1}</h4>
                      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem'}}>
                        <div>
                          <label style={{display: 'block', marginBottom: '8px', color: '#9AA3B5', fontSize: '13px'}}>SMTP Sunucusu</label>
                          <input type="text" value={acc.smtp_server} onChange={e => {
                            const accs = [...settings.smtp_accounts]; accs[index].smtp_server = e.target.value; setSettings({...settings, smtp_accounts: accs});
                          }} style={{width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white'}} />
                        </div>
                        <div>
                          <label style={{display: 'block', marginBottom: '8px', color: '#9AA3B5', fontSize: '13px'}}>Port</label>
                          <input type="number" value={acc.smtp_port} onChange={e => {
                            const accs = [...settings.smtp_accounts]; accs[index].smtp_port = parseInt(e.target.value); setSettings({...settings, smtp_accounts: accs});
                          }} style={{width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white'}} />
                        </div>
                      </div>
                      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem'}}>
                        <div>
                          <label style={{display: 'block', marginBottom: '8px', color: '#9AA3B5', fontSize: '13px'}}>SMTP Kullanıcı Adı</label>
                          <input type="text" value={acc.smtp_email} onChange={e => {
                            const accs = [...settings.smtp_accounts]; accs[index].smtp_email = e.target.value; setSettings({...settings, smtp_accounts: accs});
                          }} style={{width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white'}} />
                        </div>
                        <div>
                          <label style={{display: 'block', marginBottom: '8px', color: '#9AA3B5', fontSize: '13px'}}>SMTP Şifre</label>
                          <input type="password" value={acc.smtp_password} onChange={e => {
                            const accs = [...settings.smtp_accounts]; accs[index].smtp_password = e.target.value; setSettings({...settings, smtp_accounts: accs});
                          }} style={{width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white'}} />
                        </div>
                      </div>
                      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                        <div>
                          <label style={{display: 'block', marginBottom: '8px', color: '#9AA3B5', fontSize: '13px'}}>Gönderen Görünen Adı</label>
                          <input type="text" value={acc.sender_name} onChange={e => {
                            const accs = [...settings.smtp_accounts]; accs[index].sender_name = e.target.value; setSettings({...settings, smtp_accounts: accs});
                          }} style={{width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white'}} />
                        </div>
                        <div>
                          <label style={{display: 'block', marginBottom: '8px', color: '#9AA3B5', fontSize: '13px'}}>Gönderen E-Posta Adresi</label>
                          <input type="text" value={acc.sender_email} onChange={e => {
                            const accs = [...settings.smtp_accounts]; accs[index].sender_email = e.target.value; setSettings({...settings, smtp_accounts: accs});
                          }} style={{width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white'}} />
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!settings.smtp_accounts || settings.smtp_accounts.length === 0) && (
                    <div style={{padding: '2rem', textAlign: 'center', color: '#9AA3B5', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '8px'}}>
                      Henüz hiç SMTP hesabı eklenmemiş. Lütfen "+ Yeni Hesap Ekle" butonuna tıklayarak hesap ekleyin.
                    </div>
                  )}
                </div>
              </div>

              <hr style={{borderColor: 'var(--glass-border)', margin: '1rem 0'}} />
              
              <button className="btn btn-primary" onClick={saveSettings} style={{padding: '1rem', fontSize: '1.1rem'}}>Tüm Ayarları Kaydet</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
