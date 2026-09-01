const fs = require('fs');
let code = fs.readFileSync('src/pages/Deposit.tsx', 'utf8');

const endIdx = code.indexOf('  );\n}');
if (endIdx !== -1) {
    code = code.substring(0, endIdx + 6);
}

fs.writeFileSync('src/pages/Deposit.tsx', code);
