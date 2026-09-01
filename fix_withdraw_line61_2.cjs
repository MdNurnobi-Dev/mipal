const fs = require('fs');
let code = fs.readFileSync('src/pages/Withdraw.tsx', 'utf8');

code = code.replace(
  "{siteSettings?.currency || '\n",
  "{siteSettings?.currency || '$'}{currentUser.balance.toFixed(2)}</div>\n</div>\n"
);

fs.writeFileSync('src/pages/Withdraw.tsx', code);
