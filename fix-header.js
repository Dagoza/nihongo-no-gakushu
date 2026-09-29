const fs = require('fs');
const cssFile = 'app/globals.css';
let css = fs.readFileSync(cssFile, 'utf8');
css = css.replace(
  /\.header-container {\n    padding: 8px 12px;\n    gap: 8px;\n    flex-direction: column;\n  }/g,
  '.header-container {\n    padding: 8px 12px;\n    gap: 8px;\n    flex-direction: column;\n    align-items: stretch;\n  }'
);
fs.writeFileSync(cssFile, css);
