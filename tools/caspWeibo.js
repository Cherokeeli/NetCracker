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
//                       js DOM原型函数
//**************************************************************

function getCurrentInfosNum() {
    return document.querySelectorAll('.card-list div.card').length;
} //getCurrentInfosNum


function getInnerHTML(selector) {
    console.log('getHTML');
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
    console.log('getAttributeValue');
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

var tryAndScroll = function (casper) {
        try {
            casper.echo('SCROLL!!');
            casper.scrollToBottom();
            //var info = casper.getElementInfo();
            //casper.wait(500);
            if (casper.exists('div.loading')) {
                var curItems = casper.evaluate(getCurrentInfosNum);
                casper.echo(curItems);
                casper.waitFor(function check() {
                    return curItems != casper.evaluate(getCurrentInfosNum);
                }, function then() {
                    casper.wait(800);
                    tryAndScroll(casper);
                }, function onTimeout() {
                    casper.echo("Timout reached,reload");
                    //casper.reload();
                    //casper.tryAndScroll();
                }, 15000);
            } else {
                casper.echo("没有更多项目了");
                return true;
            }
        } catch (err) {
            casper.echo(err);
        }
    } //casper.tryAndScroll

var getAvatarInfo = function (casper,callback) {
    casper.echo('GET Avatar');
    casper.capture('./data/avaInfo.png');
    var cards = [],
        value = [];
    result = new Object();

    casper.then(function () {
        try {
        cards = casper.evaluate(getInnerHTML, 'div.item-info-page span');
        value = casper.evaluate(getInnerHTML, 'div.item-info-page p');
        } catch(err) {
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
        casper.echo(JSON.stringify(result, null, '\t'));
        callback(result);
    });
}

var getFocus = function (casper, callback) {
    casper.echo('GET FOCUS');
    var focus = [];
    casper.capture('./data/focus.png');
    focus = casper.evaluate(getAttriValue, '.card.card10 a', 'href');
    callback(focus);
    for (var x in focus) {
        var uid = "";
        uid = focus[x].split('/');
        focus[x] = uid[2];
        casper.echo(focus[x]);
    }
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
                casper.echo(JSON.stringify(cards[i], null, '\t'));
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
//                       主进程调用方法(页面转换跳转操作)
//**************************************************************
var login = function (USER, PASS, casper) //微博登录
    {

        if (!cookies.checkCookies()) {
            casper.wait(2000, function () {
                casper.capture('./data/weibo.png'); //网页打开页面截图
                casper.echo(this.getTitle());
                casper.click('.action a:nth-child(2)'); //点击登录
                casper.displayCookies();
            });

            casper.then(function () {
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
        casper.echo(url);
        casper.thenOpen(url);
        casper.waitForText('查看更多微博', function () {
            casper.capture('./data/mainPage.png');
            casper.click('.more-detail a.mct-d');
            casper.wait(1000);
        }).then(function () {
            casper.echo('getmsg');
            casper.capture('./data/detail.png');
        });
        casper.then(function () {
            try {
                tryAndScroll(casper);
            } catch (err) {
                casper.echo(err);
            }
        });
        try {
            casper.wait(2000, function () {
                getMessagesCard(casper, function(info) {
                    callback(info);
                });
                //casper.capture('./data/afterdetail.png');
            }).thenEvaluate(function () {
                console.log('evaluate');
                //getMessagesCard();
            });
        } catch (err) {
            casper.echo(err);
        }
    }
exports.getMsg = getMsg;

var getUser = function (userID, casper, callback) //获取用户信息
    {
        var url = 'http://m.weibo.cn/users/' + userID;
        var data;
        casper.echo(url);
        casper.thenOpen(url);
        casper.then(function () {
            getAvatarInfo(casper,function(info) {
                callback(info);
            });
        });

    }
exports.getUser = getUser;

var getFocusUsers = function (userID, casper, callback) {
    var url = 'http://m.weibo.cn/u/' + userID;
    casper.echo(url);
    casper.thenOpen(url);
    casper.waitForSelector('.card.card2 .layout-box', function () {
        casper.click('.card.card2 .layout-box a:nth-child(3)')
    }).wait(2000, function () {
        tryAndScroll(casper);
    }).then(function () {
        getFocus(casper, function(info) {
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
