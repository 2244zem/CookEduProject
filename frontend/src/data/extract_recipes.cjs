const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\idris\\.gemini\\antigravity\\brain\\2ade51b5-b1fe-46cd-bd5f-5e2ee1c0e5d6\\.system_generated\\logs\\overview.txt';

try {
    const content = fs.readFileSync(logPath, 'utf8');
    const lines = content.split('\n');
    for (const line of lines) {
        if (!line.trim()) continue;
        const entry = JSON.parse(line);
        if (entry.type === 'USER_INPUT' && entry.content.includes('extendedRecipes')) {
            console.log('---START---');
            console.log(entry.content);
            console.log('---END---');
        }
    }
} catch (e) {
    console.error(e);
}
