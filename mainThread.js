//*************************
//爬虫主进程casperjs
//*************************

var msgPage = require("casper").create({
    pageSettings: {
        loadImages: false,
        loadPlugins: false,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 7_0 like Mac OS X; en-us) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53'
    }
    //    ,
    //    verbose: true,
    //    logLevel: "debug"

});

var focusPage = require("casper").create({
    pageSettings: {
        loadImages: false,
        loadPlugins: false,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 7_0 like Mac OS X; en-us) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53'
    }
    //    ,
    //    verbose: true,
    //    logLevel: "debug"

});

var userPage = require("casper").create({
    pageSettings: {
        loadImages: false,
        loadPlugins: false,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 7_0 like Mac OS X; en-us) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53'
    }
    //    ,
    //    verbose: true,
    //    logLevel: "debug"

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
var URL = 'http://m.weibo.cn/';
var UID = '5745465725';
var NUM = 0;

var fs = require('fs');
var messages = [];
//'1793285524';

//事件绑定
function bindThreadListener(casper) {
    casper.on('thread.completed', function () {
        if (NUM == 3)
            this.exit();
    });
}

//检测其他两个线程是否完成
function checkThreadExit(casper) {
    NUM++;
    //casper.echo(NUM);
    casper.emit('thread.completed');
}

bindThreadListener(msgPage);
bindThreadListener(focusPage);
bindThreadListener(userPage);

//三个线程开始运行
msgPage.start(URL, function () {
    weibo.login(USER, PASS, msgPage);
}).then(function () {
    weibo.getMsg(UID, msgPage, function (info) {
        for (var x in info) {
            console.log(JSON.stringify(info[x], null, '\t'));
        }
    });
}).run(checkThreadExit, msgPage);

focusPage.start(URL, function () {
    weibo.login(USER, PASS, focusPage);
}).then(function () {
    weibo.getFocusUsers(UID, focusPage, function (info) {
        for (var x in info) {
            console.log(info[x]);
        }
    });
}).run(checkThreadExit, focusPage);

userPage.start(URL, function () {
    weibo.login(USER, PASS, userPage);
}).then(function () {
    weibo.getUser(UID, userPage, function (info) {
        console.log(JSON.stringify(info, null, '\t'));
    });
}).run(checkThreadExit, userPage);
