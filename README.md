Based and inspired on plugin insomnia_plugin_binance_signing from anson-vandoren

[Link](hhttps://github.com/anson-vandoren/insomnia-plugin-binance-signing)

---

### Bitvavo request signing for Insomnia

All private Bitvavo API calls require adding a timestamp and then signing the request (HMAC-SHA256) prior to submitting. Insomnia doesn't have a built-in way to do this.
Bitvavo requires the following headers to the requests:

All signed REST requests must include the following headers:

BITVAVO-ACCESS-KEY: Your API Key.
BITVAVO-ACCESS-SIGNATURE: The signature for your REST request. This is explained below.
BITVAVO-ACCESS-TIMESTAMP: The current timestamp in milliseconds since 1 Jan 1970.
BITVAVO-ACCESS-WINDOW (optional): The window that allows execution of your request in milliseconds since 1 Jan 1970. The default value is 10000 (10s) and maximum value is 60000 (60s).


This plugin (when installed) checks all outgoing requests to see if:

- The request has valid context and URL
- The request is going to [https://api.bitvavo.com](https://api.bitvavo.com)
- The request has a `BITVAVO-ACCESS-TIMESTAMP` parameter already
- An Insomnia environment variable `bitvavo_api_secret` exists

If the above conditions are met, this plugin:

- Adds a `BITVAVO-ACCESS-TIMESTAMP` parameter. The default value is 5000msec. *A future version may allow this to be an environment variable instead.*
- Computes the HMAC signature based on the query string of the outgoing request and converts to hex.
- Appends the `BITVAVO-ACCESS-SIGNATURE` parameter with the computed digest.


