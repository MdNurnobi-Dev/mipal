const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// Replace standard fetch with custom apiFetch wrapper
const apiFetchCode = `
const apiFetch = (url: string, options: RequestInit = {}) => {
  const headers = new Headers(options.headers || {});
  if (!headers.has('x-requested-with')) {
    headers.set('x-requested-with', 'XMLHttpRequest');
  }
  if (!headers.has('Content-Type') && options.method && options.method !== 'GET') {
    headers.set('Content-Type', 'application/json');
  }
  return fetch(url, {
    ...options,
    headers,
    credentials: 'include'
  });
};
`;

code = code.replace("export const AppProvider", apiFetchCode + "\nexport const AppProvider");
code = code.replace(/fetch\('/g, "apiFetch('");
// Need to handle `window.fetch` just in case, but we don't have it here.

fs.writeFileSync('src/context/AppContext.tsx', code);
