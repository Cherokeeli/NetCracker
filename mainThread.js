//*************************
//爬虫主进程casperjs
//*************************

var casper = require("casper").create({
    pageSettings: {
        loadImages: false,
        loadPlugins: false,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 7_0 like Mac OS X; en-us) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53'
    }
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



casper.start('http://m.weibo.cn/', function () {
    try {
        weibo.login(USER, PASS);
    } catch (err) {
        this.echo(err);
    }
});

casper.thenOpen('http://m.weibo.cn/u/2271625161', function () {
    weibo.getMsg();
    //this.echo(this.fetchText('p.default-content'))
    //messages=messages.concat(this.evaluate(casper.getMessages));
});

casper.run(function () {
    //this.echo(messages.length+' messages found:');
    //this.echo(' - ' + messages.join('\n--------------------\n')).exit();

});
