const fs = require('fs');
let code = fs.readFileSync('src/pages/Auth.tsx', 'utf8');

const startIdx = code.indexOf('export default function Auth()');
const firstBlockEnd = code.indexOf('    </div>\n  );\n}', startIdx);

if (firstBlockEnd !== -1) {
    let newCode = code.slice(0, firstBlockEnd + 17);
    fs.writeFileSync('src/pages/Auth.tsx', newCode);
    console.log("Truncated Auth.tsx");
}
