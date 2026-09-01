const fs = require('fs');
let code = fs.readFileSync('src/pages/Withdraw.tsx', 'utf8');

const idx = code.indexOf("{siteSettings?.currency || '\n        </div>");
if (idx !== -1) {
    code = code.substring(0, idx) + "{siteSettings?.currency || '$'}{currentUser.balance.toFixed(2)}</div>\n        </div>" + code.substring(idx + "{siteSettings?.currency || '\n        </div>".length);
}

const idx2 = code.indexOf("{siteSettings?.currency || '\n          </p>");
if (idx2 !== -1) {
    code = code.substring(0, idx2) + "{siteSettings?.currency || '$'}10.00</p>\n          </p>" + code.substring(idx2 + "{siteSettings?.currency || '\n          </p>".length);
}

fs.writeFileSync('src/pages/Withdraw.tsx', code);
