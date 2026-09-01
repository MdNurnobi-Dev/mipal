const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// Replace local storage logic
code = code.replace(/function getInitialState\(key, defaultValue\) {[\s\S]*?}/m, `const bgMutate = (table: string, action: string, payload?: any, id?: string) => {
  fetch('/api/mutate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ table, action, payload, id })
  }).catch(console.error);
};

const bgSetting = (key: string, value: any) => {
  fetch('/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, value })
  }).catch(console.error);
};`);

// Replace initial states with empty/defaults to be filled by API
code = code.replace(/useState<SiteSettings>\(\(\) => \{[\s\S]*?\}\);/m, `useState<SiteSettings>(defaultSiteSettings);`);
code = code.replace(/useState<User\[\]>\(\(\) => getInitialState\('app_users', \[[\s\S]*?\]\)\);/m, `useState<User[]>([]);`);
code = code.replace(/useState<GiveawayBanner\[\]>\(\(\) => getInitialState\('app_giveawayBanners', \[[\s\S]*?\]\)\);/m, `useState<GiveawayBanner[]>([]);`);
code = code.replace(/useState<DailyRewardSettings>\(\(\) => getInitialState\('app_dailyRewardSettings', \{[\s\S]*?\}\)\);/m, `useState<DailyRewardSettings>({ isActive: true, baseAmount: 0.10, streakBonus: 0.05, maxStreak: 7 });`);
code = code.replace(/useState<ReferralSettings>\(\(\) => \{[\s\S]*?\}\);/m, `useState<ReferralSettings>({ referrerBonusAmount: 2.50, newUserBonusAmount: 1.00, depositBonusPercent: 5, taskEarningBonusPercentByPlan: { 'p1': 2, 'p2': 5, 'p3': 10 } });`);
code = code.replace(/useState<Task\[\]>\(\(\) => getInitialState\('app_tasks_v3', \[[\s\S]*?\]\)\);/m, `useState<Task[]>([]);`);
code = code.replace(/useState<Gateway\[\]>\(\(\) => getInitialState\('app_gateways', \[[\s\S]*?\]\)\);/m, `useState<Gateway[]>([]);`);
code = code.replace(/useState<Notification\[\]>\(\(\) => getInitialState\('app_notifications', \[\]\)\);/m, `useState<Notification[]>([]);`);
code = code.replace(/useState<NotificationSettings>\(\(\) => getInitialState\('app_notificationSettings', \{[\s\S]*?\}\)\);/m, `useState<NotificationSettings>({ depositAlerts: true, withdrawalAlerts: true, systemAlerts: true });`);
code = code.replace(/useState<Transaction\[\]>\(\(\) => getInitialState\('app_transactions', \[[\s\S]*?\]\)\);/m, `useState<Transaction[]>([]);`);
code = code.replace(/useState<Plan\[\]>\(\(\) => getInitialState\('app_plans', \[[\s\S]*?\]\)\);/m, `useState<Plan[]>([]);`);
code = code.replace(/useState<Post\[\]>\(\(\) => getInitialState\('app_posts', mockPosts\)\);/m, `useState<Post[]>([]);`);

// Remove localStorage useEffects
code = code.replace(/useEffect\(\(\) => \{ localStorage\.setItem\('app_site_settings', JSON\.stringify\(siteSettings\)\); \}, \[siteSettings\]\);/g, '');
code = code.replace(/useEffect\(\(\) => \{ localStorage\.setItem\('app_tasks_v3', JSON\.stringify\(tasks\)\); \}, \[tasks\]\);/g, '');
code = code.replace(/useEffect\(\(\) => \{ localStorage\.setItem\('app_posts', JSON\.stringify\(posts\)\); \}, \[posts\]\);/g, '');
code = code.replace(/useEffect\(\(\) => \{ localStorage\.setItem\('app_users', JSON\.stringify\(users\)\); \}, \[users\]\);/g, '');
code = code.replace(/useEffect\(\(\) => \{ localStorage\.setItem\('app_giveawayBanners', JSON\.stringify\(giveawayBanners\)\); \}, \[giveawayBanners\]\);/g, '');
code = code.replace(/useEffect\(\(\) => \{ localStorage\.setItem\('app_referralSettings', JSON\.stringify\(referralSettings\)\); \}, \[referralSettings\]\);/g, '');
code = code.replace(/useEffect\(\(\) => \{ localStorage\.setItem\('app_dailyRewardSettings', JSON\.stringify\(dailyRewardSettings\)\); \}, \[dailyRewardSettings\]\);/g, '');
code = code.replace(/useEffect\(\(\) => \{ localStorage\.setItem\('app_gateways', JSON\.stringify\(gateways\)\); \}, \[gateways\]\);/g, '');
code = code.replace(/useEffect\(\(\) => \{ localStorage\.setItem\('app_transactions', JSON\.stringify\(transactions\)\); \}, \[transactions\]\);/g, '');
code = code.replace(/useEffect\(\(\) => \{ localStorage\.setItem\('app_plans', JSON\.stringify\(plans\)\); \}, \[plans\]\);/g, '');

// Fetch initial data
const fetchHook = `
  useEffect(() => {
    fetch('/api/data').then(r => r.json()).then(data => {
      if(data.users) setUsers(data.users);
      if(data.posts) setPosts(data.posts);
      if(data.plans) setPlans(data.plans);
      if(data.tasks) setTasks(data.tasks);
      if(data.gateways) setGateways(data.gateways);
      if(data.transactions) setTransactions(data.transactions);
      if(data.notifications) setNotifications(data.notifications);
      if(data.settings) {
        if(data.settings.siteSettings) setSiteSettings(data.settings.siteSettings);
        if(data.settings.referralSettings) setReferralSettings(data.settings.referralSettings);
        if(data.settings.dailyRewardSettings) setDailyRewardSettings(data.settings.dailyRewardSettings);
        if(data.settings.notificationSettings) setNotificationSettings(data.settings.notificationSettings);
        if(data.settings.giveawayBanners) setGiveawayBanners(data.settings.giveawayBanners);
      }
    }).catch(console.error);
  }, []);
`;

// Insert the fetch hook inside AppProvider right before the first function
code = code.replace(/const updateSiteSettings = \(updates: Partial<SiteSettings>\) => \{/, fetchHook + '\n  const updateSiteSettings = (updates: Partial<SiteSettings>) => {');

// Add mutations to simple functions
code = code.replace(/const updateSiteSettings = \(updates: Partial<SiteSettings>\) => \{[\s\S]*?\};/, `const updateSiteSettings = (updates: Partial<SiteSettings>) => {
    const newSettings = { ...siteSettings, ...updates };
    setSiteSettings(newSettings);
    bgSetting('siteSettings', newSettings);
  };`);
  
code = code.replace(/const updateDailyRewardSettings = \(s: Partial<DailyRewardSettings>\) => setDailyRewardSettings\(prev => \(\{\.\.\.prev, \.\.\.s\}\)\);/, `const updateDailyRewardSettings = (s: Partial<DailyRewardSettings>) => {
    const newSettings = { ...dailyRewardSettings, ...s };
    setDailyRewardSettings(newSettings);
    bgSetting('dailyRewardSettings', newSettings);
  };`);
  
code = code.replace(/const updateReferralSettings = \(s: Partial<ReferralSettings>\) => setReferralSettings\(prev => \(\{\.\.\.prev, \.\.\.s\}\)\);/, `const updateReferralSettings = (s: Partial<ReferralSettings>) => {
    const newSettings = { ...referralSettings, ...s };
    setReferralSettings(newSettings);
    bgSetting('referralSettings', newSettings);
  };`);
  
code = code.replace(/const updateNotificationSettings = \(s: Partial<NotificationSettings>\) => setNotificationSettings\(prev => \(\{\.\.\.prev, \.\.\.s\}\)\);/, `const updateNotificationSettings = (s: Partial<NotificationSettings>) => {
    const newSettings = { ...notificationSettings, ...s };
    setNotificationSettings(newSettings);
    bgSetting('notificationSettings', newSettings);
  };`);

// For the rest of the mutations, we can sync the whole list to settings or send individual mutations.
// giveaway banners, we can save to settings
code = code.replace(/const addGiveawayBanner = .*?;/, `const addGiveawayBanner = (banner: Omit<GiveawayBanner, 'id'>) => {
    const newBanners = [...giveawayBanners, { ...banner, id: \`gb-\${Date.now()}\` }];
    setGiveawayBanners(newBanners);
    bgSetting('giveawayBanners', newBanners);
  };`);
code = code.replace(/const deleteGiveawayBanner = .*?;/, `const deleteGiveawayBanner = (id: string) => {
    const newBanners = giveawayBanners.filter(b => b.id !== id);
    setGiveawayBanners(newBanners);
    bgSetting('giveawayBanners', newBanners);
  };`);
code = code.replace(/const toggleGiveawayBanner = .*?;/, `const toggleGiveawayBanner = (id: string) => {
    const newBanners = giveawayBanners.map(b => b.id === id ? { ...b, isActive: !b.isActive } : b);
    setGiveawayBanners(newBanners);
    bgSetting('giveawayBanners', newBanners);
  };`);
  
// Tasks
code = code.replace(/const addTask = \(task: Omit<Task, 'id'>\) => \{[\s\S]*?\};/, `const addTask = (task: Omit<Task, 'id'>) => {
    const newTask = { ...task, id: \`t-\${Date.now()}\` };
    setTasks(prev => [newTask, ...prev]);
    bgMutate('tasks', 'insert', newTask);
  };`);
code = code.replace(/const updateTask = \(id: string, updates: Partial<Task>\) => \{[\s\S]*?\};/, `const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    bgMutate('tasks', 'update', updates, id);
  };`);
code = code.replace(/const deleteTask = \(id: string\) => \{[\s\S]*?\};/, `const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    bgMutate('tasks', 'delete', null, id);
  };`);
  
// Gateways
code = code.replace(/const addGateway = .*?;/, `const addGateway = (gw: Omit<Gateway, 'id'>) => {
    const newGw = { ...gw, id: \`gw-\${Date.now()}\` };
    setGateways(prev => [...prev, newGw]);
    bgMutate('gateways', 'insert', newGw);
  };`);
code = code.replace(/const updateGateway = .*?;/, `const updateGateway = (id: string, gw: Partial<Gateway>) => {
    setGateways(prev => prev.map(g => g.id === id ? { ...g, ...gw } : g));
    bgMutate('gateways', 'update', gw, id);
  };`);
code = code.replace(/const deleteGateway = .*?;/, `const deleteGateway = (id: string) => {
    setGateways(prev => prev.filter(g => g.id !== id));
    bgMutate('gateways', 'delete', null, id);
  };`);

// Plans
code = code.replace(/const addPlan = .*?;/, `const addPlan = (plan: Omit<Plan, 'id'>) => {
    const newPlan = { ...plan, id: \`p\${Date.now()}\` };
    setPlans(prev => [...prev, newPlan]);
    bgMutate('plans', 'insert', newPlan);
  };`);
code = code.replace(/const updatePlan = .*?;/, `const updatePlan = (id: string, plan: Partial<Plan>) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, ...plan } : p));
    bgMutate('plans', 'update', plan, id);
  };`);
code = code.replace(/const deletePlan = .*?;/, `const deletePlan = (id: string) => {
    setPlans(prev => prev.filter(p => p.id !== id));
    bgMutate('plans', 'delete', null, id);
  };`);

// Transactions
code = code.replace(/const addTransaction = \(tx: Omit<Transaction, 'id' | 'date' | 'status'>\) => \{[\s\S]*?if \(tx\.type === 'withdraw'\) \{[\s\S]*?\}[\s\S]*?\};/, `const addTransaction = (tx: Omit<Transaction, 'id' | 'date' | 'status'>) => {
    const newTx: Transaction = {
      ...tx,
      id: \`TXN-\${Math.floor(Math.random() * 90000) + 10000}\`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: tx.type === 'plan_purchase' || tx.type === 'task_earning' ? 'approved' : 'pending'
    };
    setTransactions(prev => [newTx, ...prev]);
    bgMutate('transactions', 'insert', newTx);
    
    if (tx.type === 'withdraw') {
      const user = users.find(u => u.id === tx.userId);
      if(user) {
        setUsers(prev => prev.map(u => u.id === tx.userId ? { ...u, balance: u.balance - tx.amount } : u));
        bgMutate('users', 'update', { balance: user.balance - tx.amount }, tx.userId);
      }
    }
  };`);
  
// Posts (simplified sync since they get complicated)
code = code.replace(/const approvePost = .*?;/, `const approvePost = (id: string) => { setPosts(prev => prev.map(p => p.id === id ? { ...p, status: 'approved' } : p)); bgMutate('posts', 'update', { status: 'approved' }, id); };`);
code = code.replace(/const rejectPost = .*?;/, `const rejectPost = (id: string) => { setPosts(prev => prev.map(p => p.id === id ? { ...p, status: 'rejected' } : p)); bgMutate('posts', 'update', { status: 'rejected' }, id); };`);
code = code.replace(/const deletePost = .*?;/, `const deletePost = (id: string) => { setPosts(prev => prev.filter(p => p.id !== id)); bgMutate('posts', 'delete', null, id); };`);
code = code.replace(/const addPost = \(post: Omit<Post, 'id' | 'createdAt' | 'likes' | 'comments' | 'shares' | 'status'>\) => \{[\s\S]*?\}\];\n  \};/, `const addPost = (post: Omit<Post, 'id' | 'createdAt' | 'likes' | 'comments' | 'shares' | 'status'>) => {
    const newPost: Post = {
      ...post,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: 0,
      shares: 0,
      status: 'pending',
      likedBy: [],
      commentsList: []
    };
    setPosts(prev => [newPost, ...prev]);
    bgMutate('posts', 'insert', newPost);
  };`);

// Write the file back
fs.writeFileSync('src/context/AppContext.tsx', code);
