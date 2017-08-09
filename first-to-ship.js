const fs = require('fs')
const readline = require('readline')
const rl = readline.createInterface({
  input: fs.createReadStream('sanitized-api-data.txt')
})

let firstToShipCounts = {
  "Chrome": 0,
  "Firefox": 0,
  "Edge": 0,
  "Safari": 0
}
let shippedFirstWithFollowers = {
  "Chrome": 0,
  "Firefox": 0,
  "Edge": 0,
  "Safari": 0
}
let ambiguousEdgeOrSafariCount = {
  "Chrome": 0,
  "Firefox": 0
}
rl.on('line', (line) => {
  const fields = line.split(",")
  const interface = fields[0]
  const api = fields[1]

  if( fields.length > 2 ) {
    let firstReleaseData = fields[2].split(" ")
    let browser = firstReleaseData[0]
    let version = firstReleaseData[1]
    if(releaseTooEarly(browser, version)) {
      return
    }

    firstToShipCounts[browser]++
    if( fields.length > 3 ) {
      if( browser == "Chrome" || browser == "Firefox" ) {
        for( let i = 3; i < fields.length; i++ ) {
          let followerData = fields[i].split(" ")
          let followerBrowser = followerData[0]
          let followerVersion = followerData[1]

          if( releaseTooEarly(followerBrowser, followerVersion) ) {
            ambiguousEdgeOrSafariCount[browser]++
          }
        }
      }

      shippedFirstWithFollowers[browser]++
    }
  }
})

function releaseTooEarly(browser, version) {
  let firstReleases = {
    "Chrome":["38"],
    "Firefox":["34"],
    "Edge":["13"],
    "Safari":["601"]
  }

  return firstReleases[browser].includes(version)
}

rl.on('close', (line) => {
  console.log(firstToShipCounts)
  console.log(shippedFirstWithFollowers)
  console.log(ambiguousEdgeOrSafariCount)

  for( browser of Object.keys(firstToShipCounts) ) {
    console.log(positiveElasticStretch(browser))
  }
})

function positiveElasticStretch(browser) {
  return `${browser}: ${shippedFirstWithFollowers[browser]/firstToShipCounts[browser]}`
}
