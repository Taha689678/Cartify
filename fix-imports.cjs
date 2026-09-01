const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            if (!file.includes('node_modules')) {
                results = results.concat(walk(file));
            }
        } else {
            if (file.endsWith('.js') || file.endsWith('.mjs')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(path.join(__dirname, 'server'));

let count = 0;
for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Replace imports
    content = content.replace(/from\s+["'](\.\.\/models\/User\.js)["']/g, 'from "../models/user.js"');
    content = content.replace(/from\s+["'](\.\/models\/User\.js)["']/g, 'from "./models/user.js"');
    
    content = content.replace(/from\s+["'](\.\.\/models\/Seller\.js)["']/g, 'from "../models/seller.js"');
    content = content.replace(/from\s+["'](\.\/models\/Seller\.js)["']/g, 'from "./models/seller.js"');
    
    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log('Fixed:', file);
        count++;
    }
}
console.log('Total fixed:', count);
