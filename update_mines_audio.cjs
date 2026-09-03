const fs = require('fs');
let content = fs.readFileSync('src/pages/games/Mines.tsx', 'utf8');

// Replace audioSystem.playMinesTile() with try/catch
content = content.replace(/audioSystem\.playMinesTile\(\);/g, `try { audioSystem.playMinesTile(); } catch(e) { console.warn(e); }`);

// Replace audioSystem.playMinesBomb() with try/catch
content = content.replace(/audioSystem\.playMinesBomb\(\);/g, `try { audioSystem.playMinesBomb(); } catch(e) { console.warn(e); }`);

// Replace audioSystem.playMinesGem(...) with try/catch
content = content.replace(/audioSystem\.playMinesGem\((.*?)\);/g, `try { audioSystem.playMinesGem($1); } catch(e) { console.warn(e); }`);

// Replace audioSystem.playMinesCashout() with try/catch
content = content.replace(/audioSystem\.playMinesCashout\(\);/g, `try { audioSystem.playMinesCashout(); } catch(e) { console.warn(e); }`);

// Remove double try/catch around playMinesTile if it exists
content = content.replace(/try\s*\{\s*try\s*\{\s*audioSystem\.playMinesTile\(\);\s*\}\s*catch\(e\)\s*\{\s*console\.warn\(e\);\s*\}\s*\}\s*catch\s*\(e\)\s*\{\s*console\.warn\("Audio system error:",\s*e\);\s*\}/g, 
  `try { audioSystem.playMinesTile(); } catch(e) { console.warn(e); }`);

fs.writeFileSync('src/pages/games/Mines.tsx', content);
