const fs = require('fs');

// Fix Earnings.tsx
let earningsCode = fs.readFileSync('src/pages/Earnings.tsx', 'utf8');
earningsCode = earningsCode.replace(
  "  if (!currentUser) return null;\n  const navigate = useNavigate();",
  "  const navigate = useNavigate();\n  if (!currentUser) return null;"
);
fs.writeFileSync('src/pages/Earnings.tsx', earningsCode);

