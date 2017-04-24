//**************************************************************
//
//                  Master control flow
//worker process.  To control the workflow of extracting content
//************************************************************** 

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

function getRandomWait(min, max) {
    return 1000 * Math.random() * (max - min) + min;
}

var userAgentPool = [
    //    'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; en-us) AppleWebKit/534.50 (KHTML, like Gecko) Version/5.1 Safari/534.50',
    'Mozilla/5.0 (Windows; U; Windows NT 6.1; en-us) AppleWebKit/534.50 (KHTML, like Gecko) Version/5.1 Safari/534.50'
    //    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.6; rv:2.0.1) Gecko/20100101 Firefox/4.0.1',
    //    'Mozilla/5.0 (Windows NT 6.1; rv:2.0.1) Gecko/20100101 Firefox/4.0.1',
    //    'Opera/9.80 (Macintosh; Intel Mac OS X 10.6.8; U; en) Presto/2.8.131 Version/11.11',
    //    'Opera/9.80 (Windows NT 6.1; U; en) Presto/2.8.131 Version/11.11',
    //    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_0) AppleWebKit/535.11 (KHTML, like Gecko) Chrome/17.0.963.56 Safari/535.11',
    //'Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_3_3 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8J2 Safari/6533.18.5'
];

var msgPage = require("casper").create({
    pageSettings: {
        loadImages: false,
        loadPlugins: true,
        userAgent: userAgentPool[0]
    },
    viewportSize: { width: 1024, height: 600 }, //page size setting
    //        ,
    //    verbose: true,
    //    logLevel: "debug",
    onError: function (msg, backtrace) {
        this.capture('error.png');
        console.log("ERRROR:" + msg);
        //throw new ErrorFunc("fatal","error","filename",backtrace,msg);
    }
});

var x = require('casper').selectXPath;
var news = require('./tools/news_extract');
var cookies = require('./tools/Cookies');
var socket = require('./tools/io_hub');
var fs = require('fs');
var loaderror = require('./tools/error_handler');
var utils = require('utils');
var pageURL;


loaderror.configure(msgPage);


var USER = '16420535';
var PASS = 'Ql.1994822';
var URL = 'http://library.hkbu.edu.hk/main/quicklink_Wisenews.html';
var UID;
var NUM = 0;



var messages = [];
//'1793285524';
var self_PID = msgPage.cli.get(0);


//事件绑定
function bindThreadListener(casper, PID) {
    casper.echo('begin listen');
    casper.on('thread.completed', function () {
        if (NUM == 1) {
            //this.exit(1);
            this.echo("[WEBSOCKET]sending END signal");
            socket.sendWs(0, 'END', PID);
        }
    });

    casper.on('thread.send', function (msg) {
        //if (msg) {
        socket.sendWs(msg, 'MESSAGE', PID);
        //}
    });

    casper.on('thread.check', function () {
        this.echo("Sending Status Checking");
        socket.sendWs(1, 'LIVE', PID);
    });

    casper.on('thread.retrytimeout', function () {
        this.echo('Retry Connection Timeout');
        socket.sendWs(1, 'WTIMEOUT', PID);
    });

    casper.on('thread.tasksfinished', function () {
        socket.sendWs(1, 'COUNT', PID);
    })
}


//检测其他进程是否完成
function checkThreadExit(casper) {
    NUM++;
    casper.echo("Thread:" + NUM + " finished");
    casper.emit('thread.completed');
    //this.exit();
}

//三个线程开始运行
function startScraping(UID) {
    msgPage.start(URL, function () {
        news.login(USER, PASS, msgPage);
        this.then(function () {
            news.configSetting(UID, msgPage);
        });
        this.then(function() {
            news.firstPage(msgPage);
        });
        //pageURL = utils.format('http://libwisenews.wisers.net.lib-ezproxy.hkbu.edu.hk/wisenews/content.do?wp_dispatch=menu-content&menu-id=/commons/CFT-HK/DA000-DA003-DA010-/DA000-DA003-DA010-65107-&cp&cp_s=%s&cp_e=%s', parseInt(UID), parseInt(UID) + 50);
        //this.echo("pageURL: " + pageURL);
    });
    msgPage.then(function () {
            news.pageProcessing(msgPage);
    });
    
    msgPage.run(msgPage);
}

socket.createWs(self_PID, function (UID) { //while this child process is running, connect to master process 
    bindThreadListener(msgPage, self_PID); //页面监听器绑定
    startScraping(UID);
    //statusChecker(msgPage, self_PID); 
});
