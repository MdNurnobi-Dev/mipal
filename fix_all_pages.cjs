const fs = require('fs');
const glob = require('glob'); // Need to check if available, otherwise just use basic Node fs

const files = fs.readdirSync('src/pages').filter(f => f.endsWith('.tsx'));
for (const file of files) {
  const path = 'src/pages/' + file;
  let code = fs.readFileSync(path, 'utf8');
  
  if (path === 'src/pages/Auth.tsx') continue;
  
  // Quick fix: Add if (!currentUser) return null; to the top of the component
  if (code.includes('const { currentUser') && !code.includes('if (!currentUser) return null;')) {
    code = code.replace(/const {([^}]*)currentUser([^}]*)} = useApp\(\);/, 'const {$1currentUser$2} = useApp();\n\n  if (!currentUser) return null;');
    fs.writeFileSync(path, code);
  }
}
