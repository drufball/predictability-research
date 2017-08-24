const fs = require('fs')
const readline = require('readline')
const rl = readline.createInterface({
  input: fs.createReadStream('data/api-data.csv')
})

let headingsToCheck = {}
let implementationStatusForFeature = []
rl.on('line', (line) => {
  cols = Object.keys(headingsToCheck)
  if(cols.length == 0) {
    headingsToCheck = parseHeadings(line)
    return
  }

  let implementers = []
  let implementedForRelease = line.split(",")
  let interf = implementedForRelease[0]
  let api = implementedForRelease[1]

  for( let col of cols ) {
    let i = parseInt(col)
    let releaseSupport = implementedForRelease[i]

    if( releaseSupport == "true" ) {
      let releaseToAdd = headingsToCheck[col]
      let shouldAdd = true
      for(let implementer of implementers) {
        if( releaseToAdd.browser == implementer.browser ) {
          shouldAdd = false
        }
      }

      if(shouldAdd) {
        implementers.push(headingsToCheck[col])
      }
    }
  }
  implementationStatusForFeature.push({interf, api, implementers})
})

rl.on('close', () => {
  fs.writeFile('data/sanitized-api-data.csv', convertToString(implementationStatusForFeature), (err) => {
    if(err) {
      console.log(err)
    }
    else {
      console.log("Sanitized API data saved successfully.")
    }
  })
})

function convertToString(apisWIthReleaseHistory) {
  let str = ""
  for( entry of apisWIthReleaseHistory ) {
    str += `${entry.interf},${entry.api}`
    for( release of entry.implementers ) {
      str += `,${release.describe()}`
    }
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
