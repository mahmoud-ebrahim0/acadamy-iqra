const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir('d:\\New folder\\frontend\\src', function(filePath) {
    if (filePath.endsWith('.jsx')) {
        let content = fs.readFileSync(filePath, 'utf-8');
        let original = content;
        
        content = content.replace(/rgba\(11,\s*25,\s*48,\s*[\d.]+\)/g, 'var(--card-bg)');
        content = content.replace(/rgba\(3,\s*8,\s*17,\s*[\d.]+\)/g, 'var(--bg-color)');
        content = content.replace(/rgba\(10,\s*11,\s*10,\s*[\d.]+\)/g, 'var(--card-bg)');
        content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.05\)/g, 'rgba(0,0,0,0.05)');
        content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.1\)/g, 'rgba(0,0,0,0.1)');
        content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.2\)/g, 'rgba(0,0,0,0.2)');
        
        if (content !== original) {
            fs.writeFileSync(filePath, content, 'utf-8');
            console.log('Updated: ' + filePath);
        }
    }
});
