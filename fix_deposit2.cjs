const fs = require('fs');
let code = fs.readFileSync('src/pages/Deposit.tsx', 'utf8');

code = code.replace(
  "{siteSettings?.currency || '.00",
  "{siteSettings?.currency || '$'}10.00"
);

fs.writeFileSync('src/pages/Deposit.tsx', code);
