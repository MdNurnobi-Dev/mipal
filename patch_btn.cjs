const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.tsx', 'utf-8');

const target = `        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
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

const replacement = `        <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-2">
          {siteSettings.mobileAppUrl && (
            <a 
              href={siteSettings.mobileAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-lg text-indigo-700 transition-colors group"
            >
              <div className="flex items-center gap-2">
                <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-[10px] font-bold">Download App</span>
              </div>
              <Download className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:-translate-y-0.5 transition-all" />
            </a>
          )}
          <p className="text-[9px] font-medium text-slate-400 text-center pt-1">{siteSettings.siteName} v1.0.0</p>
        </div>`;

if(content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('src/components/Layout.tsx', content);
  console.log('Patched Layout button');
} else {
  console.log('Target not found in Layout.tsx');
}
