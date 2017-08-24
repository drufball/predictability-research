const fs = require('fs')
const readline = require('readline')
const helpers = require('./helpers.js')
const interfaceCounts = JSON.parse(fs.readFileSync('data/interface-counts.json', {'encoding':'utf-8'}))

const rl = readline.createInterface({
  input: fs.createReadStream('data/sanitized-api-data.csv')
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
let ambiguousCases = {
  "Chrome": 0,
  "Firefox": 0,
  "Edge": 0,
  "Safari": 0
}
let dateDiffs = {
  "Chrome": [],
  "Firefox": [],
  "Edge": [],
  "Safari": []
}
rl.on('line', computeImplementationOrder)
rl.on('close', printResults)

function computeImplementationOrder(implData) {
  const fields = implData.split(",")
  const interf = fields[0]
  const api = fields[1]

  if( fields.length > 2 ) {
    let firstReleaseData = fields[2].split(" ")
    let browser = firstReleaseData[0]
    let version = firstReleaseData[1]

    // We have so little data for Edge, it's not worth excluding the first version
    if(helpers.firstRelease(browser, version) && (browser != "Edge")) {
      return
    }

    if( fields.length > 3 ) {
      let ambiguous = false
      for( let i = 3; i < fields.length; i++ ) {
        let followerData = fields[i].split(" ")
        let followerBrowser = followerData[0]
        let followerVersion = followerData[1]

        // If one of the follower browsers is the first release in our data
        // set for that browser, we don't know if the API was implemented
        // previously.
        if( helpers.firstRelease(followerBrowser, followerVersion) ) {
          ambiguousCases[browser] += 1.0 / interfaceCounts[interf];
          ambiguous = true
        }
      }
      if( !ambiguous ) {
        firstToShipCounts[browser] += 1.0 / interfaceCounts[interf];
        shippedFirstWithFollowers[browser] += 1.0 / interfaceCounts[interf];

        let followerData = fields[3].split(" ")
        let followerBrowser = followerData[0]
        let followerVersion = followerData[1]
        let dateDiff = helpers.computeReleaseDateDifference(browser, version, followerBrowser, followerVersion)
        dateDiffs[browser].push(dateDiff)
      }
    }
    else {
      firstToShipCounts[browser] += 1.0 / interfaceCounts[interf];
    }
  }
}

function printResults() {
  for( browser of Object.keys(firstToShipCounts) ) {
    let minStretch = helpers.convertToPercent(minimumPositiveElasticStretch(browser))
    let maxStretch = helpers.convertToPercent(maximumPositiveElasticStretch(browser))
    console.log(`${browser}:`)
    console.log(`Shipped ${firstToShipCounts[browser]} to ${firstToShipCounts[browser] + ambiguousCases[browser]} interface adjusted counts first`)
    console.log(`${minStretch}-${maxStretch}% of interface adjusted counts shipped first have another implementation`)

    console.log('')
  }
}

function minimumPositiveElasticStretch(browser) {
  return shippedFirstWithFollowers[browser] / firstToShipCounts[browser]
}

function maximumPositiveElasticStretch(browser) {
  let maxShippedWithFollowers = shippedFirstWithFollowers[browser] + ambiguousCases[browser]
  let maxFirstToShip = firstToShipCounts[browser] + ambiguousCases[browser]
  return maxShippedWithFollowers / maxFirstToShip
}
