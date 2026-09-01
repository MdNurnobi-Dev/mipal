const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const adminLoginOld = `
  app.post("/api/admin-login", async (req, res) => {
    const { email, password } = req.body;
    // Default admin
    if (email === "victorsteele428@gmail.com" && password === "RajPass##321") {
      const token = jwt.sign({ id: 'admin', role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
      res.cookie('admin_token', token, { httpOnly: true, secure: true, sameSite: 'none' });
      return res.json({ success: true });
    }
    res.status(401).json({ error: "Invalid admin credentials" });
  });
`;

const adminLoginNew = `
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
`;

code = code.replace(adminLoginOld.trim(), adminLoginNew.trim());

const getMeOld = `
  app.get("/api/me", async (req, res) => {
    const token = req.cookies?.token;
    const adminToken = req.cookies?.admin_token;
    let currentUser = null;
    let isAdmin = false;

    if (adminToken) {
      try {
        const decoded = jwt.verify(adminToken, JWT_SECRET) as any;
        if (decoded.role === 'admin') isAdmin = true;
      } catch (e) {}
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const allUsers = await db.select().from(users);
        const u = allUsers.find(u => u.id === decoded.id);
        if (u) {
          u.password = '';
          currentUser = u;
        }
      } catch (e) {}
    }

    res.json({ currentUser, isAdmin });
  });
`;

const getMeNew = `
  app.get("/api/me", async (req, res) => {
    const token = req.cookies?.token;
    const adminToken = req.cookies?.admin_token;
    let currentUser = null;
    let isAdmin = false;
    
    // We fetch users once if we need them
    let allUsers = null;

    if (adminToken) {
      try {
        const decoded = jwt.verify(adminToken, JWT_SECRET) as any;
        if (decoded.role === 'admin') {
          allUsers = await db.select().from(users);
          const u = allUsers.find(u => u.id === decoded.id);
          if (u && u.role === 'admin') {
            isAdmin = true;
          }
        }
      } catch (e) {}
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        if (!allUsers) allUsers = await db.select().from(users);
        const u = allUsers.find(u => u.id === decoded.id);
        if (u) {
          u.password = '';
          currentUser = u;
        }
      } catch (e) {}
    }

    res.json({ currentUser, isAdmin });
  });
`;

code = code.replace(getMeOld.trim(), getMeNew.trim());

fs.writeFileSync('server.ts', code);
