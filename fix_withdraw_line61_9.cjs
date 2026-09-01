const fs = require('fs');
let code = fs.readFileSync('src/pages/Withdraw.tsx', 'utf8');

code = code.replace(
  "{siteSettings?.currency || ' className=\"block",
  "{siteSettings?.currency || '$'}{currentUser.balance.toFixed(2)}</div>\n        </div>\n      <form onSubmit={handleWithdraw} className=\"space-y-5 bg-white p-4 rounded-xl border border-slate-200 shadow-sm\">\n        <div>\n          <div className=\"flex justify-between items-center mb-1.5\">\n            <label className=\"block"
);

fs.writeFileSync('src/pages/Withdraw.tsx', code);
