# predictability-research
This research explores various ways to slice the data generated by the ecosystem infra team's API confluence tool. API confluence crawls the Javascript object graph in as many versions of Chrome, Safari, Firefox, and Edge that we can access. It records the presence or absence of each interface/API.

Currently, the only analysis we run is `first-to-ship.js`.

# First to ship results
For this analysis, we look at every API and determine the order of implementations (`sanitized-api-data.js` does this). From this we can compute, for each browser, how many APIs it was the first to ship. In other words, how much interop risk is that browser taking betting on new features?

From there, we look at how many of those first implementations ultimately led to a second implementation. In other words, how many of those bets on new features paid off?

We then calculate the average time it took for a second implementation to appear.

__Chrome:__
- Shipped 1152 to 1344 APIs first
- 45-53% of APIs shipped first have another implementation
- Average time to second implementation: 425 days
- Median time to second implementation: 497 days

__Firefox:__
- Shipped 1435 to 1512 APIs first
- 31-34% of APIs shipped first have another implementation
- Average time to second implementation: 170 days
- Median time to second implementation: 1 days

__Edge:__
- Shipped 1341 to 1341 APIs first
- 14-14% of APIs shipped first have another implementation
- Average time to second implementation: 612 days
- Median time to second implementation: 691 days

__Safari:__
- Shipped 760 to 760 APIs first
- 3-3% of APIs shipped first have another implementation
- Average time to second implementation: 159 days
- Median time to second implementation: 106 days

# Caveats
We do not count any APIs that were implemented in the first version available in our dataset for Chrome, Safari, or Firefox. This is because we can't tell who was the first to implement.

Additionally, there are several cases where an API first appears in one browser, but the earliest data we have for a different browser is after that appearance. In this case, we don't know whether the API just appeared in the second browser, or if it's been there for a long time. This is why we provide a range of possible "first to ship" values.
