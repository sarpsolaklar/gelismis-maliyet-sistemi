import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# I need to set the value for `cls-unit-base`
target = "const elUnitShare = document.getElementById(`cls-unit-share-${cIndex}`);"
replacement = """
                  const elUnitBase = document.getElementById(`cls-unit-base-${cIndex}`);
                  if (elUnitBase) elUnitBase.textContent = formatWithPercent(cls.machineCost || 0, clsUnitCost);
                  
                  const elUnitShare = document.getElementById(`cls-unit-share-${cIndex}`);"""
content = content.replace(target, replacement)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
