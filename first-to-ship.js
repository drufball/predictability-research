const fs = require('fs')
const readline = require('readline')

const rl = readline.createInterface({
  input: fs.createReadStream('apiData.csv')
})

rl.on('line', (line) => {
  console.log(`Line from file: ${line}`);
});
