const fs = require('fs');

// 1. index.html
let html = fs.readFileSync('index.html', 'utf-8');
html = html.replace(/<title>.*?<\/title>/g, '<title>miPall - Earn Rewards & Micro Jobs</title>');
html = html.replace(/<meta name="description" content=".*?" \/>/g, '<meta name="description" content="Join miPall, the ultimate mobile-first platform to complete simple micro jobs, refer friends, and earn real rewards seamlessly." />');
html = html.replace(/<meta property="og:title" content=".*?" \/>/g, '<meta property="og:title" content="miPall - Earn Rewards & Micro Jobs" />');
html = html.replace(/<meta property="og:description" content=".*?" \/>/g, '<meta property="og:description" content="Join miPall, the ultimate mobile-first platform to complete simple micro jobs, refer friends, and earn real rewards seamlessly." />');
if (!html.includes('og:url')) {
   html = html.replace('<meta property="og:type" content="website" />', '<meta property="og:type" content="website" />\n    <meta property="og:url" content="https://www.mipall.site/" />');
}
fs.writeFileSync('index.html', html);

// 2. public/manifest.json
let manifestStr = fs.readFileSync('public/manifest.json', 'utf-8');
let manifest = JSON.parse(manifestStr);
manifest.name = "miPall";
manifest.short_name = "miPall";
manifest.description = "Join miPall, the ultimate mobile-first platform to complete simple micro jobs, refer friends, and earn real rewards seamlessly.";
fs.writeFileSync('public/manifest.json', JSON.stringify(manifest, null, 2));

// 3. metadata.json
let metaStr = fs.readFileSync('metadata.json', 'utf-8');
let meta = JSON.parse(metaStr);
meta.name = "miPall";
meta.description = "Join miPall, the ultimate mobile-first platform to complete simple micro jobs, refer friends, and earn real rewards seamlessly.";
fs.writeFileSync('metadata.json', JSON.stringify(meta, null, 2));

// 4. README.md
let readme = fs.readFileSync('README.md', 'utf-8');
readme = readme.replace(/Earnify - MicroJob Platform/g, 'miPall - Earn Rewards & Micro Jobs');
readme = readme.replace(/Earnify/g, 'miPall');
fs.writeFileSync('README.md', readme);

// 5. AdminSettings.tsx (Update default fallbacks)
let admin = fs.readFileSync('src/pages/admin/AdminSettings.tsx', 'utf-8');
admin = admin.replace(/'Earnify'/g, "'miPall'");
admin = admin.replace(/'The best microjob platform to earn daily.'/g, "'Join miPall, the ultimate mobile-first platform to complete simple micro jobs, refer friends, and earn real rewards seamlessly.'");
fs.writeFileSync('src/pages/admin/AdminSettings.tsx', admin);

console.log("SEO and App Name patched successfully!");
