const fs = require('fs');
let code = fs.readFileSync('src/pages/Auth.tsx', 'utf8');

code = code.replace(
  "{siteSettings?.currency || ' welcome bonus</strong>",
  "{siteSettings?.currency || '$'}{newUserBonus.toFixed(2)} welcome bonus</strong>"
);

fs.writeFileSync('src/pages/Auth.tsx', code);
