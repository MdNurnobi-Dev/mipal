const fs = require('fs');
let code = fs.readFileSync('src/pages/Auth.tsx', 'utf8');

const idx = code.indexOf("{siteSettings?.currency || '");
const idx2 = code.indexOf("          </div>", idx);

code = code.substring(0, idx) + "{siteSettings?.currency || '$'}{newUserBonus.toFixed(2)} welcome bonus</strong> upon signing up.</span>\n" + code.substring(idx2);

fs.writeFileSync('src/pages/Auth.tsx', code);
