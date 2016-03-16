var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var users = require('./routes/users');

var request = require('request');


var app = express();

app.get('/',function(req,res) {
    request('http://m.weibo.cn/',function(error,response,body) {
        if(!error && response.statusCode == 200) {
            console.log(body);
            //res.send(body);
            res.send('End Crawl,Please check the terminal');
        }
    });
});

app.listen(4000,function(){
    console.log('listening on 4000');
});