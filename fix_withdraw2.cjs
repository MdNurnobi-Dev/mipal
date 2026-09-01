const fs = require('fs');
let code = fs.readFileSync('src/pages/Withdraw.tsx', 'utf8');

code = code.replace(
  "{siteSettings?.currency || 'amount}",
  "{siteSettings?.currency || '$'}${amount}"
);
code = code.replace(
  "{siteSettings?.currency || 'balance.toFixed(2)}",
  "{siteSettings?.currency || '$'}{balance.toFixed(2)}"
);
code = code.replace(
  "{siteSettings?.currency || '.00",
  "{siteSettings?.currency || '$'}10.00"
);

fs.writeFileSync('src/pages/Withdraw.tsx', code);
