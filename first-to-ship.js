const fs = require('fs')
const readline = require('readline')

const releaseDates = JSON.parse(fs.readFileSync('release-dates.json', {'encoding':'utf-8'}))

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
rl.on('line', (line) => {
  const fields = line.split(",")
  const interface = fields[0]
  const api = fields[1]

  if( fields.length > 2 ) {
    let firstReleaseData = fields[2].split(" ")
    let browser = firstReleaseData[0]
    let version = firstReleaseData[1]
    if(firstRelease(browser, version) && (browser == "Chrome" || browser == "Firefox")) {
      return
    }

    if( fields.length > 3 ) {
      let ambiguous = false
      for( let i = 3; i < fields.length; i++ ) {
        let followerData = fields[i].split(" ")
        let followerBrowser = followerData[0]
        let followerVersion = followerData[1]

        if( firstRelease(followerBrowser, followerVersion) ) {
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
        dateDiffs[browser].push(computeReleaseDateDifference(browser, version, followerBrowser, followerVersion))
      }
    }
    else {
      firstToShipCounts[browser]++
    }
  }
})

function firstRelease(browser, version) {
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
  console.log(ambiguousCases)

  for( browser of Object.keys(firstToShipCounts) ) {
    console.log(minimumPositiveElasticStretch(browser))
    console.log(maximumPositiveElasticStretch(browser))
    console.log(`Avg delay: ${average(dateDiffs[browser])} Median delay: ${median(dateDiffs[browser])}`)
  }
  console.log(dateDiffs["Firefox"])
})

function average(arr) {
  let sum = 0
  for(let el of arr) {
    sum += el
  }
  return sum / arr.length
}

function median(arr) {
  let sorted = arr.sort((a, b) => a - b)
  if( sorted.length % 2 == 0 ) {
    let mid = sorted.length / 2
    return (sorted[mid] + sorted[mid+1]) / 2
  }
  return sorted[Math.round(sorted.length/2)]
}

function minimumPositiveElasticStretch(browser) {
  return `${browser}: ${shippedFirstWithFollowers[browser]/firstToShipCounts[browser]}`
}

function maximumPositiveElasticStretch(browser) {
  let maxShippedWithFollowers = shippedFirstWithFollowers[browser] + ambiguousCases[browser]
  let maxFirstToShip = firstToShipCounts[browser] + ambiguousCases[browser]
  return `${browser}: ${maxShippedWithFollowers/maxFirstToShip}`
}

function computeReleaseDateDifference(browser1, version1, browser2, version2) {
  release1 = releaseDates[browser1][version1].split("-")
  release2 = releaseDates[browser2][version2].split("-")

  let dateDifference = computeDateDifference(release1, release2)

  return dateDifference
}

function computeDateDifference(date1, date2) {
  let dateDifference = ( parseInt(date2[0]) - parseInt(date1[0]) ) * 365
  let month1 = parseInt(date1[1])
  let month2 = parseInt(date2[1])
  if(month1 <= month2) {
    dateDifference += ( month2 - month1 ) * 30
  }
  else {
    dateDifference += (12 - month1 + month2) * 30
  }
  let day1 = parseInt(date1[2])
  let day2 = parseInt(date2[2])
  if(day1 <= day2) {
    dateDifference += day2 - day1
  }
  else {
    dateDifference += 30 - day1 + day2
  }

  return dateDifference
}
