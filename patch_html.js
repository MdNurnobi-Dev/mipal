const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf-8');
html = html.replace(/<title>.*?<\/title>/g, '<title>Earnify - MicroJob Platform</title>');
html = html.replace(/<meta name="description" content=".*?" \/>/g, '<meta name="description" content="The ultimate mobile-first microjob and earning platform. Complete tasks, refer friends, and withdraw rewards seamlessly." />');
html = html.replace(/<meta property="og:title" content=".*?" \/>/g, '<meta property="og:title" content="Earnify - MicroJob Platform" />');
html = html.replace(/<meta property="og:description" content=".*?" \/>/g, '<meta property="og:description" content="The ultimate mobile-first microjob and earning platform. Complete tasks, refer friends, and withdraw rewards seamlessly." />');
fs.writeFileSync('index.html', html);
console.log('HTML Patched');
