//*************************
//爬虫主进程
//*************************

var casper = require("casper").create();
var x = require('casper').selectXPath;
var weibo = require('./tools/caspWeibo');
var USER = '13267241477';
var PASS = 'ql13530088648';
var messages=[];

casper.getMessages=function() {
    var messages = document.querySelectorAll('p.default-content');
    return Array.prototype.map.call(messages, function(e) {
        return e.innerHTML;
    });
}

casper.start('http://m.weibo.cn/',function() {
    weibo.login(USER,PASS);
});

casper.then(function() {
    //this.echo(this.fetchText('p.default-content'))
    messages=messages.concat(this.evaluate(casper.getMessages));
});
             
casper.run(function() {
    this.echo(messages.length+' messages found:');
    this.echo(' - ' + messages.join('\n--------------------\n')).exit();
});

