/**
 * NetSuite OAuth connection example.
 * @developer Esteban Damazio
 * @contact edamazzio@crowdintelligence.net
 */

import moment from 'moment';
import fetch from 'node-fetch';
import * as crypto from 'crypto';
import * as uuid from 'uuid';

const httpMethod = 'GET';
const netsuiteUrl = new URL('https://6510521-sb1.restlets.api.netsuite.com/app/site/hosting/restlet.nl');

const getParameters = {
    'script':'573',
    'deploy':'1',
    'method':'activityCodes'
}

netsuiteUrl.search = new URLSearchParams(getParameters).toString();

const realm = '6510521_SB1';
const consumerSecret = 'af07b755aa687e96af7139d55a4bc3cbafe42b37a9f91267a87a626c3ab7b153';
const tokenSecret = '78ef33d719ca17bfbad26fd7baca5f84476bbcf837e7f855ea713b66d65b810f';

// Build the object with all the OAuth parameters AND the url params as well
const parameters = {
    oauth_consumer_key: '0d4d05a74f3c6b13038b1e978eb52a0e80aa71d09a423a8c96758e7131fcfd77',
    oauth_token: '8fef4f7cb7cc3710066f447c43a929ffb79ad4462f257911384e5d639650519a',
    oauth_nonce: uuid.v1().split('-').join(''), // random string. In this example only lowercase letters and numbers
    oauth_timestamp: moment().utcOffset(-6).unix().toString(),
    oauth_signature_method: 'HMAC-SHA256',
    oauth_version: '1.0',
    ...getParameters
};

// Create a new object with the parameters keys sorted
let orderedParameters = {};
Object.keys(parameters).sort().forEach(function(key) {
    orderedParameters[key] = parameters[key];
});

// Escape all the values and URI-encode all the keys and concatenate them on a string
// Result: keyA=valueA&keyB=valueB
let encodedParameters = '';
for (let param in orderedParameters) {

    let encodedValue = escape(orderedParameters[param]);
    let encodedKey = encodeURIComponent(param);
    if(encodedParameters === ''){
        encodedParameters += `${encodedKey}=${encodedValue}`;
    }
    else{
        encodedParameters += `&${encodedKey}=${encodedValue}`;
    }
}
// URI-encode the base url without the url parameters(https://6510521-sb1.restlets.api.netsuite.com/app/site/hosting/restlet.nl)
const encodedUrl = encodeURIComponent(netsuiteUrl.href.split('?')[0]);

// URI-encode the parameters concatenated previously
encodedParameters = encodeURIComponent(encodedParameters);

// This is the string that will be hashed
const signatureBaseString = `${httpMethod}&${encodedUrl}&${encodedParameters}`
console.log(`Signature base string: ${signatureBaseString}\n`);

// The key used to sign the hash
const signingKey = `${consumerSecret}&${tokenSecret}`;

// Sign the request
const oauth_signature = crypto.createHmac('sha256', signingKey).update(signatureBaseString).digest('base64').toString();

const encoded_oauth_signature = encodeURIComponent(oauth_signature);

// The header that will be sent in the GET request
const authorization = `OAuth realm="${realm}",oauth_consumer_key="${parameters.oauth_consumer_key}",oauth_token="${parameters.oauth_token}",oauth_signature_method="${parameters.oauth_signature_method}",oauth_timestamp="${parameters.oauth_timestamp}",oauth_nonce="${parameters.oauth_nonce}",oauth_version="1.0",oauth_signature="${encoded_oauth_signature}"`;


async function sendGetRequest(url: string) {
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authorization,
        }
    });
    return response;
}

console.log(`Authorization: ${authorization}\n`);
console.log(`Sending request to ${netsuiteUrl.toString()}\n`);

sendGetRequest(netsuiteUrl.toString())
    .then(async data => {
        const textBody = await data.text().then(body => body);
        console.log(`status: ${data.status}. Body: ${textBody}`);
    });