const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminDashboard.tsx', 'utf8');

code = code.replace(
  "{ title: 'Total Revenue', value: `${siteSettings?.currency || '\n    { title: 'Active Tasks',",
  "{ title: 'Total Revenue', value: `${siteSettings?.currency || '$'}45,230.50`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100', trend: '+5.4% this week' },\n    { title: 'Active Tasks',"
);

fs.writeFileSync('src/pages/admin/AdminDashboard.tsx', code);
