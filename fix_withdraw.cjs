const fs = require('fs');
let code = fs.readFileSync('src/pages/Withdraw.tsx', 'utf8');

// Find the first "export default function Withdraw()" and the first return ending tag.
const startIdx = code.indexOf('export default function Withdraw()');
const firstBlockEnd = code.indexOf('    </div>\n  );\n}', startIdx);

let newCode = code.slice(0, firstBlockEnd + 17); // + length of the closing brace

// Still need to fix the broken strings in it
newCode = newCode.replace(/{siteSettings\?\.currency \|\| '/g, "{siteSettings?.currency || '$'}{");

fs.writeFileSync('src/pages/Withdraw.tsx', newCode);
