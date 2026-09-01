const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// purchasePlan
code = code.replace(
  "bgMutate('users', 'update', userUpdates, currentUser.id);",
  "bgMutate('users', 'update', userUpdates, currentUser.id);\n    setCurrentUser(prev => prev ? { ...prev, ...userUpdates } : null);"
);

// completeTask
code = code.replace(
  "bgMutate('users', 'update', userUpdates, currentUser.id);\n    \n    const tx: Transaction = {",
  "bgMutate('users', 'update', userUpdates, currentUser.id);\n    setCurrentUser(prev => prev ? { ...prev, ...userUpdates } : null);\n    \n    const tx: Transaction = {"
);

// claimDailyReward (it's inside setUsers but then uses bgMutate)
code = code.replace(
  "        const updates = {\n          balance: u.balance + reward,\n          lastCheckInDate: today,\n          checkInStreak: newStreak\n        };\n        bgMutate('users', 'update', updates, currentUser.id);\n        return { ...u, ...updates };\n      }\n      return u;\n    }));",
  "        const updates = {\n          balance: u.balance + reward,\n          lastCheckInDate: today,\n          checkInStreak: newStreak\n        };\n        bgMutate('users', 'update', updates, currentUser.id);\n        setCurrentUser(prev => prev ? { ...prev, ...updates } : null);\n        return { ...u, ...updates };\n      }\n      return u;\n    }));"
);

// updateUserProfile
code = code.replace(
  "bgMutate('users', 'update', updates, id);\n  };",
  "bgMutate('users', 'update', updates, id);\n    if (currentUser?.id === id) {\n      setCurrentUser(prev => prev ? { ...prev, ...updates } : null);\n    }\n  };"
);


fs.writeFileSync('src/context/AppContext.tsx', code);
