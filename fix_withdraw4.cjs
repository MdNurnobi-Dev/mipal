const fs = require('fs');
let code = fs.readFileSync('src/pages/Withdraw.tsx', 'utf8');

const idx = code.indexOf("alert(`Withdrawal request for ${siteSettings?.currency || '");
const idx2 = code.indexOf("      navigate('/wallet');", idx);

code = code.substring(0, idx) + "alert(`Withdrawal request for ${siteSettings?.currency || '$'}${amount} submitted successfully.`);\n" + code.substring(idx2);

fs.writeFileSync('src/pages/Withdraw.tsx', code);
