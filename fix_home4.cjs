const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const target = "              <span className=\"text-xs font-bold text-green-600\">{siteSettings?.currency || '\n      {/* Create Post Section */}";

const replacement = `              <span className="text-xs font-bold text-green-600">{siteSettings?.currency || '$'}{earner.earnings.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Create Post Section */}`;

code = code.replace(target, replacement);
fs.writeFileSync('src/pages/Home.tsx', code);
