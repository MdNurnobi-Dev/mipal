const fs = require('fs');
let code = fs.readFileSync('src/pages/Auth.tsx', 'utf8');

code = code.replace(
  "{siteSettings?.currency || '\n            </div>",
  "{siteSettings?.currency || '$'}{newUserBonus.toFixed(2)} welcome bonus</strong> upon signing up.</span>\n            </div>"
);

fs.writeFileSync('src/pages/Auth.tsx', code);
