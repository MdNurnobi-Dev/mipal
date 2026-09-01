const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx')) results.push(file);
    }
  });
  return results;
}

const files = walk('src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // 1. `$${` -> `${siteSettings?.currency || '$'}${`
  content = content.replace(/\$\$\{/g, "${siteSettings?.currency || '$'}${");

  // 2. `>$` -> `>{siteSettings?.currency || '$'}` (except not everything, just if followed by a number or {)
  content = content.replace(/>\$([0-9]+\.[0-9]+)</g, ">{siteSettings?.currency || '$'}$1<");
  content = content.replace(/>\$\{/g, ">{siteSettings?.currency || '$'}{");

  // 3. `$10.00` in strings
  content = content.replace(/\$([0-9]+\.[0-9]{2})/g, "{siteSettings?.currency || '$'}$1");
  content = content.replace(/:\s*\$([0-9]+)/g, ": {siteSettings?.currency || '$'}$1");

  // specifically fix recentactivity
  content = content.replace(/const amountStr = \`\$\$\{/, "const amountStr = `${siteSettings?.currency || '$'}${");

  if (content !== originalContent) {
     if (content.includes('siteSettings') && !content.includes('siteSettings,')) {
         if (content.includes('const { ') && content.includes('} = useApp()')) {
             if (!content.includes('siteSettings')) {
                content = content.replace('const { ', 'const { siteSettings, ');
             }
         }
     }
     fs.writeFileSync(file, content);
  }
});
