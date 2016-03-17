//*************************
//爬虫主进程casperjs
//*************************

var casper = require("casper").create({
    pageSettings:{
        loadImages: false
    }
});
var x = require('casper').selectXPath;
var weibo = require('./tools/caspWeibo');
var USER = '13267241477';
var PASS = 'ql13530088648';
var messages=[];



casper.start('http://m.weibo.cn/',function() {
    weibo.login(USER,PASS);
});

casper.thenOpen('http://m.weibo.cn/u/2271625161',function() {
    weibo.getMsg();
    //this.echo(this.fetchText('p.default-content'))
    //messages=messages.concat(this.evaluate(casper.getMessages));
});
             
casper.run(function() {
    //this.echo(messages.length+' messages found:');
    //this.echo(' - ' + messages.join('\n--------------------\n')).exit();
});

