import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Look for the last }); at the end of the file.
# The end of the file has:
#     document.getElementById('factorySummaryContainer').style.display = 'block';
# });
# 
# function renderFactorySummary() {
# ...
# }

# We will move renderFactorySummary to be INSIDE the });

# Split the content at "function renderFactorySummary() {"
parts = content.split("function renderFactorySummary() {")
if len(parts) == 2:
    main_code = parts[0]
    func_code = "function renderFactorySummary() {" + parts[1]
    
    # In main_code, the last 4 characters are usually "\n});\n" or similar.
    # Let's find the last "});" and replace it with func_code + "\n});"
    
    last_brace_idx = main_code.rfind("});")
    if last_brace_idx != -1:
        new_content = main_code[:last_brace_idx] + "\n" + func_code + "\n" + main_code[last_brace_idx:]
        
        with open('script.js', 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Success")
    else:
        print("Failed to find });")
else:
    print("Failed to find renderFactorySummary")

