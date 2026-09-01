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
  let code = fs.readFileSync(file, 'utf8');
  if (code.includes("{siteSettings?.currency || '")) {
     console.log("Fixing " + file);
     // We need to undo `code.replace(/\$\$\{/g, "${siteSettings?.currency || '$'}${");`
     // The faulty replacement was: `{siteSettings?.currency || '` + (rest of string) + `}{`
     
     // To reverse it reliably, since `replace(/.../g)` processes left-to-right:
     // We can just find the LAST occurrence of `{siteSettings?.currency || '`
     // It will be followed by the rest of the string, and then a `}{`.
     // We remove the `}{` from the end of the block (which is at the very end of the inserted chunk).
     // Wait, it's easier: The text `{siteSettings?.currency || '` replaced `$${`.
     // And `}{` was appended.
     
     // Let's just find the original string. We know the original string had some length.
     // Is there a simpler way? Just grab the code up to the first `{siteSettings?.currency || '`,
     // then find the next `{siteSettings?.currency || '`, wait no.
     // The first replacement inserted the ENTIRE rest of the string.
     
     // Actually, if we just find `{siteSettings?.currency || '` and replace it with `$${`?
     // No, because it duplicated the rest of the string!
     // A {siteSettings?.currency || ' B $${ C}{ B ...
     // The original string is `A $${ B $${ C`.
     // Notice that the text before the FIRST `{siteSettings?.currency || '` is `A `.
     // The text after the first `{siteSettings?.currency || '` is ` B $${ C`.
     // So the original string is EXACTLY: 
     // (Text before first `{siteSettings...`) + `$${` + (Text after first `{siteSettings...` up to the `}{` that matches it, but wait, the text immediately after is the EXACT rest of the original string!)
     // YES! The text immediately following the FIRST `{siteSettings?.currency || '` is exactly the rest of the original string!!!
     // Because `$'` inserts the rest of the original string!
     // So the original string is just:
     // code.substring(0, code.indexOf("{siteSettings?.currency || '")) + "$${" + 
     // string inserted by `$'`, which is the rest of the original string.
     // Wait, does the inserted `$'` contain the original `$${`? Yes!
     // Let's test this logic:
     let firstIdx = code.indexOf("{siteSettings?.currency || '");
     if (firstIdx !== -1) {
         // But wait, there were multiple regexes!
         // I also did: content.replace(/>\$([0-9]+\.[0-9]+)</g, ">{siteSettings?.currency || '$'}$1<");
         // This also had `$'` !!!
         // And `content.replace(/>\$\{/g, ">{siteSettings?.currency || '$'}{");`
         // This also had `$'` !!!
         // And `content.replace(/\$([0-9]+\.[0-9]{2})/g, "{siteSettings?.currency || '$'}$1");`
         // This also had `$'` !!!
         
         // So the VERY FIRST mistake in the file (whichever rule hit first) duplicated the rest of the string.
         // Let's find the FIRST occurrence of `{siteSettings?.currency || '` or `>{siteSettings?.currency || '`.
         // Actually, any `siteSettings?.currency || '` is the start of the mistake.
         // Let's just use `code.indexOf("siteSettings?.currency || '")`
         let mistakeIdx = code.indexOf("siteSettings?.currency || '");
         
         // Let's trace back to where the `{` or `>{` started.
         let startIdx = code.lastIndexOf("{", mistakeIdx);
         let prefix = code.substring(0, startIdx); // Everything before the mistake
         
         // Now, what was the matched string? It could be `$${`, `>$`, `>${`, or `$10.00`.
         // But wait! We know the `$'` is exactly the rest of the original string BEFORE the match.
         // If we know what was matched, we can reconstruct it.
         // Actually, the rest of the original string is immediately after the `siteSettings?.currency || '`.
         // Let's extract the rest of the original string.
         let rest = code.substring(mistakeIdx + "siteSettings?.currency || '".length);
         
         // But what was the matched string? We can figure it out by looking at `rest` or `prefix`.
         // This is getting complicated.
         // Since I only have a few files, maybe I can just restore them by hand?
         // No, many files are corrupted.
         
         // What if I just use the backup? There must be a backup in the docker layer.
         // The container has the original files!
     }
  }
});
