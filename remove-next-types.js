const fs = require('fs');
const path = './tsconfig.json';

const tsconfig = JSON.parse(fs.readFileSync(path, 'utf8'));
if (tsconfig.include) {
  tsconfig.include = tsconfig.include.filter(
    (item) => item !== '.next/types/**/*.ts'
  );
  fs.writeFileSync(path, JSON.stringify(tsconfig, null, 2));
}