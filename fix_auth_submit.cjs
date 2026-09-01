const fs = require('fs');
let code = fs.readFileSync('src/pages/Auth.tsx', 'utf8');

code = code.replace(
  '  const handleSubmit = (e: React.FormEvent) => {\n    e.preventDefault();',
  '  const handleSubmit = async (e: React.FormEvent) => {\n    e.preventDefault();'
);

code = code.replace(
  'const res = registerUser({',
  'const res = await registerUser({'
);

fs.writeFileSync('src/pages/Auth.tsx', code);
