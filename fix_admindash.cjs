const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminDashboard.tsx', 'utf8');

code = code.replace(
  "value: `${siteSettings?.currency || ', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100', trend: '+5.4% this week' },",
  "value: `${siteSettings?.currency || '$'}45,230.50`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100', trend: '+5.4% this week' },"
);

fs.writeFileSync('src/pages/admin/AdminDashboard.tsx', code);
