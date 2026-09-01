const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// CLAIM DAILY REWARD
const claimDailyRewardOld = `
  const claimDailyReward = () => {
    if (!currentUser) return { success: false, message: "Not logged in", reward: 0, streak: 0 };
    if (!dailyRewardSettings.isActive) {
      return { success: false, message: 'Daily rewards are currently disabled.', reward: 0, streak: 0 };
    }
    
    const today = new Date().toISOString().split('T')[0];
    if (currentUser.lastCheckInDate === today) {
      return { success: false, message: 'Already claimed today.', reward: 0, streak: currentUser.checkInStreak || 0 };
    }
    
    let currentStreak = currentUser.checkInStreak || 0;
    
    // Check if streak is broken (yesterday was not claimed)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (currentUser.lastCheckInDate !== yesterdayStr && currentUser.lastCheckInDate) {
      currentStreak = 0; // Reset streak
    }
    
    const reward = dailyRewardSettings.baseAmount + (Math.min(currentStreak, dailyRewardSettings.maxStreak) * dailyRewardSettings.streakBonus);
    
    // Update user
    const newStreak = currentStreak + 1;
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        const updates = {
          balance: u.balance + reward,
          lastCheckInDate: today,
          checkInStreak: newStreak
        };
        bgMutate('users', 'update', updates, currentUser.id);
        setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
        return {
          ...u,
          ...updates
        };
      }
      return u;
    }));
    
    // Add transaction
    const tx: Transaction = {
      id: \`tx-\${Date.now()}\`,
      userId: currentUser.id,
      userName: currentUser.name,
      type: 'daily_reward',
      amount: reward,
      method: 'System',
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'approved',
      userDetails: \`Day \${newStreak} Streak\`
    };
    
    setTransactions(prev => [tx, ...prev]);
    bgMutate('transactions', 'insert', tx);
    
    return { success: true, message: \`Claimed \${reward.toFixed(2)} for Day \${newStreak} streak!\`, reward, streak: newStreak };
  };
`;

const claimDailyRewardNew = `
  const claimDailyReward = () => {
    if (!currentUser) return { success: false, message: "Not logged in", reward: 0, streak: 0 };
    if (!dailyRewardSettings.isActive) {
      return { success: false, message: 'Daily rewards are currently disabled.', reward: 0, streak: 0 };
    }
    
    const today = new Date().toISOString().split('T')[0];
    if (currentUser.lastCheckInDate === today) {
      return { success: false, message: 'Already claimed today.', reward: 0, streak: currentUser.checkInStreak || 0 };
    }
    
    let currentStreak = currentUser.checkInStreak || 0;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    if (currentUser.lastCheckInDate !== yesterdayStr && currentUser.lastCheckInDate) {
      currentStreak = 0; 
    }
    const reward = dailyRewardSettings.baseAmount + (Math.min(currentStreak, dailyRewardSettings.maxStreak) * dailyRewardSettings.streakBonus);
    const newStreak = currentStreak + 1;
    
    // 1. Optimistic UI Update
    const prevUser = { ...currentUser };
    const updates = { balance: currentUser.balance + reward, lastCheckInDate: today, checkInStreak: newStreak };
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, ...updates } : u));
    setCurrentUser(prev => prev ? { ...prev, ...updates } : null);

    // 2. Server-side validation
    fetch('/api/rewards/claim', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
           // Sync perfectly with server values if needed, plus insert transaction
           setTransactions(prev => [data.transaction, ...prev]);
           setCurrentUser(prev => prev ? { ...prev, balance: data.balance, checkInStreak: data.streak, lastCheckInDate: data.lastCheckInDate } : null);
        } else {
           // Revert on failure
           setUsers(prev => prev.map(u => u.id === prevUser.id ? { ...u, ...prevUser } : u));
           setCurrentUser(prevUser);
           alert("Reward claim failed: " + data.error);
        }
      })
      .catch(err => {
         setUsers(prev => prev.map(u => u.id === prevUser.id ? { ...u, ...prevUser } : u));
         setCurrentUser(prevUser);
         alert("Network error claiming reward.");
      });
      
    return { success: true, message: \`Claimed \${reward.toFixed(2)} for Day \${newStreak} streak!\`, reward, streak: newStreak };
  };
`;

code = code.replace(claimDailyRewardOld.trim(), claimDailyRewardNew.trim());

// COMPLETE TASK
const completeTaskOld = `
  const completeTask = (amount: number, taskName: string) => {
    if (!currentUser) return { success: false, message: "Not logged in" };
    if (!currentUser.activePlanId) return { success: false, message: 'You need an active plan to earn from tasks.' };
    
    const plan = plans.find(p => p.id === currentUser.activePlanId);
    if (!plan) return { success: false, message: 'Active plan not found.' };
    
    const today = new Date().toISOString().split('T')[0];
    let currentDailyEarned = currentUser.dailyEarned || 0;
    
    if (currentUser.lastEarnedDate !== today) {
      currentDailyEarned = 0;
    }
    if (currentDailyEarned + amount > plan.dailyEarningLimit) {
      return { success: false, message: \`Daily earning limit of \${plan.dailyEarningLimit.toFixed(2)} reached for your plan.\` };
    }
    
    const userUpdates = {
      balance: currentUser.balance + amount,
      dailyEarned: currentDailyEarned + amount,
      lastEarnedDate: today
    };
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, ...userUpdates } : u));
    bgMutate('users', 'update', userUpdates, currentUser.id);
    setCurrentUser(prev => prev ? { ...prev, ...userUpdates } : null);
    
    const tx: Transaction = {
      id: \`TXN-\${Math.floor(Math.random() * 90000) + 10000}\`,
      userId: currentUser.id,
      userName: currentUser.name,
      type: 'task_earning',
      amount: amount,
      method: 'System',
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'approved',
      userDetails: taskName
    };
    setTransactions(prev => [tx, ...prev]);
    bgMutate('transactions', 'insert', tx);
    
    return { success: true, message: \`Completed \${taskName}! Earned \${amount.toFixed(2)}\` };
  };
`;

const completeTaskNew = `
  const completeTask = (amount: number, taskName: string) => {
    if (!currentUser) return { success: false, message: "Not logged in" };
    if (!currentUser.activePlanId) return { success: false, message: 'You need an active plan to earn from tasks.' };
    const plan = plans.find(p => p.id === currentUser.activePlanId);
    if (!plan) return { success: false, message: 'Active plan not found.' };
    
    const today = new Date().toISOString().split('T')[0];
    let currentDailyEarned = currentUser.dailyEarned || 0;
    if (currentUser.lastEarnedDate !== today) currentDailyEarned = 0;
    
    if (currentDailyEarned + amount > plan.dailyEarningLimit) {
      return { success: false, message: \`Daily earning limit of \${plan.dailyEarningLimit.toFixed(2)} reached.\` };
    }
    
    // 1. Optimistic UI Update
    const prevUser = { ...currentUser };
    const userUpdates = { balance: currentUser.balance + amount, dailyEarned: currentDailyEarned + amount, lastEarnedDate: today };
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, ...userUpdates } : u));
    setCurrentUser(prev => prev ? { ...prev, ...userUpdates } : null);

    // 2. Immediate Server-side Validation & DB persistence
    fetch('/api/tasks/complete', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, taskName })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
         setTransactions(prev => [data.transaction, ...prev]);
         setCurrentUser(prev => prev ? { ...prev, balance: data.balance, dailyEarned: data.dailyEarned, lastEarnedDate: data.lastEarnedDate } : null);
      } else {
         // Revert on failure
         setUsers(prev => prev.map(u => u.id === prevUser.id ? { ...u, ...prevUser } : u));
         setCurrentUser(prevUser);
         alert("Task completion failed: " + data.error);
      }
    })
    .catch(err => {
       setUsers(prev => prev.map(u => u.id === prevUser.id ? { ...u, ...prevUser } : u));
       setCurrentUser(prevUser);
       alert("Network error completing task.");
    });
    
    return { success: true, message: \`Completed \${taskName}! Earned \${amount.toFixed(2)}\` };
  };
`;

code = code.replace(completeTaskOld.trim(), completeTaskNew.trim());

fs.writeFileSync('src/context/AppContext.tsx', code);
