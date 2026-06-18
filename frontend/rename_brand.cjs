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
    if (filePath.endsWith('.jsx') || filePath.endsWith('.html') || filePath.endsWith('.css')) {
        let content = fs.readFileSync(filePath, 'utf-8');
        let original = content;
        
        // Replace 'Iqra' with 'Tarteel'
        content = content.replace(/Iqra/g, 'Tarteel');
        content = content.replace(/iqra/g, 'tarteel');
        content = content.replace(/IQRA/g, 'TARTEEL');
        
        // Specific Arabic replacements if they exist
        content = content.replace(/أكاديمية إقرأ/g, 'أكاديمية ترتيل');
        content = content.replace(/أكاديمية اقرأ/g, 'أكاديمية ترتيل');
        content = content.replace(/إقرأ/g, 'ترتيل');
        content = content.replace(/اقرأ/g, 'ترتيل');
        
        if (content !== original) {
            fs.writeFileSync(filePath, content, 'utf-8');
            console.log('Updated branding in: ' + filePath);
        }
    }
});
