import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import path from "path";
import compression from "compression";
import { createServer as createViteServer } from "vite";
import { db, ensureDatabaseIndexes } from "./src/db/db.js";
import { users, posts, plans, tasks, gateways, transactions, settings, notifications, postComments } from "./src/db/schema.js";
import { eq } from "drizzle-orm";
import { easyMathQuizQuestions } from "./src/data/mathQuizzes.js";
import { 
  bangladeshiSeedUsers, 
  bangladeshiSeedPosts, 
  bangladeshiSeedTransactions 
} from "./src/data/bangladeshiCommunitySeeds.js";

async function startServer() {
  // Ensure database indexes on high-frequency tables (users, tasks, transactions)
  await ensureDatabaseIndexes().catch((err) => {
    console.warn("Index verification notice:", err);
  });

  const app = express();
  
  // Enable high-performance HTTP compression (gzip/deflate) for all responses
  app.use(compression());
  
  app.use(cookieParser());
  const PORT = 3000;

  app.use(express.json());

  // In-memory caching for aggregated /api/data to eliminate database query stalls
  let cachedData: any = null;
  let cachedDataTimestamp = 0;
  const DATA_CACHE_TTL_MS = 3000; // 3-second cache window for high read throughput

  const invalidateDataCache = () => {
    cachedData = null;
    cachedDataTimestamp = 0;
  };

  // Data fetching API
  
  const JWT_SECRET = "super-secure-jwt-secret-key-123";

  // Security Middleware: CSRF and Session Token Validation
  app.use("/api", async (req, res, next) => {
    // Exclude public routes from auth
    const publicRoutes = ['/register', '/login', '/admin-login', '/data'];
    if (publicRoutes.includes(req.path)) {
      return next();
    }
    
    // CSRF Protection for state-changing methods
    if (req.method !== 'GET' && req.method !== 'OPTIONS') {
      const isXhr = req.headers['x-requested-with'] === 'XMLHttpRequest';
      // In a real app we might strictly require this, but for this preview we'll check if it's there or just rely on SameSite cookie policies + auth token.
      // To strictly enforce CSRF, we can check for custom header:
      if (!isXhr && !req.headers['x-csrf-token']) {
         return res.status(403).json({ error: "CSRF token missing or invalid" });
      }
    }

    // Session Validation
    const token = req.cookies?.token;
    const adminToken = req.cookies?.admin_token;
    
    if (req.path === '/me') {
      return next(); // /me handles its own token decoding
    }

    if (req.path === '/settings' || req.path === '/admin-only-action') {
       if (!adminToken) return res.status(401).json({ error: "Admin authentication required" });
       try {
         const decoded = jwt.verify(adminToken, JWT_SECRET) as any;
         if (decoded.role !== 'admin') return res.status(403).json({ error: "Admin access denied" });
       } catch(e) {
         return res.status(401).json({ error: "Invalid admin token" });
       }
       return next();
    }

    // For other routes (mutate, tasks, rewards), require user or admin token
    if (!token && !adminToken) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      if (token) jwt.verify(token, JWT_SECRET);
      if (adminToken) jwt.verify(adminToken, JWT_SECRET);
      next();
    } catch (e) {
      return res.status(401).json({ error: "Invalid session token" });
    }
  });



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
      if (referralCode && typeof referralCode === 'string') {
        referrerUser = allUsers.find(u => u.referralCode?.toUpperCase() === referralCode.trim().toUpperCase());
      }

      // Fetch referral settings
      const allSettings = await db.select().from(settings);
      const refSettingsRow = allSettings.find(s => s.key === 'referralSettings');
      const referralSettings = (refSettingsRow ? refSettingsRow.value : { newUserBonusAmount: 1.00, referrerBonusAmount: 2.50 }) as any;

      const newUserBonus = Number(referralSettings.newUserBonusAmount ?? 1.00);
      const referrerBonus = Number(referralSettings.referrerBonusAmount ?? 2.50);

      const newUserId = (Date.now() + Math.floor(Math.random() * 1000)).toString();

      if (referrerUser && referrerUser.id !== newUserId) {
        initialBalance += newUserBonus;
        
        // 1. Credit referrer balance and referralEarnings
        await db.update(users).set({ 
          balance: Number((referrerUser.balance + referrerBonus).toFixed(2)),
          referralEarnings: Number(((referrerUser.referralEarnings || 0) + referrerBonus).toFixed(2))
        }).where(eq(users.id, referrerUser.id));

        // 2. Insert transaction for referrer
        await db.insert(transactions).values({
          id: `TXN-${Math.floor(Math.random() * 90000) + 10000}`,
          userId: referrerUser.id,
          userName: referrerUser.name,
          type: 'referral_bonus',
          amount: referrerBonus,
          method: 'System',
          date: nowDateTime,
          status: 'approved',
          userDetails: `Referral bonus for inviting ${name}`
        });

        // 3. Insert notification for referrer
        await db.insert(notifications).values({
          id: `notif-${Date.now()}`,
          userId: referrerUser.id,
          title: 'New Referral Joined! 🎁',
          message: `${name} just joined using your referral code! You received a reward of ${referrerBonus}.`,
          type: 'system',
          date: new Date().toISOString(),
          isRead: false
        });
      }

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
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
        notifications: { email: true, push: false }
      };

      await db.insert(users).values(newUser);

      // 4. If new user received a welcome bonus, record transaction and notification for audit
      if (initialBalance > 0 && referrerUser) {
        await db.insert(transactions).values({
          id: `TXN-${Math.floor(Math.random() * 90000) + 10000}`,
          userId: newUserId,
          userName: name,
          type: 'referral_bonus',
          amount: initialBalance,
          method: 'System',
          date: nowDateTime,
          status: 'approved',
          userDetails: `Welcome Bonus (Referred by ${referrerUser.name})`
        });

        await db.insert(notifications).values({
          id: `notif-${Date.now() + 1}`,
          userId: newUserId,
          title: 'Welcome Referral Bonus! 🎉',
          message: `You received a welcome bonus of ${initialBalance} for joining through ${referrerUser.name}'s invitation!`,
          type: 'system',
          date: new Date().toISOString(),
          isRead: false
        });
      }

      invalidateDataCache();
      res.json({ success: true });
    } catch (e: any) {
      console.error("Registration error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/login", async (req, res) => {
    const { email, password, twoFactorCode } = req.body;
    try {
      const allUsers = await db.select().from(users);
      const user = allUsers.find(u => u.email === email && u.password === password);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      if (user.twoFactorEnabled) {
        if (!twoFactorCode) {
          return res.json({ requires2FA: true });
        }
        
        // Dynamic import speakeasy
        const speakeasy = (await import('speakeasy')).default || await import('speakeasy');
        const isValid = speakeasy.totp.verify({
          secret: user.twoFactorSecret || '',
          encoding: 'base32',
          token: twoFactorCode
        });
        
        if (!isValid) {
          return res.status(401).json({ error: "Invalid 2FA code" });
        }
      }

      const token = jwt.sign({ id: user.id, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
      res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
      res.json({ success: true, user: { ...user, password: '', twoFactorSecret: '' } });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/2fa/generate", async (req, res) => {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ error: "Not logged in" });
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const [user] = await db.select().from(users).where(eq(users.id, decoded.id)).limit(1);
      if (!user) return res.status(401).json({ error: "User not found" });

      const speakeasy = (await import('speakeasy')).default || await import('speakeasy');
      const secretObj = speakeasy.generateSecret({ length: 20, name: `Earnify (${user.email || 'User'})` });
      const secret = secretObj.base32;
      const otpauthUrl = secretObj.otpauth_url;

      // Save secret temporarily in db (or permanently, but only enable when verified)
      await db.update(users).set({ twoFactorSecret: secret }).where(eq(users.id, user.id));

      res.json({ success: true, secret, otpauthUrl });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/2fa/enable", async (req, res) => {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ error: "Not logged in" });
    const { code } = req.body;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const [user] = await db.select().from(users).where(eq(users.id, decoded.id)).limit(1);
      if (!user) return res.status(401).json({ error: "User not found" });

      const speakeasy = (await import('speakeasy')).default || await import('speakeasy');
      const isValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret || '',
        encoding: 'base32',
        token: code
      });
      if (!isValid) {
        return res.status(400).json({ error: "Invalid 2FA code" });
      }

      await db.update(users).set({ twoFactorEnabled: true }).where(eq(users.id, user.id));
      invalidateDataCache();
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/2fa/disable", async (req, res) => {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ error: "Not logged in" });
    const { code } = req.body;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const [user] = await db.select().from(users).where(eq(users.id, decoded.id)).limit(1);
      if (!user) return res.status(401).json({ error: "User not found" });

      const speakeasy = (await import('speakeasy')).default || await import('speakeasy');
      const isValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret || '',
        encoding: 'base32',
        token: code
      });
      if (!isValid) {
        return res.status(400).json({ error: "Invalid 2FA code" });
      }

      await db.update(users).set({ twoFactorEnabled: false, twoFactorSecret: null }).where(eq(users.id, user.id));
      invalidateDataCache();
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/admin-login", async (req, res) => {
    const { email, password } = req.body;
    try {
      const allUsers = await db.select().from(users);
      const user = allUsers.find(u => u.email === email && u.password === password);
      
      if (!user) {
        return res.status(401).json({ error: "Invalid admin credentials" });
      }
      
      if (user.role !== 'admin') {
        return res.status(403).json({ error: "Access denied. Admin role required." });
      }
      
      const token = jwt.sign({ id: user.id, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
      res.cookie('admin_token', token, { httpOnly: true, secure: true, sameSite: 'none' });
      return res.json({ success: true, user: { ...user, password: '' } });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/me", async (req, res) => {
    const token = req.cookies?.token;
    const adminToken = req.cookies?.admin_token;
    let currentUser = null;
    let isAdmin = false;

    if (adminToken) {
      try {
        const decoded = jwt.verify(adminToken, JWT_SECRET) as any;
        if (decoded.role === 'admin') {
          const [adminUser] = await db.select().from(users).where(eq(users.id, decoded.id)).limit(1);
          if (adminUser && adminUser.role === 'admin') {
            isAdmin = true;
          }
        }
      } catch (e) {}
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const [u] = await db.select().from(users).where(eq(users.id, decoded.id)).limit(1);
        if (u) {
          u.password = '';
          currentUser = u;
        }
      } catch (e) {}
    }

    res.json({ currentUser, isAdmin });
  });

  app.post("/api/logout", (req, res) => {
    res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'none' });
    res.clearCookie('admin_token', { httpOnly: true, secure: true, sameSite: 'none' });
    res.json({ success: true });
  });

  app.get("/api/data", async (req, res) => {
    try {
      // Return cached aggregate if within TTL to eliminate redundant queries
      if (cachedData && (Date.now() - cachedDataTimestamp < DATA_CACHE_TTL_MS)) {
        return res.json(cachedData);
      }

      // Execute high-frequency database table fetches in parallel to minimize dashboard latency
      const [
        allUsers,
        allPosts,
        allComments,
        rawPlans,
        allTasks,
        allGateways,
        allTransactions,
        allNotifications,
        allSettings
      ] = await Promise.all([
        db.select().from(users),
        db.select().from(posts),
        db.select().from(postComments),
        db.select().from(plans),
        db.select().from(tasks),
        db.select().from(gateways),
        db.select().from(transactions),
        db.select().from(notifications),
        db.select().from(settings),
      ]);

      // Strip sensitive password field in memory
      allUsers.forEach(u => { u.password = ""; });
      
      let allPlans = rawPlans;
      // Seed default plans if empty
      if (allPlans.length === 0) {
        const defaultPlans = [
          { id: 'p1', name: 'Starter Plan', price: 10, dailyEarningLimit: 0.5, durationDays: 30 },
          { id: 'p2', name: 'Pro Plan', price: 50, dailyEarningLimit: 3.0, durationDays: 30 },
          { id: 'p3', name: 'VIP Plan', price: 200, dailyEarningLimit: 15.0, durationDays: 30 },
        ];
        await db.insert(plans).values(defaultPlans);
        allPlans = defaultPlans as any;
      }

      let formattedGateways = allGateways;
      if (formattedGateways.length === 0) {
        const defaultGateways = [
          {
            id: 'gw-bkash-1',
            name: 'bKash Personal',
            type: 'manual',
            currency: 'BDT',
            minAmount: 100,
            maxAmount: 25000,
            charge: 0,
            instructions: 'Send Money to the bKash Personal number below.\n1. Dial *247# or open bKash App\n2. Select "Send Money"\n3. Enter the bKash Account Number: 01712345678\n4. Enter the exact Amount\n5. Enter Reference: Your Username / User ID\n6. Confirm with your PIN and copy the Transaction ID (TrxID)',
            details: 'Account Number: 01712345678\nAccount Type: Personal (Send Money)\nPayment Gateway: bKash Bangladesh',
            isActive: true
          },
          {
            id: 'gw-nagad-1',
            name: 'Nagad Personal',
            type: 'manual',
            currency: 'BDT',
            minAmount: 100,
            maxAmount: 25000,
            charge: 0,
            instructions: 'Send Money to the Nagad Personal number below.\n1. Dial *167# or open Nagad App\n2. Select "Send Money"\n3. Enter the Nagad Account Number: 01812345678\n4. Enter the exact Amount\n5. Enter Reference: Your Username / User ID\n6. Confirm with your PIN and copy the Transaction ID (TxnID)',
            details: 'Account Number: 01812345678\nAccount Type: Personal (Send Money)\nPayment Gateway: Nagad Digital Banking',
            isActive: true
          },
          {
            id: 'gw-binance-1',
            name: 'Binance USDT (TRC20 / BEP20)',
            type: 'manual',
            currency: 'USDT',
            minAmount: 10,
            maxAmount: 1000,
            charge: 0,
            instructions: 'Send USDT (TRC20 / BEP20) or Binance Pay to the address below.\n1. Open Binance App or Crypto Wallet\n2. Select Withdraw / Transfer USDT\n3. Network: Tron (TRC20) or BSC (BEP20)\n4. Destination Address: TXYZ99887766554433221100AABBCCDDEEFF\n5. Binance Pay ID: 58921478\n6. Copy the TxID / Transfer ID and upload transaction screenshot below.',
            details: 'USDT TRC20 Address: TXYZ99887766554433221100AABBCCDDEEFF\nBinance Pay ID: 58921478\nNetwork: Tron TRC20 / BSC BEP20',
            isActive: true
          }
        ];
        try {
          await db.insert(gateways).values(defaultGateways);
          formattedGateways = defaultGateways as any;
        } catch (gwErr) {
          console.warn("Gateway seeding notice:", gwErr);
          formattedGateways = defaultGateways as any;
        }
      }

      console.log(`[DB -> /api/data] Fetched ${allTasks.length} raw tasks from database.`);
      let formattedTasks = allTasks.map((t: any) => {
        const item = { ...t };
        if (typeof item.actionUrls === 'string') {
          try { item.actionUrls = JSON.parse(item.actionUrls); } catch(e) { item.actionUrls = [item.actionUrls]; }
        }
        if (typeof item.quizData === 'string') {
          try { item.quizData = JSON.parse(item.quizData); } catch(e) {}
        }
        if (item.type === 'Quiz' && (!item.quizData || !Array.isArray(item.quizData) || item.quizData.length === 0)) {
          item.quizData = easyMathQuizQuestions;
        }
        if (item.type === 'Video') {
          if (!item.actionUrls || !Array.isArray(item.actionUrls) || item.actionUrls.length === 0) {
            item.actionUrls = [item.actionUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'];
          }
          if (!item.actionUrl) {
            item.actionUrl = item.actionUrls[0];
          }
        }
        if (item.type === 'Website') {
          if (!item.actionUrls || !Array.isArray(item.actionUrls) || item.actionUrls.length === 0) {
            item.actionUrls = [item.actionUrl || 'https://wikipedia.org'];
          }
          if (!item.actionUrl) {
            item.actionUrl = item.actionUrls[0];
          }
        }
        return item;
      });
      console.log(`[API /api/data] Returning ${formattedTasks.length} formatted tasks. Sample URL state:`, formattedTasks.map((t: any) => ({ id: t.id, type: t.type, actionUrl: t.actionUrl, actionUrls: t.actionUrls })));

      if (formattedTasks.length === 0) {
        const defaultTasks = [
          {
            id: 't-math-1',
            title: 'Sohoj Math Quiz (50 Questions)',
            type: 'Quiz',
            reward: 0.20,
            limit: '10/day',
            status: 'Active',
            description: 'Solve easy math questions to earn money!',
            quizData: easyMathQuizQuestions
          },
          {
            id: 't-video-1',
            title: 'Watch Video Ad',
            type: 'Video',
            reward: 0.15,
            limit: '20/day',
            status: 'Active',
            description: 'Watch video ad for 15 seconds',
            duration: 15,
            actionUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            actionUrls: ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://www.youtube.com/watch?v=L_LUpnjgPso']
          },
          {
            id: 't-web-1',
            title: 'Visit Sponsor Website',
            type: 'Website',
            reward: 0.10,
            limit: '15/day',
            status: 'Active',
            description: 'Visit website for 15 seconds',
            duration: 15,
            actionUrl: 'https://wikipedia.org',
            actionUrls: ['https://wikipedia.org', 'https://bing.com']
          }
        ];
        try {
          await db.insert(tasks).values(defaultTasks as any);
          formattedTasks = defaultTasks as any;
        } catch (e) {
          console.warn("Task seeding notice:", e);
          formattedTasks = defaultTasks as any;
        }
      }

      // Seed authentic Bangladeshi community users if needed for user trust
      let currentUsers = allUsers;
      const hasBdUsers = currentUsers.some(u => u.id.startsWith('bd-user-'));
      if (!hasBdUsers) {
        try {
          await db.insert(users).values(bangladeshiSeedUsers as any);
          currentUsers = [...currentUsers, ...(bangladeshiSeedUsers as any)];
        } catch (uSeedErr) {
          console.warn("[DB Seed] Bangladeshi users seed notice:", uSeedErr);
        }
      }

      // Seed authentic Bangla community posts & feedback if needed
      let currentPosts = allPosts;
      const hasBdPosts = currentPosts.some(p => p.id.startsWith('post-bd-'));
      if (!hasBdPosts || currentPosts.length <= 2) {
        try {
          const postsToInsert = bangladeshiSeedPosts
            .filter(p => !currentPosts.some(cp => cp.id === p.id))
            .map(p => ({
              id: p.id,
              userId: p.userId,
              userName: p.userName,
              userAvatar: p.userAvatar,
              content: p.content,
              likes: p.likes,
              comments: p.comments,
              shares: p.shares,
              createdAt: p.createdAt,
              likedBy: p.likedBy || [],
              status: p.status || 'approved'
            }));
          if (postsToInsert.length > 0) {
            await db.insert(posts).values(postsToInsert as any);
            currentPosts = [...currentPosts, ...(postsToInsert as any)];
          }

          // Insert nested seed comments
          const commentsToInsert: any[] = [];
          for (const bp of bangladeshiSeedPosts) {
            if (bp.commentsList && bp.commentsList.length > 0) {
              for (const cm of bp.commentsList) {
                if (!allComments.some(ac => ac.id === cm.id)) {
                  commentsToInsert.push({
                    id: cm.id,
                    postId: cm.postId,
                    userId: cm.userId,
                    userName: cm.userName,
                    userAvatar: cm.userAvatar,
                    content: cm.content,
                    createdAt: cm.createdAt
                  });
                }
              }
            }
          }
          if (commentsToInsert.length > 0) {
            await db.insert(postComments).values(commentsToInsert as any);
            allComments.push(...(commentsToInsert as any));
          }
        } catch (pSeedErr) {
          console.warn("[DB Seed] Bangladeshi posts seed notice:", pSeedErr);
        }
      }

      // Seed authentic recent payout & deposit transactions for platform proof
      let currentTransactions = allTransactions;
      const hasBdTransactions = currentTransactions.some(t => t.id.startsWith('TXN-BD-'));
      if (!hasBdTransactions) {
        try {
          await db.insert(transactions).values(bangladeshiSeedTransactions as any);
          currentTransactions = [...currentTransactions, ...(bangladeshiSeedTransactions as any)];
        } catch (tSeedErr) {
          console.warn("[DB Seed] Bangladeshi transactions seed notice:", tSeedErr);
        }
      }

      // Group comments by postId in O(N) using Map for fast lookups
      const commentsByPost = new Map<string, typeof allComments>();
      for (const comment of allComments) {
        if (!commentsByPost.has(comment.postId)) {
          commentsByPost.set(comment.postId, []);
        }
        commentsByPost.get(comment.postId)!.push(comment);
      }

      const settingsMap = allSettings.reduce((acc, s) => {
        acc[s.key] = s.value;
        return acc;
      }, {} as any);

      const responsePayload = {
        users: currentUsers,
        posts: currentPosts.map(p => ({ ...p, commentsList: commentsByPost.get(p.id) || [] })),
        plans: allPlans,
        tasks: formattedTasks,
        gateways: formattedGateways,
        transactions: currentTransactions,
        notifications: allNotifications,
        settings: settingsMap,
      };

      cachedData = responsePayload;
      cachedDataTimestamp = Date.now();

      res.json(responsePayload);
    } catch (error) {
      console.error("Data fetch error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  

  app.post("/api/tasks/complete", async (req, res) => {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ error: "Not logged in" });
    const { amount, taskName } = req.body;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const [user] = await db.select().from(users).where(eq(users.id, decoded.id)).limit(1);
      if (!user) return res.status(401).json({ error: "User not found" });
      if (!user.activePlanId) return res.status(400).json({ error: "No active plan" });

      const [plan] = await db.select().from(plans).where(eq(plans.id, user.activePlanId)).limit(1);
      if (!plan) return res.status(400).json({ error: "Plan not found" });

      const today = new Date().toISOString().split('T')[0];
      let currentDailyEarned = user.dailyEarned || 0;
      if (user.lastEarnedDate !== today) currentDailyEarned = 0;

      if (currentDailyEarned + amount > plan.dailyEarningLimit) {
        return res.status(400).json({ error: `Daily earning limit of ${plan.dailyEarningLimit.toFixed(2)} reached.` });
      }

      const newBalance = user.balance + amount;
      const newDailyEarned = currentDailyEarned + amount;

      await db.update(users).set({ 
        balance: newBalance, 
        dailyEarned: newDailyEarned, 
        lastEarnedDate: today 
      }).where(eq(users.id, user.id));

      const txId = `TXN-${Math.floor(Math.random() * 90000) + 10000}`;
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

      // Process task commission for referrer if applicable
      if (user.referredBy) {
        try {
          const [referrerUser] = await db.select().from(users).where(eq(users.referralCode, user.referredBy)).limit(1);
          if (referrerUser && referrerUser.activePlanId) {
            const [refSettingsRow] = await db.select().from(settings).where(eq(settings.key, 'referralSettings')).limit(1);
            const refSettings = (refSettingsRow ? refSettingsRow.value : {}) as any;
            const planCommissionMap = refSettings.taskEarningBonusPercentByPlan || {};
            const bonusPercent = Number(planCommissionMap[referrerUser.activePlanId] || 0);

            if (bonusPercent > 0) {
              const commission = Number(((amount * bonusPercent) / 100).toFixed(4));
              if (commission > 0) {
                await db.update(users).set({
                  balance: Number((referrerUser.balance + commission).toFixed(4)),
                  referralEarnings: Number(((referrerUser.referralEarnings || 0) + commission).toFixed(4))
                }).where(eq(users.id, referrerUser.id));

                await db.insert(transactions).values({
                  id: `TXN-${Math.floor(Math.random() * 90000) + 10000}`,
                  userId: referrerUser.id,
                  userName: referrerUser.name,
                  type: 'referral_bonus',
                  amount: commission,
                  method: 'System',
                  date: new Date().toISOString().replace('T', ' ').substring(0, 16),
                  status: 'approved',
                  userDetails: `Task commission (${bonusPercent}%) from ${user.name}`
                });

                await db.insert(notifications).values({
                  id: `notif-${Date.now() + 2}`,
                  userId: referrerUser.id,
                  title: 'Task Referral Commission! ⚡',
                  message: `You earned ${commission} commission (${bonusPercent}%) from ${user.name}'s task!`,
                  type: 'system',
                  date: new Date().toISOString(),
                  isRead: false
                });
              }
            }
          }
        } catch (refErr) {
          console.warn("Task commission processing notice:", refErr);
        }
      }

      invalidateDataCache();
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
      const [user] = await db.select().from(users).where(eq(users.id, decoded.id)).limit(1);
      if (!user) return res.status(401).json({ error: "User not found" });

      const [rewardSettingsRow] = await db.select().from(settings).where(eq(settings.key, 'dailyRewardSettings')).limit(1);
      const dailyRewardSettings = (rewardSettingsRow ? rewardSettingsRow.value : { isActive: true, baseAmount: 0.5, streakBonus: 0.1, maxStreak: 7 }) as any;

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
        id: `TXN-${Math.floor(Math.random() * 90000) + 10000}`,
        userId: user.id,
        userName: user.name,
        type: 'daily_reward',
        amount: reward,
        method: 'System',
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'approved',
        userDetails: `Day ${newStreak} Streak`
      };
      await db.insert(transactions).values(tx);

      invalidateDataCache();
      res.json({ success: true, balance: newBalance, streak: newStreak, lastCheckInDate: today, transaction: tx, reward });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/mutate", async (req, res) => {
    const { table, action, payload, id } = req.body;
    if (table === 'tasks') {
      console.log(`[DB Mutation -> TASKS] Action: ${action}, ID: ${id || payload?.id}`, {
        payload,
        actionUrls: payload?.actionUrls,
        actionUrl: payload?.actionUrl
      });
    }
    try {
      let targetTable;
      switch (table) {
        case 'users': targetTable = users; break;
        case 'posts': targetTable = posts; break;
        case 'plans': targetTable = plans; break;
        case 'tasks': targetTable = tasks; break;
        case 'gateways': targetTable = gateways; break;
        case 'transactions': targetTable = transactions; break;
        case 'notifications': targetTable = notifications; break;
        case 'postComments':
        case 'post_comments': targetTable = postComments; break;
        default: return res.status(400).json({error: "Invalid table"});
      }

      if (action === 'insert') {
        if (!payload || typeof payload !== 'object' || Object.keys(payload).length === 0) {
          return res.json({ success: true, count: 0 });
        }
        await db.insert(targetTable).values(payload);
        invalidateDataCache();
        res.json({ success: true });
      } else if (action === 'update') {
        if (!id) {
          return res.status(400).json({ error: "Missing ID for update" });
        }
        if (!payload || typeof payload !== 'object') {
          return res.json({ success: true, updated: 0 });
        }
        const cleanPayload: Record<string, any> = {};
        for (const [k, v] of Object.entries(payload)) {
          if (v !== undefined) {
            cleanPayload[k] = v;
          }
        }
        if (Object.keys(cleanPayload).length === 0) {
          return res.json({ success: true, updated: 0 });
        }
        try {
          await db.update(targetTable).set(cleanPayload).where(eq((targetTable as any).id, id));
        } catch (updateErr: any) {
          console.warn(`Update mutation for ${table} warning:`, updateErr?.message);
        }
        invalidateDataCache();
        res.json({ success: true });
      } else if (action === 'delete') {
        if (!id) {
          return res.status(400).json({ error: "Missing ID for delete" });
        }
        await db.delete(targetTable).where(eq((targetTable as any).id, id));
        invalidateDataCache();
        res.json({ success: true });
      } else {
        res.status(400).json({error: "Invalid action"});
      }
    } catch (e: any) {
      console.error("Mutation error:", e);
      res.status(500).json({ error: e.message });
    }
  });
  
  app.post("/api/settings", async (req, res) => {
    const { key, value } = req.body;
    if (!key || typeof key !== 'string') {
      console.warn(`[/api/settings 400] Missing or invalid setting key:`, { body: req.body });
      return res.status(400).json({ error: "Missing or invalid setting key" });
    }
    try {
      await db.insert(settings).values({ key, value }).onConflictDoUpdate({
        target: settings.key,
        set: { value }
      });
      console.log(`[/api/settings 200] Updated setting key '${key}' successfully`);
      invalidateDataCache();
      res.json({ success: true, key, value });
    } catch (e: any) {
      console.error(`[/api/settings 500] Database error saving setting '${key}':`, {
        error: e.message,
        stack: e.stack,
        key,
        submittedPayload: value
      });
      res.status(500).json({ error: e.message || 'Database error occurred saving setting' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, {
      maxAge: '1d',
      etag: true
    }));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
