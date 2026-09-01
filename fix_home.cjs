const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

code = code.replace(
  "{siteSettings?.currency || 'earner.earnings.toFixed(2)}</span>",
  "{siteSettings?.currency || '$'}{earner.earnings.toFixed(2)}</span>"
);

fs.writeFileSync('src/pages/Home.tsx', code);
