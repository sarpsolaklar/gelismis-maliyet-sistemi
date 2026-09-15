const fs = require('fs');
const lines = fs.readFileSync('script.js', 'utf-8').split('\n');
const start = lines.findIndex(l => l.includes('<div class="divider"></div>'));
for(let i=start-85; i<start+5; i++) {
    if(lines[i]) console.log((i+1) + ': ' + lines[i].trim());
}
