const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/AdminSettings.tsx', 'utf-8');

const t1 = `    supportPhone: siteSettings.supportPhone || '',
    whatsappNumber: siteSettings.whatsappNumber || siteSettings.whatsappUrl || '',
    telegramUrl: siteSettings.telegramUrl || '',`;
const r1 = `    supportPhone: siteSettings.supportPhone || '',
    whatsappNumber: siteSettings.whatsappNumber || siteSettings.whatsappUrl || '',
    telegramUrl: siteSettings.telegramUrl || '',
    mobileAppUrl: siteSettings.mobileAppUrl || '',`;

const t2 = `        supportPhone: siteSettings.supportPhone || '',
        whatsappNumber: siteSettings.whatsappNumber || siteSettings.whatsappUrl || '',
        telegramUrl: siteSettings.telegramUrl || '',`;
const r2 = `        supportPhone: siteSettings.supportPhone || '',
        whatsappNumber: siteSettings.whatsappNumber || siteSettings.whatsappUrl || '',
        telegramUrl: siteSettings.telegramUrl || '',
        mobileAppUrl: siteSettings.mobileAppUrl || '',`;

const t3 = `        whatsappNumber: formData.whatsappNumber.trim(),
        whatsappUrl: formData.whatsappNumber.trim(),
        telegramUrl: formData.telegramUrl.trim(),`;
const r3 = `        whatsappNumber: formData.whatsappNumber.trim(),
        whatsappUrl: formData.whatsappNumber.trim(),
        telegramUrl: formData.telegramUrl.trim(),
        mobileAppUrl: formData.mobileAppUrl?.trim() || '',`;

const t4 = `            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Telegram Support Channel / Link</label>`;
const r4 = `            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Mobile App APK URL</label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
                <input
                  type="text"
                  name="mobileAppUrl"
                  value={formData.mobileAppUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/app.apk"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Telegram Support Channel / Link</label>`;

content = content.replace(t1, r1);
content = content.replace(t2, r2);
content = content.replace(t3, r3);
content = content.replace(t4, r4);

fs.writeFileSync('src/pages/admin/AdminSettings.tsx', content);
console.log('Patched AdminSettings');
