import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# When tab-branches is clicked:
pattern1 = r"(document\.getElementById\('mainBranchesContainer'\)\.style\.display = 'grid';\s*document\.getElementById\('factorySummaryContainer'\)\.style\.display = 'none';)"
replacement1 = r"\1\n    document.getElementById('globalSidePanel').style.display = 'block';"
content = re.sub(pattern1, replacement1, content)

# When tab-summary is clicked:
pattern2 = r"(document\.getElementById\('mainBranchesContainer'\)\.style\.display = 'none';\s*document\.getElementById\('factorySummaryContainer'\)\.style\.display = 'block';)"
replacement2 = r"\1\n    document.getElementById('globalSidePanel').style.display = 'none';"
content = re.sub(pattern2, replacement2, content)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
