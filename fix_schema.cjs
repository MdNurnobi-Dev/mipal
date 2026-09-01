const fs = require('fs');
let code = fs.readFileSync('src/db/schema.ts', 'utf8');

code = code.replace(
  'status: text("status").default("Active"),',
  'status: text("status").default("Active"),\n  role: text("role").default("user"),'
);

fs.writeFileSync('src/db/schema.ts', code);
