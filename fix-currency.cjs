const fs = require('fs');
const path = require('path');

function findFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(findFiles(file));
    } else if (file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = findFiles('client/src');
let count = 0;
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let match = false;
  let newContent = content;

  // 1. >${...}  or > ${...} -> >Rs {...}
  if (/>\s*\$\{/.test(newContent)) {
    newContent = newContent.replace(/>\s*\$\{/g, '>Rs {');
    match = true;
  }

  // 2. $$ -> Rs $ (like in value: `$${...}`)
  if (/\$\$\{/.test(newContent)) {
    newContent = newContent.replace(/\$\$\{/g, 'Rs ${');
    match = true;
  }
  
  // 3. For things like "Free shipping on orders over $50"
  if (/\$50/.test(newContent)) {
    newContent = newContent.replace(/\$50/g, 'Rs 5000');
    match = true;
  }

  if (match) {
    console.log('Modified:', file);
    fs.writeFileSync(file, newContent);
  }
});
