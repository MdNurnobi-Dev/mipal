const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf-8');
if (!html.includes('og:image')) {
   html = html.replace('<meta property="og:url" content="https://www.mipall.site/" />', '<meta property="og:url" content="https://www.mipall.site/" />\n    <meta property="og:image" content="https://images.unsplash.com/photo-1616469829581-73993eb86b02?q=80&w=1200&h=630&auto=format&fit=crop" />');
   fs.writeFileSync('index.html', html);
}
console.log("Added og:image");
