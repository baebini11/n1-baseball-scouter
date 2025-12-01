import re

# Read the file
with open('src/utils/prospectUtils.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace 3 occurrences precisely
content = content.replace(
    "const role = prospect.position === 'Pitcher' ? 'pitcher' : 'fielder';",
    "const role = prospect.position === '투수' ? 'pitcher' : 'fielder';",
    1
)

content = content.replace(
    "if (prospect.position === 'Pitcher') {",
    "if (prospect.position === '투수') {",
    2  # Replace both occurrences
)

# Write back
with open('src/utils/prospectUtils.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Successfully updated prospectUtils.js")
print("- Changed role detection to '투수'")
print("- Changed awards logic to '투수'")
print("- Changed careerTotals logic to '투수'")
