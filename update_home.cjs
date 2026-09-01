const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

code = code.replace(
  "import FaqSection from '../components/FaqSection';",
  "import FaqSection from '../components/FaqSection';\nimport RecentActivity from '../components/RecentActivity';"
);

code = code.replace(
  "      <FaqSection />",
  "      <RecentActivity />\n      <FaqSection />"
);

fs.writeFileSync('src/pages/Home.tsx', code);
