var express = require('express');

var app = express.createServer();
app.use(express.bodyParser());
app.use(express.static(__dirname + '../../../'));

var contentTypes = {
    text: 'text/plain',
    html: 'text/html',
    xml: 'application/xml',
    json: 'application/json',
    script: 'application/javascript'
};
contentTypes.javascript = contentTypes.script;

var getParam = function(req, name) {
    var paramValue = req.query[name] || req.body[name];
    delete req.query[name];
    delete req.body[name];
    return paramValue;
};

app.all('/', function(req, res){
    var body = getParam(req, '__body');
    var sleep = getParam(req, '__sleep') || 0;
    var type = getParam(req, '__type');

    if (!body) {
        body = {method: req.method.toLowerCase()};
        if (sleep) {
            body.sleep = sleep;
        }
        if (Object.keys(req.query).length) {
            body.get = req.query;
        }
        if (Object.keys(req.body).length) {
            body.post = req.body;
        }
    } else {
        res.header('Content-Type', contentTypes[type] || contentTypes.html);
    }

    setTimeout(function() {
        res.send(body);
    }, sleep);
});

app.listen(3000);
console.log('Access http://localhost:3000/Specs/Runner/ to run specs');

