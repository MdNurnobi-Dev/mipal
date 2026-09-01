const fs = require('fs');
let code = fs.readFileSync('src/pages/Deposit.tsx', 'utf8');

const idx = code.indexOf("{siteSettings?.currency || '");
const endIdx = code.indexOf("          </div>", idx);

code = code.substring(0, idx) + "{siteSettings?.currency || '$'}10.00</p>\n" + code.substring(endIdx);

fs.writeFileSync('src/pages/Deposit.tsx', code);
