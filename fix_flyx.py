import re
with open("src/pages/games/FlyX.tsx", "r") as f:
    content = f.read()

# revert GameContainer entirely in FlyX
content = content.replace("<GameContainer", "<div")
content = content.replace("</GameContainer>", "</div>")
content = content.replace("import { GameContainer } from '../../components/GameContainer';\n", "")

with open("src/pages/games/FlyX.tsx", "w") as f:
    f.write(content)
