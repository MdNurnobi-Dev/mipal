const fs = require('fs');

const code = 'A $${ B $${ C';
console.log("Rule 1:", code.replace(/\$\$\{/g, "${siteSettings?.currency || '$'}${"));

const code2 = 'A >$1.00< B >$2.00< C';
console.log("Rule 2:", code2.replace(/>\$([0-9]+\.[0-9]+)</g, ">{siteSettings?.currency || '$'}$1<"));

const code3 = 'A >${ B >${ C';
console.log("Rule 3:", code3.replace(/>\$\{/g, ">{siteSettings?.currency || '$'}{"));

const code4 = 'A $10.00 B $20.00 C';
console.log("Rule 4:", code4.replace(/\$([0-9]+\.[0-9]{2})/g, "{siteSettings?.currency || '$'}$1"));
