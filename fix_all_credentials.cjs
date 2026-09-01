const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// For any fetch that doesn't have credentials
code = code.replace(/fetch\('(\/api\/[a-zA-Z0-9_-]+)'\)/g, "fetch('$1', { credentials: 'include' })");
code = code.replace(/fetch\('(\/api\/[a-zA-Z0-9_-]+)',\s*{/g, "fetch('$1', { credentials: 'include',");

fs.writeFileSync('src/context/AppContext.tsx', code);
