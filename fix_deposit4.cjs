const fs = require('fs');
let code = fs.readFileSync('src/pages/Deposit.tsx', 'utf8');

code = code.replace(
  "{siteSettings?.currency || '\n            </div>",
  "{siteSettings?.currency || '$'}10.00</p>\n            </div>"
);

fs.writeFileSync('src/pages/Deposit.tsx', code);
