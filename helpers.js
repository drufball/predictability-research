const fs = require('fs')
const releaseDates = JSON.parse(fs.readFileSync('data/release-dates.json', {'encoding':'utf-8'}))

module.exports = {
  firstRelease: function(browser, version) {
    let firstReleases = {
      "Chrome":["38"],
      "Firefox":["34"],
      "Edge":["13"],
      "Safari":["534"]
    }

    return firstReleases[browser].includes(version)
  },

  computeReleaseDateDifference: function(browser1, version1, browser2, version2) {
    release1 = releaseDates[browser1][version1].split("-")
    release2 = releaseDates[browser2][version2].split("-")

    let dateDifference = computeDateDifference(release1, release2)

    return dateDifference
  },

  average: function(arr) {
    let sum = 0
    for(let el of arr) {
      sum += el
    }
    return sum / arr.length
  },

  median: function(arr) {
    let sorted = arr.sort((a, b) => a - b)
    if( sorted.length % 2 == 0 ) {
      let mid = sorted.length / 2
      return (sorted[mid] + sorted[mid+1]) / 2
    }
    return sorted[Math.round(sorted.length/2)]
  },

  convertToPercent: function(decimal) {
    return Math.round(decimal * 100)
  }
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
