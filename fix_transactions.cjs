const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// addTransaction
code = code.replace(
  "        bgMutate('users', 'update', { balance: user.balance - tx.amount }, tx.userId);\n      }",
  "        bgMutate('users', 'update', { balance: user.balance - tx.amount }, tx.userId);\n        if (currentUser?.id === tx.userId) {\n          setCurrentUser(prev => prev ? { ...prev, balance: prev.balance - tx.amount } : null);\n        }\n      }"
);

// approveTransaction deposit bonus referrer update
code = code.replace(
  "              bgMutate('users', 'update', { balance: newBal, referralEarnings: newRef }, referrer.id);\n              return { ...u, balance: newBal, referralEarnings: newRef };",
  "              bgMutate('users', 'update', { balance: newBal, referralEarnings: newRef }, referrer.id);\n              if (currentUser?.id === referrer.id) {\n                setCurrentUser(prev => prev ? { ...prev, balance: newBal, referralEarnings: newRef } : null);\n              }\n              return { ...u, balance: newBal, referralEarnings: newRef };"
);

// approveTransaction deposit user update
code = code.replace(
  "              bgMutate('users', 'update', { balance: newBalance }, tx.userId);\n              return { ...u, balance: newBalance };",
  "              bgMutate('users', 'update', { balance: newBalance }, tx.userId);\n              if (currentUser?.id === tx.userId) {\n                setCurrentUser(prev => prev ? { ...prev, balance: newBalance } : null);\n              }\n              return { ...u, balance: newBalance };"
);
// approveTransaction deposit user update fallback
code = code.replace(
  "          bgMutate('users', 'update', { balance: u.balance + tx.amount }, tx.userId);\n          return { ...u, balance: u.balance + tx.amount };",
  "          bgMutate('users', 'update', { balance: u.balance + tx.amount }, tx.userId);\n          if (currentUser?.id === tx.userId) {\n            setCurrentUser(prev => prev ? { ...prev, balance: prev.balance + tx.amount } : null);\n          }\n          return { ...u, balance: u.balance + tx.amount };"
);


// rejectTransaction
code = code.replace(
  "        bgMutate('users', 'update', { balance: user.balance + tx.amount }, tx.userId);\n      }",
  "        bgMutate('users', 'update', { balance: user.balance + tx.amount }, tx.userId);\n        if (currentUser?.id === tx.userId) {\n          setCurrentUser(prev => prev ? { ...prev, balance: prev.balance + tx.amount } : null);\n        }\n      }"
);


fs.writeFileSync('src/context/AppContext.tsx', code);
