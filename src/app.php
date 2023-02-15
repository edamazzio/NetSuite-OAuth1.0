<?php


function sort_array($array){
    $sorted_keys = array_keys($array);
    sort($sorted_keys);
    $new_array = [];
    foreach ($sorted_keys as $key){
        $new_array[$key] = $array[$key];
    }
    return $new_array;
}

$http_method = 'GET';
$netsuite_url = '';
$get_parameters = [
    "script" => "",
    "deploy" => "",
];

$realm = ""; // NetSuite account
$consumer_key = "";
$consumer_secret = "";
$token = "";
$token_secret = "";

$parameters = array_merge([
    "oauth_consumer_key" =>  $consumer_key,
    "oauth_token" =>  $token,
    "oauth_nonce" =>  "asdf1234jk",
    "oauth_timestamp" =>  time(),
    "oauth_signature_method" =>  "HMAC-SHA256",
    "oauth_version" =>  "1.0"], 
    $get_parameters
);

$sorted_paramters = sort_array($parameters);

$encoded_parameters = "";

// Escape all the values and URI-encode all the keys and concatenate them on a string
// Result: keyA=valueA&keyB=valueB
foreach ($sorted_paramters as $key => $value) {
    $encoded_key = rawurlencode($key);
    $encoded_value = rawurlencode($value);
    $encoded_parameters = "{$encoded_parameters}{$encoded_key}={$encoded_value}&";
}

// remove last &
$encoded_parameters = rtrim($encoded_parameters, "&");

// URI-encode the base url without the url parameters(https://.restlets.api.netsuite.com/app/site/hosting/restlet.nl)
$encoded_url = rawurlencode($netsuite_url);
//
// URI-encode the parameters concatenated previously
$encoded_parameters = rawurlencode($encoded_parameters);
//
// This is the string that will be hashed
$signature_base_string = "{$http_method}&{$encoded_url}&{$encoded_parameters}";
echo "Signature base string:\n{$signature_base_string}\n\n";

// The key used to sign the hash
$signing_key = "{$consumer_secret}&{$token_secret}";
//
// Sign the request
$oauth_signature = base64_encode(hash_hmac("sha256", $signature_base_string, $signing_key, true));
//
$encoded_oauth_signature = rawurlencode($oauth_signature);
//
// The header that will be sent in the GET request
$authorization = "OAuth realm=\"{$realm}\",oauth_consumer_key=\"{$parameters["oauth_consumer_key"]}\",oauth_token=\"{$parameters["oauth_token"]}\",oauth_signature_method=\"{$parameters["oauth_signature_method"]}\",oauth_timestamp=\"{$parameters["oauth_timestamp"]}\",oauth_nonce=\"{$parameters["oauth_nonce"]}\",oauth_version=\"1.0\",oauth_signature=\"{$encoded_oauth_signature}\"";

echo "Authorization: \n{$authorization}\n\n";
echo "Signature: \n{$oauth_signature}\n\n";


$curl_request = curl_init();
$headers = array(
"Content-Type: application/json",
"Authorization: {$authorization}",
);

$request_url = $netsuite_url."?".http_build_query($get_parameters);
echo "Sending request to {$request_url}...\n\n";

curl_setopt($curl_request, CURLOPT_URL, $request_url);
curl_setopt($curl_request, CURLOPT_HTTPHEADER, $headers);

curl_setopt($curl_request, CURLOPT_CUSTOMREQUEST, "GET");

$result = curl_exec($curl_request);

echo "Response body:\n{$result}";

?>