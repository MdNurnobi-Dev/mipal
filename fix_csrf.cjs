const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'if (!isXhr && !req.headers[\'x-csrf-token\']) {\n         // return res.status(403).json({ error: "CSRF token missing or invalid" });\n      }',
  'if (!isXhr && !req.headers[\'x-csrf-token\']) {\n         return res.status(403).json({ error: "CSRF token missing or invalid" });\n      }'
);

fs.writeFileSync('server.ts', code);
