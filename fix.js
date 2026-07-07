const fs = require('fs');
const path = 'c:/Users/sarth/OneDrive/ドキュメント/Calculator/script.js';
let content = fs.readFileSync(path, 'utf8');
let lines = content.split(/\r?\n/);

let startIdx = lines.findIndex((l, i) => i > 770 && l.includes('// PROGRAMMER MODE') && !l.includes('LOGIC'));
if (startIdx !== -1) {
    startIdx--; // get the line with // -------
    let endIdx = lines.findIndex((l, i) => i > startIdx && l.includes('function computeProgOperation'));
    if (endIdx !== -1) {
        // find the end of computeProgOperation
        let finalEnd = endIdx;
        for (let i = endIdx; i < lines.length; i++) {
            if (lines[i].includes('// THEME-SPECIFIC LIVE BACKGROUND')) {
                finalEnd = i - 2; // two lines before it
                break;
            }
        }
        console.log(`Removing from line ${startIdx + 1} to ${finalEnd + 1}`);
        lines.splice(startIdx, finalEnd - startIdx + 1);
        
        let newContent = lines.join('\n'); // keeping \n as joiner, might mix \r\n, so let's preserve endings
        content = content.replace(/\r\n/g, '\n').split('\n');
        content.splice(startIdx, finalEnd - startIdx + 1);
        
        fs.writeFileSync(path, content.join('\r\n'), 'utf8');
        console.log('Fixed redeclaration.');
    } else {
        console.log('Could not find end of block.');
    }
} else {
    console.log('Could not find start of block.');
}
