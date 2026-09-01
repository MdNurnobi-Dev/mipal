const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

code = code.replace(
  "        bgMutate('users', 'update', { balance: newBalance }, tx.userId);\n      }",
  "        bgMutate('users', 'update', { balance: newBalance }, tx.userId);\n        if (currentUser?.id === tx.userId) {\n          setCurrentUser(prev => prev ? { ...prev, balance: newBalance } : null);\n        }\n      }"
);

fs.writeFileSync('src/context/AppContext.tsx', code);
