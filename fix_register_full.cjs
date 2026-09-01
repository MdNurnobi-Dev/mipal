const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const newRegisterUser = `
  const registerUser = async (userData: { name: string; email: string; password?: string; referralCode?: string }) => {
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (data.success) {
        // Refresh data to get the new user and updated referrer
        fetch('/api/data').then(r => r.json()).then(newData => {
          if (newData.users) setUsers(newData.users);
          if (newData.transactions) setTransactions(newData.transactions);
        });
        return { success: true, message: 'Account created successfully.' };
      }
      return { success: false, message: data.error || 'Registration failed.' };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  };
`;

const lines = code.split('\n');
const startIdx = lines.findIndex(l => l.includes('const registerUser = '));
let endIdx = -1;
for (let i = startIdx + 1; i < lines.length; i++) {
  if (lines[i].includes('const loginUser = async')) {
    endIdx = i - 1;
    break;
  }
}

if (startIdx !== -1 && endIdx !== -1) {
  lines.splice(startIdx, endIdx - startIdx, newRegisterUser.trim() + '\n\n');
  fs.writeFileSync('src/context/AppContext.tsx', lines.join('\n'));
} else {
  console.log("Could not find bounds", startIdx, endIdx);
}
