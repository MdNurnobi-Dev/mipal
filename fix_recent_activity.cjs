const fs = require('fs');
let code = fs.readFileSync('src/components/RecentActivity.tsx', 'utf8');

const endIdx = code.indexOf('  );\n}');
if (endIdx !== -1) {
    code = code.substring(0, endIdx + 6);
}

code = code.replace(
  "const { transactions } = useApp();",
  "const { transactions, siteSettings } = useApp();"
);

code = code.replace(
  "const amountStr = `${siteSettings?.currency || '",
  "const amountStr = `${siteSettings?.currency || '$'}${tx.amount.toFixed(2)}`;"
);

fs.writeFileSync('src/components/RecentActivity.tsx', code);
