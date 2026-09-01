const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  "let allPosts = await db.select().from(posts);",
  "let allPosts = await db.select().from(posts);\n      let allComments = await db.select().from(postComments);"
);

code = code.replace(
  "posts: allPosts,",
  "posts: allPosts.map(p => ({ ...p, commentsList: allComments.filter(c => c.postId === p.id) })),"
);

fs.writeFileSync('server.ts', code);
