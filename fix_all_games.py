import os
import re

games_dir = 'src/pages/games'
for file_name in os.listdir(games_dir):
    if not file_name.endswith('.tsx'): continue
    file_path = os.path.join(games_dir, file_name)
    with open(file_path, 'r') as f:
        content = f.read()

    # Revert all GameContainer changes first
    content = content.replace("<GameContainer", "<div")
    content = content.replace("</GameContainer>", "</div>")
    content = content.replace("import { GameContainer } from '../../components/GameContainer';\n", "")
    
    # We want to replace only the FIRST occurrence of <div className="fixed inset-0 ..."> inside the main component return
    # A safer way is to just do a manual replace or find the first occurrence after `return (`
    
    with open(file_path, 'w') as f:
        f.write(content)
        
