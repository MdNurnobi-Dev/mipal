const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminDashboard.tsx', 'utf8');

code = code.replace(
  "{ title: 'Total Revenue', value: `${siteSettings?.currency || '\n  return (",
  "{ title: 'Total Revenue', value: `${siteSettings?.currency || '$'}45,230.50`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100', trend: '+5.4% this week' },\n    { title: 'Active Tasks', value: '845', icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-100', trend: '+24 new today' },\n    { title: 'Pending Withdrawals', value: '14', icon: ArrowUpRight, color: 'text-amber-600', bg: 'bg-amber-100', trend: 'Requires attention' }\n  ];\n\n  return ("
);

fs.writeFileSync('src/pages/admin/AdminDashboard.tsx', code);
