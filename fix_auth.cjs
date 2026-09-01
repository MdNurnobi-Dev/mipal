const fs = require('fs');
let code = fs.readFileSync('src/pages/Auth.tsx', 'utf8');

code = code.replace(
  "{siteSettings?.currency || 'newUserBonus.toFixed(2)}",
  "{siteSettings?.currency || '$'}{newUserBonus.toFixed(2)}"
);

fs.writeFileSync('src/pages/Auth.tsx', code);
