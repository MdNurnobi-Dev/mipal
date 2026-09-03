with open("src/pages/games/Crash.tsx", "r") as f:
    content = f.read()

# Replace all </GameContainer> back to </div> first
content = content.replace("</GameContainer>", "</div>")

# The opening tag was replaced by <GameContainer className="bg-[#000000] text-white">
# Wait, let's check if it was replaced. I did replace it with `sed` earlier.
# Let's verify by replacing the opening tag
if '<GameContainer className="bg-[#000000] text-white">' in content:
    # Opening tag is already there. Let's just fix the ending.
    parts = content.rsplit('</div>', 1)
    if len(parts) == 2:
        content = parts[0] + '</GameContainer>' + parts[1]
else:
    # opening tag not there?
    pass

with open("src/pages/games/Crash.tsx", "w") as f:
    f.write(content)
