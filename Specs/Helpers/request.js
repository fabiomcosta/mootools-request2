var express = require('express');

var app = express.createServer();

app.use(express.bodyParser());

app.get('/', function(req, res){
    console.log(req, res);
});

app.listen(3000);
console.log('Test server listening on port 3000');

