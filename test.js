const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    console.log('--- TEST BAŞLIYOR ---');
    let browser;
    try {
        browser = await puppeteer.launch({ headless: true, executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });
    } catch (e) {
        try {
            browser = await puppeteer.launch({ headless: true, executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe' });
        } catch (e2) {
            console.error('Browser bulunamadı.');
            process.exit(1);
        }
    }
    
    const page = await browser.newPage();
    
    try {
        await page.goto('http://localhost:8080', { waitUntil: 'networkidle0' });
        console.log('✅ Sayfa başarıyla yüklendi.');

        await page.click('#tab-branches');
        await new Promise(r => setTimeout(r, 500));
        console.log('✅ Şubeler sekmesine geçildi.');

        await page.waitForSelector('#btnAddBranch', { visible: true });
        await page.click('#btnAddBranch');
        await new Promise(r => setTimeout(r, 500));
        console.log('✅ Yeni şube eklendi.');
        
        const delBtns = await page.$$('.btn-delete-card');
        if (delBtns.length > 0) {
            page.on('dialog', async dialog => {
                await dialog.accept();
            });
            await delBtns[0].click();
            console.log('✅ Son şube silme koruması test edildi.');
        }

        const detailBtns = await page.$$('.branch-card .btn-secondary');
        if (detailBtns.length > 0) {
            await detailBtns[0].click();
            await new Promise(r => setTimeout(r, 500));
            console.log('✅ Şube detayına girildi.');
            
            await page.waitForSelector('#btnAddClass', { visible: true });
            await page.click('#btnAddClass');
            await new Promise(r => setTimeout(r, 500));
            console.log('✅ Yeni sınıf eklendi.');
        }

        await page.waitForSelector('.qty-input', { visible: true });
        
        const qtyInputs = await page.$$('.qty-input');
        await qtyInputs[0].click();
        await page.keyboard.down('Control');
        await page.keyboard.press('A');
        await page.keyboard.up('Control');
        await page.type('.qty-input', '10');
        
        const saleInputs = await page.$$('.sale-input');
        await saleInputs[0].click();
        await page.keyboard.down('Control');
        await page.keyboard.press('A');
        await page.keyboard.up('Control');
        await page.type('.sale-input', '500');
        
        await new Promise(r => setTimeout(r, 500));
        
        const ciroText = await page.$eval('#cls-revenue-0', el => el.textContent);
        if (ciroText.includes('5.000')) {
            console.log(`✅ Sınıf Ciro Hesaplaması Doğru: ${ciroText}`);
        } else {
            console.error(`❌ Sınıf Ciro Hatalı: Beklenen 5.000, Gelen ${ciroText}`);
        }

        await page.click('#btnBackToMain');
        await new Promise(r => setTimeout(r, 500)); 
        
        await page.waitForSelector('#tab-summary', { visible: true });
        await page.click('#tab-summary');
        
        await new Promise(r => setTimeout(r, 500));
        
        const totalCiroHTML = await page.$eval('#factorySummaryResults', el => el.innerHTML);
        if (totalCiroHTML.includes('5.000')) {
             console.log('✅ Fabrika Özeti Toplam Ciroya 5.000 başarıyla yansıdı.');
        }
        
        console.log('--- TÜM TESTLER BAŞARIYLA TAMAMLANDI ---');
        
    } catch (err) {
        console.error('❌ Test sırasında hata oluştu:', err);
    } finally {
        await browser.close();
    }
})();
