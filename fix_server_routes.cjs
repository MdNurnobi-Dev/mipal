const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const newRoutes = `
  app.post("/api/tasks/complete", async (req, res) => {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ error: "Not logged in" });
    const { amount, taskName } = req.body;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const allUsers = await db.select().from(users);
      const user = allUsers.find(u => u.id === decoded.id);
      if (!user) return res.status(401).json({ error: "User not found" });
      if (!user.activePlanId) return res.status(400).json({ error: "No active plan" });

      const allPlans = await db.select().from(plans);
      const plan = allPlans.find(p => p.id === user.activePlanId);
      if (!plan) return res.status(400).json({ error: "Plan not found" });

      const today = new Date().toISOString().split('T')[0];
      let currentDailyEarned = user.dailyEarned || 0;
      if (user.lastEarnedDate !== today) currentDailyEarned = 0;

      if (currentDailyEarned + amount > plan.dailyEarningLimit) {
        return res.status(400).json({ error: \`Daily earning limit of \${plan.dailyEarningLimit.toFixed(2)} reached.\` });
      }

      const newBalance = user.balance + amount;
      const newDailyEarned = currentDailyEarned + amount;

      await db.update(users).set({ 
        balance: newBalance, 
        dailyEarned: newDailyEarned, 
        lastEarnedDate: today 
      }).where(eq(users.id, user.id));

      const txId = \`TXN-\${Math.floor(Math.random() * 90000) + 10000}\`;
      const tx = {
        id: txId,
        userId: user.id,
        userName: user.name,
        type: 'task_earning',
        amount: amount,
        method: 'System',
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'approved',
        userDetails: taskName
      };
      await db.insert(transactions).values(tx);

      res.json({ success: true, balance: newBalance, dailyEarned: newDailyEarned, lastEarnedDate: today, transaction: tx });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/rewards/claim", async (req, res) => {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ error: "Not logged in" });
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const allUsers = await db.select().from(users);
      const user = allUsers.find(u => u.id === decoded.id);
      if (!user) return res.status(401).json({ error: "User not found" });

      const allSettings = await db.select().from(settings);
      const rewardSettingsRow = allSettings.find(s => s.key === 'dailyRewardSettings');
      const dailyRewardSettings = rewardSettingsRow ? rewardSettingsRow.value : { isActive: true, baseAmount: 0.5, streakBonus: 0.1, maxStreak: 7 };

      if (!dailyRewardSettings.isActive) return res.status(400).json({ error: "Daily rewards disabled." });

      const today = new Date().toISOString().split('T')[0];
      if (user.lastCheckInDate === today) return res.status(400).json({ error: "Already claimed today." });

      let currentStreak = user.checkInStreak || 0;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (user.lastCheckInDate !== yesterdayStr && user.lastCheckInDate) {
        currentStreak = 0;
      }

      const reward = dailyRewardSettings.baseAmount + (Math.min(currentStreak, dailyRewardSettings.maxStreak) * dailyRewardSettings.streakBonus);
      const newStreak = currentStreak + 1;
      const newBalance = user.balance + reward;

      await db.update(users).set({
        balance: newBalance,
        lastCheckInDate: today,
        checkInStreak: newStreak
      }).where(eq(users.id, user.id));

      const tx = {
        id: \`TXN-\${Math.floor(Math.random() * 90000) + 10000}\`,
        userId: user.id,
        userName: user.name,
        type: 'daily_reward',
        amount: reward,
        method: 'System',
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'approved',
        userDetails: \`Day \${newStreak} Streak\`
      };
      await db.insert(transactions).values(tx);

      res.json({ success: true, balance: newBalance, streak: newStreak, lastCheckInDate: today, transaction: tx, reward });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });
`;

code = code.replace('  app.post("/api/mutate", async (req, res) => {', newRoutes + '\n  app.post("/api/mutate", async (req, res) => {');

fs.writeFileSync('server.ts', code);
