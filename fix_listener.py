import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the array indexing with ID lookups for the profit fields in branch listener
old_listener = r"""                  const totals = document.querySelectorAll\('\.branch-results'\)\[bIndex\]\.querySelectorAll\('\.result-row\.total'\);
                  if \(totals\.length >= 2\) \{
                      totals\[0\]\.querySelector\('span:last-child'\)\.textContent = formatCurrency\(branchData\[bIndex\]\.branchNetTotal\);
                      const elProfit = totals\[1\]\.querySelector\('span:last-child'\);
                      elProfit\.textContent = formatCurrency\(branchData\[bIndex\]\.branchTotalProfit\);
                      elProfit\.style\.color = branchData\[bIndex\]\.branchTotalProfit >= 0 \? 'var\(--success\)' : 'var\(--danger\)';
                  \}"""

new_listener = r"""                  const bResult = document.querySelectorAll('.branch-results')[bIndex];
                  const elNet = bResult.querySelector('div.result-row.total:first-child span:last-child');
                  if (elNet) elNet.textContent = formatCurrency(branchData[bIndex].branchNetTotal);
                  
                  // Live update of profits isn't fully implemented in this small listener 
                  // but we should at least update Brüt Kar if it was totals[1] before.
                  // Wait, actually, let's just trigger renderMainView() instead of manual DOM manipulation?
                  // No, focus loss. Let's just update all of them by re-calculating or just leaving it since calculateGlobal does it?
                  // calculateGlobal doesn't update branch UI. We can just NOT update profit here, it will be updated when clicking outside. 
                  // Wait, if labor changes, profit changes.
                  // Let's add IDs to branch profits and update them."""

# Let's add IDs to the branch HTML template for the 3 profits!
# I will do a quick regex on the HTML part first.
