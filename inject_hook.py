import os
import re

games_dir = 'src/pages/games'
for file_name in os.listdir(games_dir):
    if not file_name.endswith('.tsx'): continue
    file_path = os.path.join(games_dir, file_name)
    with open(file_path, 'r') as f:
        content = f.read()

    # Skip if already added
    if "useGameFullscreen" in content:
        continue

    # Add import at the top
    content = "import { useGameFullscreen } from '../../hooks/useGameFullscreen';\n" + content

    # Find the main component declaration
    # usually: export default function GameName() {
    # or export function GameName() {
    
    match = re.search(r'export (default )?function [A-Za-z0-9]+\s*\([^)]*\)\s*{', content)
    if match:
        insert_pos = match.end()
        content = content[:insert_pos] + "\n  useGameFullscreen();" + content[insert_pos:]
    else:
        print(f"Could not find main component in {file_name}")

    with open(file_path, 'w') as f:
        f.write(content)
        
    print(f"Updated {file_name}")

