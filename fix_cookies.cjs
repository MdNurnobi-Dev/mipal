const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  "res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });",
  "res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });"
);

code = code.replace(
  "res.cookie('admin_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });",
  "res.cookie('admin_token', token, { httpOnly: true, secure: true, sameSite: 'none' });"
);

// also fix logout
code = code.replace(
  "res.clearCookie('token');",
  "res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'none' });"
);
code = code.replace(
  "res.clearCookie('admin_token');",
  "res.clearCookie('admin_token', { httpOnly: true, secure: true, sameSite: 'none' });"
);

fs.writeFileSync('server.ts', code);
