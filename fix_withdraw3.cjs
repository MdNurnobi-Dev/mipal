const fs = require('fs');
let code = fs.readFileSync('src/pages/Withdraw.tsx', 'utf8');

const startIdx = code.indexOf('export default function Withdraw()');
const firstBlockEnd = code.indexOf('    </div>\n  );\n}', startIdx);

if (firstBlockEnd !== -1) {
    code = code.slice(0, firstBlockEnd + 17);
}

// Clean up ANY dangling `{siteSettings?.currency || '...`
code = code.replace(/alert\(\`Withdrawal request for \$\{siteSettings\?\.currency \|\| '[^\`]*\`\);/g, "alert(`Withdrawal request for ${siteSettings?.currency || '$'}${amount} submitted successfully.`);");

code = code.replace(/\{siteSettings\?\.currency \|\| '\}?<\/div>/g, "{siteSettings?.currency || '$'}{currentUser.balance.toFixed(2)}</div>");
code = code.replace(/\{siteSettings\?\.currency \|\| 'balance\.toFixed\(2\)\}<\/div>/g, "{siteSettings?.currency || '$'}{currentUser.balance.toFixed(2)}</div>");

code = code.replace(/\{siteSettings\?\.currency \|\| '\}?<\/p>/g, "{siteSettings?.currency || '$'}10.00</p>");

fs.writeFileSync('src/pages/Withdraw.tsx', code);
