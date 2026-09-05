
## OpenSky flight-map findings

OpenSky’s official REST API exposes `GET /states/all` for live state vectors and supports WGS84 bounding-box filters using `lamin`, `lomin`, `lamax`, and `lomax`. State vectors include fields such as ICAO24, callsign, origin country, longitude, and latitude. The current official documentation says OpenSky uses OAuth2 client credentials and no longer accepts basic username/password authentication. A standalone API key cannot be assumed to be an OpenSky credential, so the user-provided key must not be sent to OpenSky until its provider and endpoint are confirmed.

Sources: https://openskynetwork.github.io/opensky-api/ and https://openskynetwork.github.io/opensky-api/rest.html

## Aviationstack findings

Aviationstack’s official FAQ states that its real-time flight responses can include latitude, longitude, altitude, and speed, which supports a live aircraft map. The official FAQ also advertises a free access tier limited to 100 requests per month. The API documentation page is hosted by APILayer; the provider’s public site links to it as the API documentation source. The dashboard should therefore use the key server-side, refresh conservatively, attribute Aviationstack, and surface free-plan/rate-limit errors rather than polling aggressively.

Sources: https://aviationstack.com/faq and https://docs.apilayer.com/aviationstack/docs/api-documentation
