const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

code = code.replace(
  'const updateReferralSettings = (s: Partial<ReferralSettings>) => {',
  'const [referralSettings, setReferralSettings] = useState<ReferralSettings>({\n    newUserBonusAmount: 1.00,\n    referrerBonusAmount: 2.50,\n    depositBonusPercent: 5\n  });\n\n  const updateReferralSettings = (s: Partial<ReferralSettings>) => {'
);

fs.writeFileSync('src/context/AppContext.tsx', code);
