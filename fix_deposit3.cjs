const fs = require('fs');
let code = fs.readFileSync('src/pages/Deposit.tsx', 'utf8');

code = code.replace(
  "{siteSettings?.currency || '</p>",
  "{siteSettings?.currency || '$'}10.00</p>"
);

fs.writeFileSync('src/pages/Deposit.tsx', code);
