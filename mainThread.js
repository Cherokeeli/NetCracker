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
var weibo = require('./tools/caspWeibo');
var cookies = require('./tools/Cookies');
var socketConnect = require('./tools/ioHub');
var ws = new WebSocket("ws://127.0.0.1:2000/socket");

var USER = '13267241477';
var PASS = 'ql13530088648';
var URL = 'http://m.weibo.cn/';
var UID = '5745465725';
var NUM = 0;

var fs = require('fs');
var messages = [];
//'1793285524';
var self_PID = 1;
//msgPage.cli.get(0);

//事件绑定
function bindThreadListener(casper) {
    casper.on('thread.completed', function () {
        if (NUM == 3)
            this.echo("sending END signal");
            ws.send("{PID:" + pid + ",type:END");
    });
}

//检测其他两个线程是否完成
function checkThreadExit(casper) {
    NUM++;
    casper.echo("Thread:" + NUM);
    casper.emit('thread.completed');
}

bindThreadListener(msgPage); //页面监听器绑定
bindThreadListener(focusPage);
bindThreadListener(userPage);



//三个线程开始运行
function startScraping(UID) {
    msgPage.start(URL, function () {
        weibo.login(USER, PASS, msgPage);
    }).then(function () {
        weibo.getMsg(UID, msgPage, function (info) {
            socketConnect.socketSend(info, "messages", self_PID);
        });
    }).run(checkThreadExit, msgPage);

    focusPage.start(URL, function () {
        weibo.login(USER, PASS, focusPage);
    }).then(function () {
        weibo.getFocusUsers(UID, focusPage, function (info) {
            socketConnect.socketSend(info, "focus", self_PID);
        });
    }).run(checkThreadExit, focusPage);

    userPage.start(URL, function () {
        weibo.login(USER, PASS, userPage);
    }).then(function () {
        weibo.getUser(UID, userPage, function (info) {
            socketConnect.socketSend(info, "user", self_PID);
            //userPage.echo(JSON.stringify(info, null, '\t'));
        });
    }).run(checkThreadExit, userPage);
}

startScraping(UID);

//socketConnect.socketMan(self_PID, function (UID) {
//    startScraping(UID);
//}); //socket监听器绑定
