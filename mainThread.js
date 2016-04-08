//*************************
//爬虫主进程casperjs
//*************************

var msgPage = require("casper").create({
    pageSettings: {
        loadImages: false,
        loadPlugins: false,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 7_0 like Mac OS X; en-us) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53'
    },
    verbose: true,
    logLevel: "debug"

});

var focusPage = require("casper").create({
    pageSettings: {
        loadImages: false,
        loadPlugins: false,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 7_0 like Mac OS X; en-us) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53'
    },
    verbose: true,
    logLevel: "debug"

});

var userPage = require("casper").create({
    pageSettings: {
        loadImages: false,
        loadPlugins: false,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 7_0 like Mac OS X; en-us) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53'
    },
    verbose: true,
    logLevel: "debug"

});


var x = require('casper').selectXPath;
try {
    var weibo = require('./tools/caspWeibo');

    var cookies = require('./tools/Cookies');
} catch (err) {
    console.log(err);
}
var USER = '13267241477';
var PASS = 'ql13530088648';
var fs = require('fs');
var messages = [];
var userID;
//'1793285524';
//


msgPage.start('http://m.weibo.cn/', function () {
    weibo.login(USER, PASS,msgPage);
}).then(function (userID) {
    userID = '5745465725';
    weibo.getMsg(userID,msgPage);
    //weibo.getUser(userID,msgPage);
    //weibo.getFocusUsers(userID,casper);
    //this.echo(this.fetchText('p.default-content'))
    //messages=messages.concat(this.evaluate(casper.getMessages));
}).run(function() {});

focusPage.start('http://m.weibo.cn/', function () {
    weibo.login(USER, PASS,focusPage);
}).then(function (userID) {
    userID = '5745465725';
    //weibo.getMsg(userID,casper);
    //weibo.getUser(userID,casper);
    weibo.getFocusUsers(userID,focusPage);
    //this.echo(this.fetchText('p.default-content'))
    //messages=messages.concat(this.evaluate(casper.getMessages));
}).run(function() {});

userPage.start('http://m.weibo.cn/', function () {
    weibo.login(USER, PASS,userPage);
}).then(function (userID) {
    userID = '5745465725';
    //weibo.getMsg(userID,casper);
    weibo.getUser(userID,userPage);
    //weibo.getFocusUsers(userID,userPage);
    //this.echo(this.fetchText('p.default-content'))
    //messages=messages.concat(this.evaluate(casper.getMessages));
}).run(function() {});

