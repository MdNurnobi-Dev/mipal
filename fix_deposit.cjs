const fs = require('fs');
let code = fs.readFileSync('src/pages/Deposit.tsx', 'utf8');

const startIdx = code.indexOf('export default function Deposit()');
const firstBlockEnd = code.indexOf('    </div>\n  );\n}', startIdx);
let newCode = code.slice(0, firstBlockEnd + 17);

newCode = newCode.replace(/{siteSettings\?\.currency \|\| '/g, "{siteSettings?.currency || '$'}{");

fs.writeFileSync('src/pages/Deposit.tsx', newCode);
