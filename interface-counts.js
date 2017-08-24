const fs = require('fs');
const readline = require('readline');
const rl = readline.createInterface({
  input: fs.createReadStream('data/api-data.csv')
})

let interfaceCounts = {};
let firstTime = false;
rl.on('line', (line) => {
  if(firstTime) {
    firstTime = true;
    return;
  }
  let implementedForRelease = line.split(",");
  let interf = implementedForRelease[0];

  if(interf in interfaceCounts) {
    interfaceCounts[interf]++;
  } else {
    interfaceCounts[interf] = 1;
  }
})

rl.on('close', () => {
  fs.writeFile('data/interface-counts.json', JSON.stringify(interfaceCounts, null, 4), (err) => {
    if(err) {
      console.log(err)
    }
    else {
      console.log("Interface counts data saved successfully.")
    }
  })
})

function convertToString(counts) {
  let str = ""
  let keys = Object.keys(counts)
  for (var i = 0; i < keys.length; i++) {
    str += `${keys[i]},${counts[keys[i]]}`
    str += "\n"
  }
  return str
}

function parseHeadings(row) {
  const fields = row.split(",")

  let fieldToSupportedRelease = {}
  for(var col = 2; col < fields.length; col++) {
    let release = new BrowserRelease(fields[col])
    if( !isSupportedBrowser(release) ) {
      continue
    }
    fieldToSupportedRelease[col] = release
  }
  return fieldToSupportedRelease
}

class BrowserRelease {
  constructor(releaseString) {
    let metadata = releaseString.split("_")
    this.browser = metadata[0]
    let version = metadata[1]
    this.platform = metadata[2]

    this.majorVersion = version.split(".")[0]
  }

  describe() {
    return `${this.browser} ${this.majorVersion}`
  }
}

function isSupportedBrowser(release) {
  return release.browser == "Safari" || release.platform == "Windows"
}
