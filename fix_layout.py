import re

with open("src/components/Layout.tsx", "r") as f:
    content = f.read()

# Replace the escaped quotes
content = content.replace(r"\'/games\'", "'/games'")
content = content.replace(r"\'px-0\'", "'px-0'")
content = content.replace(r"\'p-3\'", "'p-3'")

with open("src/components/Layout.tsx", "w") as f:
    f.write(content)
