const fs = require('fs');
let code = fs.readFileSync('src/pages/Withdraw.tsx', 'utf8');

code = code.replace(/\{siteSettings\?\.currency \|\| '\s*\n\s*<\/div>/g, "{siteSettings?.currency || '$'}{currentUser.balance.toFixed(2)}</div>");
code = code.replace(/\{siteSettings\?\.currency \|\| '\s*\n\s*<\/p>/g, "{siteSettings?.currency || '$'}10.00</p>");

fs.writeFileSync('src/pages/Withdraw.tsx', code);
