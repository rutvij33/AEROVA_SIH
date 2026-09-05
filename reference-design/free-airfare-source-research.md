# Free airfare data source research

## Findings

Skyscanner's official Flights Live Prices API returns bookable flight prices for a specified route and date through a `/create` then `/poll` workflow. Its documentation is public, but access is tied to the Skyscanner partner/API program rather than an openly anonymous endpoint, so it is not a guaranteed zero-setup source.

Amadeus for Developers provides flight-offer search APIs and a developer portal, but the portal requires account credentials and API keys. It can be a free-to-start source in a test environment, but it is still a credentialed third-party dependency and does not meet a strict “no signup / no key” interpretation of free.

Aviationstack has a free plan, but its public offering is primarily flight tracking/status data; it is not a suitable source for actual fare prices or a price index.

## Current product implication

A genuinely real-time airfare price index cannot be calculated honestly from an anonymous, unlimited public endpoint discovered here. The dashboard should either use a free-to-start credentialed provider such as Amadeus after the user supplies a key, or be implemented as a clearly labeled dashboard prototype until an airfare observation feed is connected. It must not display fabricated live values or imply that platform metrics are official CPI statistics.

## References

1. [Skyscanner Flights Live Prices API — Overview](https://developers.skyscanner.net/docs/flights-live-prices/overview)
2. [Amadeus for Developers](https://developers.amadeus.com/)
3. [Aviationstack](https://aviationstack.com/)

## Duffel request fields used in the dashboard

Duffel’s current v2 Offer Requests documentation describes a POST request to `/air/offer_requests` with required `slices` and `passengers`, plus `cabin_class` and `max_connections`. The implementation uses `return_offers=true`, `supplier_timeout=10000`, and `view=offers`, then reads returned offer prices and operating-carrier names. The returned token is explicitly recognized as test mode when it begins with `duffel_test_`, so the dashboard labels the feed accordingly.

4. [Duffel Offer Requests API v2](https://duffel.com/docs/api/v2/offer-requests)
