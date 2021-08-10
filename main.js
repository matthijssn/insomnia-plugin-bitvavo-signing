/* eslint-disable no-prototype-builtins, new-cap */
// insomnia_plugin_binance_signing.js

const CryptoJS = require('crypto-js');

const bitvavoUrl = 'https://api.bitvavo.com';

const recvWindow = 5000;

function encodeURL(str) {
  return str.replace(/\+/g, '-').replace(/\//g, '_');
}

function computeHttpSignature(msg, key) {
  const hash = CryptoJS.HmacSHA256(msg, key);
  const hashInHex = encodeURL(CryptoJS.enc.Hex.stringify(hash));
  return hashInHex;
}

function computeSigningBase(req) {
    // Get all parameters from the request and generate a query string
    var timestamp = req.getParameter('BITVAVO-ACCESS-TIMESTAMP');

    //1548172481125POST/v2/order{"market":"BTC-EUR","side":"buy","price":"5000","amount":"1.23","orderType":"limit"}

    var bodyText = req.getBodyText();
    var minBodyText = "";
    if(bodyText != '')
    {
        minBodyText = JSON.stringify(JSON.parse(bodyText))
    }
    
    var signstring = `${timestamp}${req.getMethod()}${req.getUrl().replace(bitvavoUrl,'')}${minBodyText}`;
  
    return signstring;
  }  

module.exports.requestHooks = [
    (context) => {
        // Validate context object
        if (context === null || context === undefined) {
            console.log('Invalid context');
            return;
        }
        // Validate request
        if (
            !context.hasOwnProperty('request') ||
            context['request'] === null ||
            context['request'] === undefined ||
            context['request'].constructor.name != 'Object'
        ) {
            console.log('Invalid request');
            return;
        }
        const req = context.request;
        // Check the URL points to the Bitvavo API
        if (
            !req.hasOwnProperty('getUrl') ||
            req['getUrl'] == null ||
            req['getUrl'].constructor.name != 'Function' ||
            !req.getUrl().startsWith(bitvavoUrl)
        ) {
            console.log('Not a Bitvavo API URL');
            return;
        }
        // Check if a timestamp parameter exists
        if (!req.hasParameter('BITVAVO-ACCESS-TIMESTAMP')) {
            console.log('No BITVAVO-ACCESS-TIMESTAMP parameter, not signing.');
            return;
        }

        // Check for a valid api key
        const key = req.getEnvironmentVariable('bitvavo_api_secret');
        if (key == null) {
            console.log(
                'Could not find environment variable "bitvavo_api_secret". Cannot sign message'
            );
            throw new Error(
                "Message should be signed, but cannot find 'bitvavo_api_secret' environment variable."
            );
        }
      
        if (req.hasParameter('BITVAVO-ACCESS-SIGNATURE')) {
            throw new Error(
                'This message should be signed, but signature parameter is already filled in!'
            );
        }

        console.log(
            'Looks like a signed Bitvavo request. Appending recvWindow and signature parameters'
        );

        //sett the receive window
       //req.setParameter('recvWindow', recvWindow);
        console.log(`Set receive window to ${recvWindow} milliseconds.`);

        // Get the parameter string
        const message = computeSigningBase(req);
        // Generate the signature
        const signature = computeHttpSignature(message, key);

        // Set the signature
        //req.setParameter('BITVAVO-ACCESS-SIGNATURE', signature);

        //remove parameter
       
        //Set headers
        req.setHeader('BITVAVO-ACCESS-KEY', req.getEnvironmentVariable('bitvavo_api_key'));
        req.setHeader('BITVAVO-ACCESS-SIGNATURE', signature);
        req.setHeader('BITVAVO-ACCESS-TIMESTAMP', req.getParameter('BITVAVO-ACCESS-TIMESTAMP'));
       // req.setHeader('BITVAVO-ACCESS-WINDOW', recvWindow);

        req.removeParameter('BITVAVO-ACCESS-TIMESTAMP');
        console.log('Done signing');
    }
]