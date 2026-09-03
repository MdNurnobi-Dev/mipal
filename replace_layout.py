import os
import re

games_dir = 'src/pages/games'
for file_name in os.listdir(games_dir):
    if not file_name.endswith('.tsx'): continue
    file_path = os.path.join(games_dir, file_name)
    with open(file_path, 'r') as f:
        content = f.read()

    # If already has GameContainer, skip
    if "GameContainer" in content:
        continue

    # Find the main fixed inset-0 z-[100] div
    # The regex matches exactly `<div className="fixed inset-0 z-[100] flex flex-col [any classes]">`
    match = re.search(r'<div className="fixed inset-0 z-\[100\] flex flex-col ([^"]+)">', content)
    if not match:
        continue
    
    classes = match.group(1)
    
    # We want to replace it with <GameContainer className="classes">
    new_content = content.replace(match.group(0), f'<GameContainer className="{classes}">')
    
    # Also add the import at the top
    new_content = f"import {{ GameContainer }} from '../../components/GameContainer';\n" + new_content
    
    # Now we must replace the closing `</div>` tag that corresponds to this opening tag.
    # Since it's the outermost div returned by the component, it's the last `</div>` before `);` at the end.
    
    # Let's find the last `</div>`
    parts = new_content.rsplit('</div>', 1)
    if len(parts) == 2:
        new_content = parts[0] + '</GameContainer>' + parts[1]
    
    with open(file_path, 'w') as f:
        f.write(new_content)
    
    print(f"Updated {file_name}")

