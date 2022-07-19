const request = require('request');

var _uri = ''
var authorization = ''

function url(newURL){
  if(newURL !== undefined){ _uri = newURL}
  return _uri
}

function authorization(user,pass){
  authorization = 'Basic ' + Buffer.from(user + ':' + pass).toString('base64');
}

function options(){
  return {
    'uri': _uri,
    'headers': {
      'Authorization': authorization,
      'Content-Type': 'application/json',
    }
  }
}

function get(jsonObj,_options) {
  // Load default options set if no options are set
  return new Promise((resolve,reject) => {
    if(_options === undefined){ _options = options()}
    _options.method = 'GET'
    _options.body = JSON.stringify(jsonObj)
    console.log(_options)
    request(_options, function (error, response) {
      if (error) reject(error);
      console.log(response.body);
      resolve(JSON.parse(response.body))
    });
  })
  
}

function post(jsonObj,_options) {
  // Load default options set if no options are set
  return new Promise((resolve,reject) => {
    if(_options === undefined){ _options = options()}
    _options.method = 'POST'
    _options.body = JSON.stringify(jsonObj)
    console.log(_options)
    request(_options, function (error, response) {
      if (error) reject(error);
      console.log(response.body);
      resolve(JSON.parse(response.body))
    });
  })
}

module.exports = { url,authorization,get,post }
