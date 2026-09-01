const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const registerApi = `
  app.post("/api/register", async (req, res) => {
    const { name, email, password, referralCode } = req.body;
    try {
      const allUsers = await db.select().from(users);
      if (allUsers.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        return res.status(400).json({ error: "An account with this email already exists." });
      }

      const generatedReferralCode = (name.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'USER') + Math.floor(1000 + Math.random() * 9000);
      const today = new Date().toISOString().split('T')[0];
      const nowDateTime = new Date().toISOString().replace('T', ' ').substring(0, 16);

      let initialBalance = 0;
      let referrerUser;
      if (referralCode) {
        referrerUser = allUsers.find(u => u.referralCode?.toUpperCase() === referralCode.trim().toUpperCase());
      }

      // Fetch referral settings
      const allSettings = await db.select().from(settings);
      const refSettingsRow = allSettings.find(s => s.key === 'referralSettings');
      const referralSettings = refSettingsRow ? refSettingsRow.value : { newUserBonusAmount: 1.00, referrerBonusAmount: 2.50 };

      if (referrerUser) {
        initialBalance += (referralSettings.newUserBonusAmount ?? 1.00);
        const referrerBonus = referralSettings.referrerBonusAmount ?? 2.50;
        
        await db.update(users).set({ 
          balance: referrerUser.balance + referrerBonus,
          referralEarnings: (referrerUser.referralEarnings || 0) + referrerBonus
        }).where(eq(users.id, referrerUser.id));

        await db.insert(transactions).values({
          id: \`TXN-\${Math.floor(Math.random() * 90000) + 10000}\`,
          userId: referrerUser.id,
          userName: referrerUser.name,
          type: 'referral_bonus',
          amount: referrerBonus,
          method: 'System',
          date: nowDateTime,
          status: 'approved',
          userDetails: \`Bonus for referring \${name}\`
        });
      }

      const newUserId = (Date.now() + Math.floor(Math.random() * 1000)).toString();
      const newUser = {
        id: newUserId,
        name,
        email,
        password: password || '',
        balance: initialBalance,
        status: 'Active',
        joined: today,
        dailyEarned: 0,
        referralCode: generatedReferralCode,
        referredBy: referrerUser ? referrerUser.referralCode : undefined,
        avatar: \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${encodeURIComponent(name)}\`,
        notifications: { email: true, push: false }
      };

      await db.insert(users).values(newUser);

      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });
`;

code = code.replace('  app.post("/api/login", async (req, res) => {', registerApi + '\n  app.post("/api/login", async (req, res) => {');

fs.writeFileSync('server.ts', code);
