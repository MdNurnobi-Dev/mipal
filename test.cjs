let content = 'A $${ B $${ C';
content = content.replace(/\$\$\{/g, "${siteSettings?.currency || '$'}${");
console.log(content);
