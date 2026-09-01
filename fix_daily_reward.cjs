const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

code = code.replace(
  "        bgMutate('users', 'update', updates, currentUser.id);\n        return {\n          ...u,\n          ...updates\n        };\n      }\n      return u;\n    }));",
  "        bgMutate('users', 'update', updates, currentUser.id);\n        setCurrentUser(prev => prev ? { ...prev, ...updates } : null);\n        return {\n          ...u,\n          ...updates\n        };\n      }\n      return u;\n    }));"
);

fs.writeFileSync('src/context/AppContext.tsx', code);
