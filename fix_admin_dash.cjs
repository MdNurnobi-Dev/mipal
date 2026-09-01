const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminDashboard.tsx', 'utf8');

code = code.replace("'$45,230.50'", "\`\${siteSettings?.currency || '$'}45,230.50\`");

if (!code.includes('siteSettings')) {
  code = code.replace('const { users', 'const { siteSettings, users');
}

fs.writeFileSync('src/pages/admin/AdminDashboard.tsx', code);
