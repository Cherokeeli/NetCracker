//*************************
//爬虫主进程casperjs
//*************************

var casper1 = require("casper").create({
    pageSettings: {
        loadImages: false,
        loadPlugins: false,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 7_0 like Mac OS X; en-us) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53'
    },
    verbose: true,
    logLevel: "debug"

});

var casper2 = require("casper").create({
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


casper1.start('http://m.weibo.cn/', function () {
    weibo.login(USER, PASS,casper1);
});

casper2.start('http://m.weibo.cn/', function () {
    //weibo.login(USER, PASS,casper2);
});

casper1.then(function (userID) {
    userID = '5745465725';
    weibo.getMsg(userID,casper1);
    //weibo.getUser(userID,casper);
    //weibo.getFocusUsers(userID,casper);
    //this.echo(this.fetchText('p.default-content'))
    //messages=messages.concat(this.evaluate(casper.getMessages));
});

casper2.then(function (userID) {
    userID = '5745465725';
    //weibo.getMsg(userID,casper);
    //weibo.getUser(userID,casper);
    weibo.getFocusUsers(userID,casper2);
    //this.echo(this.fetchText('p.default-content'))
    //messages=messages.concat(this.evaluate(casper.getMessages));
});

casper1.run(function () {
    //this.echo(messages.length+' messages found:');
    //this.echo(' - ' + messages.join('\n--------------------\n')).exit();

});

casper2.run(function () {
    //this.echo(messages.length+' messages found:');
    //this.echo(' - ' + messages.join('\n--------------------\n')).exit();

});
