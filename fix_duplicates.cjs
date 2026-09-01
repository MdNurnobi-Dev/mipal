const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

code = code.replace(/credentials: 'include',\s*credentials: 'include'/g, "credentials: 'include'");

fs.writeFileSync('src/context/AppContext.tsx', code);
