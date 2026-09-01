const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

code = code.replace("fetch('/api/me').then", "fetch('/api/me', { credentials: 'include' }).then");
code = code.replace("fetch('/api/data').then", "fetch('/api/data', { credentials: 'include' }).then");

fs.writeFileSync('src/context/AppContext.tsx', code);
