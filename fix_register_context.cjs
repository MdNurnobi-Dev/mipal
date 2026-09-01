const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

code = code.replace(
  "registerUser: (userData: { name: string; email: string; password?: string; referralCode?: string }) => { success: boolean; message: string };",
  "registerUser: (userData: { name: string; email: string; password?: string; referralCode?: string }) => Promise<{ success: boolean; message: string }>;"
);

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

code = code.replace(/const registerUser = \([^{]*\) => \{[\s\S]*?(?=\n  const addGiveawayBanner)/, newRegisterUser.trim() + '\n\n');
fs.writeFileSync('src/context/AppContext.tsx', code);
