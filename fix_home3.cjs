const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

code = code.replace(
  "              <span className=\"text-xs font-bold text-green-600\">{siteSettings?.currency || '\n        </div>\n      </div>\n      )}",
  "              <span className=\"text-xs font-bold text-green-600\">{siteSettings?.currency || '$'}{earner.earnings.toFixed(2)}</span>\n            </div>\n          ))}\n        </div>\n      </div>\n      )}"
);

fs.writeFileSync('src/pages/Home.tsx', code);
