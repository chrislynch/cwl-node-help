const request = require('request');

var url = ''
var authorization = ''

function url(newURL){
  if(!newURL === undefined){ url = newURL}
  return url
}

function authorization(user,pass){
  authorization = 'Basic ' + Buffer.from(user + ':' + pass).toString('base64');
}

function options(){
  return {
    'url': url,
    'headers': {
      'Authorization': authorization,
      'Content-Type': 'application/json',
    }
  }
}

function jsonget(jsonObj,options) {
  // Load default options set if no options are set
  if(options === undefined){ options = options()}
  options.method = 'GET'
  options.body = JSON.stringify(jsonObj)
  request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log(response.body);
  });
}

