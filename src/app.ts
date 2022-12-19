/**
 * NetSuite OAuth connection example.
 * @developer Esteban Damazio
 * @contact edamazzio@crowdintelligence.net
 */



const httpMethod = 'GET';
// Url without any params
const netsuiteUrl = new URL('https://#account-id#.restlets.api.netsuite.com/app/site/hosting/restlet.nl');

const getParameters = {
    'script':'1465',
    'deploy':'1',
}

netsuiteUrl.search = new URLSearchParams(getParameters).toString();

const realm = ''; // NetSuite account
const consumerSecret = '';
const tokenSecret = '';
const consumerKey = '';
const token = '';

// Build the object with all the OAuth parameters AND the url params as well
const parameters = {
    oauth_consumer_key: consumerKey,
    oauth_token: token,
    oauth_nonce: uuid.v1().split('-').join(''), // random string. In this example only lowercase letters and numbers
    oauth_timestamp: Math.floor(new Date().getTime() / 1000).toString(),
    oauth_signature_method: 'HMAC-SHA256',
    oauth_version: '1.0',
    ...getParameters
};

// Create a new object with the parameters keys sorted
let orderedParameters = {};

for (const [key, value] of Object.entries(parameters).sort()) {
    orderedParameters[key] = value
}


// Escape all the values and URI-encode all the keys and concatenate them on a string
// Result: keyA=valueA&keyB=valueB
let encodedParameters = '';
for (let param in orderedParameters) {

    let encodedValue = escape(orderedParameters[param]);
    let encodedKey = encodeURIComponent(param);
    encodedParameters += `${encodedKey}=${encodedValue}&`;
}
// remove last &
encodedParameters = encodedParameters.slice(0, -1);

// URI-encode the base url without the url parameters(https://.restlets.api.netsuite.com/app/site/hosting/restlet.nl)
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


function getRandomString(maxLength?: number){
    var chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    maxLength = maxLength ? maxLength : chars.length;
    return chars.split("").reduce((res, curr) => {
        return chars.charAt(Number((Math.random()*100%chars.length).toFixed(0)))
    }).slice(0, maxLength);
}