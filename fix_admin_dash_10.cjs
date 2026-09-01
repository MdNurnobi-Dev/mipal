const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminDashboard.tsx', 'utf8');

const targetStr = "{ title: 'Total Revenue'";
let idx = code.indexOf(targetStr);
if (idx !== -1) {
    let nextReturn = code.indexOf("  return (", idx);
    if (nextReturn !== -1) {
        code = code.substring(0, idx) + 
          "{ title: 'Total Revenue', value: `${siteSettings?.currency || '$'}45,230.50`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100', trend: '+5.4% this week' },\n    { title: 'Active Tasks', value: '845', icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-100', trend: '+24 new today' },\n    { title: 'Pending Withdrawals', value: '14', icon: ArrowUpRight, color: 'text-amber-600', bg: 'bg-amber-100', trend: 'Requires attention' }\n  ];\n\n" + 
          code.substring(nextReturn);
    }
}

fs.writeFileSync('src/pages/admin/AdminDashboard.tsx', code);
