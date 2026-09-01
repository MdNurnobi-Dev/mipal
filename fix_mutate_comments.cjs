const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  "case 'notifications': targetTable = notifications; break;",
  "case 'notifications': targetTable = notifications; break;\n        case 'postComments':\n        case 'post_comments': targetTable = postComments; break;"
);

fs.writeFileSync('server.ts', code);
