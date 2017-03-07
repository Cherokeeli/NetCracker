//*************************
//
//
//
//微博模块
//
//
//
//
//*************************

//var x = require('casper').selectXPath;
//var cookies = require('./tool/Cookies');

//**************************************************************
//                       js DOM原型函数 sync
//**************************************************************


function getCurrentInfosNum() {
    return document.querySelectorAll('.card-list div.card').length;
} //getCurrentInfosNum


function getInnerHTML(selector) {
    //console.log('getHTML');
    try {
        var nodes = document.querySelectorAll(selector);
    } catch (err) {
        console.log(err);
    }

    console.log(nodes.length);
    return Array.prototype.map.call(nodes, function (e) {
        return e.innerHTML;
    });

}

function getAttriValue(selector, attribute) {
    //console.log('getAttributeValue');
    try {
        var nodes = document.querySelectorAll(selector);
    } catch (err) {
        console.log(err);
    }
    console.log(nodes.length);
    return Array.prototype.map.call(nodes, function (e) {
        return e.getAttribute(attribute);
    });

}

//**************************************************************
//                       casper数据操作
//**************************************************************
var getRandomWait = function (casper, min, max) {
    var time = 1000 * Math.random() * (max - min) + min;
    casper.wait(time);
}


var tryAndScroll = function (casper) {
        try {
            casper.echo('SCROLL '+casper.getCurrentUrl()+'!!');
            casper.scrollToBottom();
            //var info = casper.getElementInfo();
            //casper.wait(500);
            if (casper.exists('div.loading')) {
                var curItems = casper.evaluate(getCurrentInfosNum);
                casper.echo(curItems);
                casper.waitFor(function check() {
                    return curItems != casper.evaluate(getCurrentInfosNum);
                }, function then() {
                    getRandomWait(casper, 1, 5);
                    tryAndScroll(casper);
                }, function onTimeout() {
                    casper.emit('scroll.timeout', curItems);
                }, 40 * 1000);
            } else {
                casper.echo("No more items");
                return true;
            }
        } catch (err) {
            casper.echo(err);
        }
    } //casper.tryAndScroll

var getAvatarInfo = function (casper, callback) {
    casper.echo('GET Avatar');
    casper.capture('./data/avaInfo.png');
    var cards = [],
        value = [];
    result = new Object();

    casper.then(function () {
        try {
            cards = casper.evaluate(getInnerHTML, 'div.item-info-page span');
            value = casper.evaluate(getInnerHTML, 'div.item-info-page p');
        } catch (err) {
            this.echo(err);
        }
        result.isVerified = casper.exists('.yellow-v') ? 1 : 0;
    });
    casper.then(function () {
        for (x in cards) {
            switch (cards[x]) {
            case "昵称":
                result.nickname = value[x];
                break;
            case "性别":
                result.gender = value[x];
                break;
            case "所在地":
                result.address = value[x];
                break;
            case "简介":
                result.intro = value[x];
                break;
            case "生日":
                result.birthday = value[x];
                break;
            case "邮箱":
                result.email = value[x];
                break;
            case "博客":
                result.blog = value[x];
                break;
            case "QQ":
                result.QQ = value[x];
                break;
            }
        }
        //casper.echo(JSON.stringify(result, null, '\t'));
        callback(result);
    });
}

var getFocus = function (casper, callback) {
    casper.echo('GET FOCUS');
    var focus = [];
    var final = [];
    casper.capture('./data/focus.png');
    focus = casper.evaluate(getAttriValue, '.card.card10 a:nth-child(2)', 'href');
    for (var x in focus) {
        var uid = "";
        uid = focus[x].split('/');
        final[x] = uid[2];
        //casper.echo(final[x]);
    }
    callback(final);
}

var getMessagesCard = function (casper, callback) {

        casper.echo('GET CARDS');
        var cards = [];
        var tID = [];
        var tauthor = [];
        var ttime = [];
        var tfrom = [];
        var tmessage = [];
        var tbesend = [];
        var tlike = [];
        var tresend = [];
        casper.then(function () {
            tauthor = casper.evaluate(getInnerHTML, '.item-main span'); //微博作者
            ttime = casper.evaluate(getInnerHTML, '.item-minor span.time'); //发送时间
            tfrom = casper.evaluate(getInnerHTML, '.item-minor span.from'); //发送设备
            tmessages = casper.evaluate(getInnerHTML, '.weibo-detail p.default-content'); //发送内容
            tbesend = casper.evaluate(getInnerHTML, 'a[data-node=forward] em'); //转发数
            tlike = casper.evaluate(getInnerHTML, 'a[data-node=like] em'); //点赞数
            tresend = casper.evaluate(getAttriValue, '.weibo-detail div.extend-content', 'data-jump');
            tID = casper.evaluate(getAttriValue, '.card-list div.card.card9', 'data-jump'); //获取微博跳转链接
        });
        casper.then(function () {
            var i = 0;

            for (i = 0; i < tID.length; i++) {
                //console.log(i);
                cards[i] = new Object();
                cards[i].ID = tID[i];
                cards[i].author = tauthor[i]; //微博作者
                cards[i].time = ttime[i]; //发送时间
                cards[i].from = tfrom[i]; //发送设备
                cards[i].messages = tmessages[i]; //发送内容
                cards[i].besend = isNaN(tbesend[i]) ? 0 : parseInt(tbesend[i]); //转发数
                cards[i].like = isNaN(tlike[i]) ? 0 : parseInt(tlike[i]); //点赞数
                cards[i].resend = tresend[i];
                //casper.echo(JSON.stringify(cards[i], null, '\t'));
            } //for
            callback(cards);
            //fs.write('./data/info.json', temp, 644);
        });



    } //getMessagesCard

var displayCookies = function () //显示当前cookies
    {
        console.log('---------------------------------------------------------------');
        var cookies = phantom.cookies;
        for (var i = 0, len = cookies.length; i < len; i++) {
            console.log(cookies[i].name + ': ' + cookies[i].value);
        }
        console.log('---------------------------------------------------------------');
    } //casper.displayCookies

//**************************************************************
//                       主进程调用方法(页面转换跳转操作) async
//**************************************************************
function urlCheckout(url1, url2, callback) {
    url1 == url2 ? callback(1) : callback(0);
}

var login = function (USER, PASS, casper) //微博登录
    {

        if (!cookies.checkCookies()) {
           casper.wait(4000, function () {
               casper.capture('./data/weibo2.png'); //网页打开页面截图
               casper.echo(this.getTitle());
               casper.click('.action a:nth-child(2)'); //点击登录
               casper.displayCookies();
           });

            casper.then(function () {
                casper.capture('./data/weibo2.png');
                casper.fillSelectors('form', {
                    'input[id="loginName"]': USER,
                    'input[id="loginPassword"]': PASS
                }, false);

                casper.click(x('//*[@id="loginAction"]')); //点击登录按钮
            });


            casper.wait(2000, function () {
                casper.echo(casper.getCurrentUrl()); //登录成功标志
                casper.capture("./data/login.png");
                casper.displayCookies();
                cookies.saveCookies();
            });
        } else {
            casper.reload(function () {
                //casper.echo('reload!');
                casper.wait(3000, function () {
                    casper.capture('./data/reload.png');
                });

            });
        }
        //return true;
    } //caspWeibo.login
exports.login = login;

var getMsg = function (userID, casper, callback) //获取微博消息
    {
        var url = 'http://m.weibo.cn/u/' + userID;
        var checkURL, totalMsg;
        casper.echo(url);
        casper.thenOpen(url);

        casper.then(function () {
            getRandomWait(casper, 5, 16);
        });
        casper.waitForSelector('.card.card2 .layout-box', function then() {
            casper.capture('./data/mainPage.png');
            checkURL = casper.evaluate(getAttriValue, '.card.card2.line-around .layout-box a:nth-child(2)', 'href');
            totalMsg = casper.evaluate(getInnerHTML, '.card.card2.line-around .layout-box a:nth-child(2) div.mct-a.txt-s');
            casper.click('.card.card2 .layout-box a:nth-child(2)');
            getRandomWait(casper, 1, 4);
        }, function onTimeout() {
            casper.emit('waitselector.timeout', self_PID);
        }, 15000).then(function () {
            casper.echo('getmsg');
            casper.capture('./data/detail.png');
        });
        casper.then(function () {
            this.echo("CURRENT:" + this.getCurrentUrl() + " \t EXPECTED:" + decodeURI(checkURL[0]));
            urlCheckout(decodeURI(checkURL[0]), this.getCurrentUrl(), function (yes) {
                if (yes)
                    tryAndScroll(casper);
                else
                    casper.emit('url.jumpout', self_PID);
            });

        });

        casper.then(function () {
            getMessagesCard(casper, function (info) {
                casper.echo("Get " + info.length + "/" + totalMsg + "Msg");
                callback(info);
            });
            //casper.capture('./data/afterdetail.png');
        }).thenEvaluate(function () {
            console.log('evaluate');
            //getMessagesCard();
        });
    }
exports.getMsg = getMsg;

var getUser = function (userID, casper, callback) //获取用户信息
    {
        var url = 'http://m.weibo.cn/users/' + userID;
        var data;
        var checkURL;
        casper.echo(url);
        casper.thenOpen(url);
        casper.then(function () {
            getRandomWait(casper, 5, 16);

        });
        casper.waitForSelector('.list-info-page', function then() {
            getAvatarInfo(casper, function (info) {
                callback(info);
            });
        }, function onTimeout() {
            casper.emit('waitselector.timeout', self_PID);
        }, 30 * 1000);

    }
exports.getUser = getUser;

var getFocusUsers = function (userID, casper, callback) {
    var url = 'http://m.weibo.cn/u/' + userID;
    var checkURL, totalFocus;
    casper.echo(url);
    casper.thenOpen(url);
    //getRandomWait(casper, 5, 16);
    casper.then(function () {
        getRandomWait(casper, 5, 16);
    }).waitForSelector('.card.card2 .layout-box', function then() {
        checkURL = casper.evaluate(getAttriValue, '.card.card2 .layout-box a:nth-child(3)', 'href');
        totalFocus = casper.evaluate(getInnerHTML, '.card.card2 .layout-box a:nth-child(3) div.mct-a.txt-s');
        casper.click('.card.card2 .layout-box a:nth-child(3)');
    }, function onTimeout() {
        casper.emit('waitselector.timeout', self_PID);
    }, 30 * 1000).wait(2000, function () {
        this.echo("CURRENT:" + this.getCurrentUrl() + " \t EXPECTED:" + checkURL[0]);
        urlCheckout(checkURL[0], this.getCurrentUrl(), function (yes) {
            if (yes)
                tryAndScroll(casper);
            else
                casper.emit('url.jumpout', self_PID);
        });


    }).then(function () {
        getFocus(casper, function (info) {
            casper.echo("Get " + info.length + "/" + totalFocus + "focus");
            callback(info);
        });
    });
}
exports.getFocusUsers = getFocusUsers;

//
//var getMsgComments = function() //获取微博评论
//{
//    casper.then(function() {
//
//    });
//}
