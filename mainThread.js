//*************************
//爬虫主进程casperjs
//*************************

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

function getRandomWait(min, max) {
    return 1000 * Math.random() * (max - min) + min;
}

var userAgentPool = [
//    'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; en-us) AppleWebKit/534.50 (KHTML, like Gecko) Version/5.1 Safari/534.50',
//    'Mozilla/5.0 (Windows; U; Windows NT 6.1; en-us) AppleWebKit/534.50 (KHTML, like Gecko) Version/5.1 Safari/534.50',
//    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.6; rv:2.0.1) Gecko/20100101 Firefox/4.0.1',
//    'Mozilla/5.0 (Windows NT 6.1; rv:2.0.1) Gecko/20100101 Firefox/4.0.1',
//    'Opera/9.80 (Macintosh; Intel Mac OS X 10.6.8; U; en) Presto/2.8.131 Version/11.11',
//    'Opera/9.80 (Windows NT 6.1; U; en) Presto/2.8.131 Version/11.11',
//    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_0) AppleWebKit/535.11 (KHTML, like Gecko) Chrome/17.0.963.56 Safari/535.11',
    'Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_3_3 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8J2 Safari/6533.18.5'
];

var msgPage = require("casper").create({
    pageSettings: {
        loadImages: false,
        loadPlugins: false,
        userAgent: userAgentPool[0]
    }
//            ,
//            verbose: true,
//            logLevel: "debug"
});

var focusPage = require("casper").create({
    pageSettings: {
        loadImages: false,
        loadPlugins: false,
        userAgent: userAgentPool[0]
    }
    //    ,
    //        verbose: true,
    //        logLevel: "debug"
});

var userPage = require("casper").create({
    pageSettings: {
        loadImages: false,
        loadPlugins: false,
        userAgent: userAgentPool[0]
    }
    //        ,
    //        verbose: true,
    //        logLevel: "debug"
});

//msgPage.options.onWaitTimeout = function(timeout, details) {
//    var selector = details.selector.type === 'xpath' ?
//            details.selector.path : details.selector;
//    this.echo("Wait timed out after " + timeout + " msec with selector: " + selector);
//    this.wait(2000,function() {
//        this.capture('./data/waitSelectorTimeout.png');
//    });
//
//    //socket.sendWs(0, "TIMEOUT", self_PID);
//};
//
//focusPage.options.onWaitTimeout = function(timeout, details) {
//    var selector = details.selector.type === 'xpath' ?
//            details.selector.path : details.selector;
//    this.echo("Wait timed out after " + timeout + " msec with selector: " + selector);
//    this.wait(2000,function() {
//        this.capture('./data/waitSelectorTimeout.png');
//    });
//    //socket.sendWs(0, "TIMEOUT", self_PID);
//
//};
//
//userPage.options.onWaitTimeout = function(timeout, details) {
//    var selector = details.selector.type === 'xpath' ?
//            details.selector.path : details.selector;
//    this.echo("Wait timed out after " + timeout + " msec with selector: " + selector);
//    this.wait(2000,function() {
//        this.capture('./data/waitSelectorTimeout.png');
//    });
//    socket.sendWs(0, "TIMEOUT", self_PID);
//};

//msgPage.options.onTimeout = function(timeout) {
//    socket.sendWs(0, "TIMEOUT", self_PID);
//}


var x = require('casper').selectXPath;
var weibo = require('./tools/caspWeibo');
var cookies = require('./tools/Cookies');
var socket = require('./tools/ioHub');
var fs = require('fs');
var loaderror = require('./tools/errorHandler');

loaderror.configure(msgPage);
loaderror.configure(focusPage);
loaderror.configure(userPage);

//phantom.injectJs('./tools/errorHandler.js')
//console.log("state:"+ws.readyState);

var USER = '13267241477';
var PASS = 'ql13530088648';
var URL = 'http://m.weibo.cn/';
var UID;
var NUM = 0;


var messages = [];
//'1793285524';
var self_PID = msgPage.cli.get(0);


//事件绑定
function bindThreadListener(casper, PID) {
    casper.echo('begin listen');
    casper.on('thread.completed', function () {
        if (NUM == 3) {
            //this.exit(1);
            this.echo("[WEBSOCKET]sending END signal");
            socket.sendWs(0, 'END', PID);
        }
    });
}

//检测其他两个线程是否完成
function checkThreadExit(casper) {
    NUM++;
    casper.echo("Thread:" + NUM);
    casper.emit('thread.completed');
}


//bindThreadListener(focusPage);
//bindThreadListener(userPage);



//三个线程开始运行
function startScraping(UID) {
    msgPage.start(URL, function () {
        weibo.login(USER, PASS, msgPage);
    }).then(function () {
        //this.wait(getRandomWait,1,10);
        weibo.getMsg(UID, msgPage, function (info) {
            socket.sendWs(info, "messages", self_PID);
        });
    }).run(checkThreadExit, msgPage);

    focusPage.start(URL, function () {
        weibo.login(USER, PASS, focusPage);
    }).then(function () {
        //this.wait(getRandomWait,1,10);
        weibo.getFocusUsers(UID, focusPage, function (info) {
            socket.sendWs(info, "focus", self_PID);
        });
    }).run(checkThreadExit, focusPage);

    userPage.start(URL, function () {
        weibo.login(USER, PASS, userPage);
    }).then(function () {
        //this.wait(getRandomWait,1,10);
        weibo.getUser(UID, userPage, function (info) {
            socket.sendWs(info, "user", self_PID);
        });
    }).run(checkThreadExit, userPage);
}


socket.createWs(self_PID, function (UID) {
        bindThreadListener(msgPage, self_PID); //页面监听器绑定
        bindThreadListener(focusPage, self_PID);
        bindThreadListener(userPage, self_PID);
        startScraping(UID);
});
