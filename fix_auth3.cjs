const fs = require('fs');
let code = fs.readFileSync('src/pages/Auth.tsx', 'utf8');

code = code.replace(
  "<span>Referral Code Active! You will receive a <strong>{siteSettings?.currency || ' upon signing up.</span>",
  "<span>Referral Code Active! You will receive a <strong>{siteSettings?.currency || '$'}{newUserBonus.toFixed(2)} welcome bonus</strong> upon signing up.</span>"
);

fs.writeFileSync('src/pages/Auth.tsx', code);
