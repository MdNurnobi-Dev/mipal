const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const seedRegex = /\/\/ Seed default user if empty[\s\S]*?allUsers = \[defaultUser as any\];\n      \}/;
code = code.replace(seedRegex, '');

fs.writeFileSync('server.ts', code);
