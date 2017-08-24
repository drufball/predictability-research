const fs = require('fs')
const readline = require('readline')
const helpers = require('./helpers.js')

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
  const interface = fields[0]
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
          ambiguousCases[browser]++
          ambiguous = true
        }
      }
      if( !ambiguous ) {
        firstToShipCounts[browser]++
        shippedFirstWithFollowers[browser]++

        let followerData = fields[3].split(" ")
        let followerBrowser = followerData[0]
        let followerVersion = followerData[1]
        let dateDiff = helpers.computeReleaseDateDifference(browser, version, followerBrowser, followerVersion)
        dateDiffs[browser].push(dateDiff)
      }
    }
    else {
      firstToShipCounts[browser]++
    }
  }
}

function printResults() {
  for( browser of Object.keys(firstToShipCounts) ) {
    let minStretch = helpers.convertToPercent(minimumPositiveElasticStretch(browser))
    let maxStretch = helpers.convertToPercent(maximumPositiveElasticStretch(browser))
    console.log(`${browser}:`)
    console.log(`Shipped ${firstToShipCounts[browser]} to ${firstToShipCounts[browser] + ambiguousCases[browser]} APIs first`)
    console.log(`${minStretch}-${maxStretch}% of APIs shipped first have another implementation`)
    console.log(`Average time to second implementation: ${Math.round(helpers.average(dateDiffs[browser]))} days`)
    console.log(`Median time to second implementation: ${Math.round(helpers.median(dateDiffs[browser]))} days`)

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
