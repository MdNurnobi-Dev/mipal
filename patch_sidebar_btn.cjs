const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.tsx', 'utf-8');

const target = `        <div className="p-4 border-t border-slate-100 text-center bg-slate-50/50">
          <p className="text-[10px] font-medium text-slate-400">{siteSettings.siteName} v1.0.0</p>
        </div>`;

const replacement = `        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
          {siteSettings.mobileAppUrl && (
            <a 
              href={siteSettings.mobileAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98] group"
            >
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[11px] font-black tracking-wide leading-tight">Get the App</p>
                  <p className="text-[9px] text-indigo-100 font-medium">Download for Android</p>
                </div>
              </div>
              <Download className="w-4 h-4 text-white opacity-80 group-hover:opacity-100 group-hover:-translate-y-0.5 transition-all" />
            </a>
          )}
          <p className="text-[10px] font-medium text-slate-400 text-center">{siteSettings.siteName} v1.0.0</p>
        </div>`;

content = content.replace(target, replacement);
fs.writeFileSync('src/components/Layout.tsx', content);
console.log('Patched Layout');
