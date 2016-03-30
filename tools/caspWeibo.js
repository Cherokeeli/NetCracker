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
//                       js原型函数
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

casper.tryAndScroll = function () {
        try {
            this.echo('SCROLL!!');
            this.scrollToBottom();
            //var info = this.getElementInfo();
            //this.wait(500);
            if (this.exists('div.loading')) {
                var curItems = this.evaluate(getCurrentInfosNum);
                this.echo(curItems);
                casper.waitFor(function check() {
                    return curItems != this.evaluate(getCurrentInfosNum);
                }, function then() {
                    this.wait(800);
                    this.tryAndScroll();
                }, function onTimeout() {
                    this.echo("Timout reached,reload");
                    //this.reload();
                    //this.tryAndScroll();
                }, 15000);
            } else {
                this.echo("没有更多项目了");
                return true;
            }
        } catch (err) {
            this.echo(err);
        }
    } //casper.tryAndScroll

casper.getAvatarInfo = function () {
    this.echo('GET Avatar');
    this.capture('./data/avaInfo.png');
    var cards = [], value = [];
    result = new Object();

    casper.then(function () {
        cards = this.evaluate(getInnerHTML, '.item-info-page span');
        value = this.evaluate(getInnerHTML, '.item-info-page p');
        result.isVerified = this.exists('./yellow-v') ? 1 : 0;
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
        this.echo(JSON.stringify(result, null, '\t'));
    });

}

casper.getFocus = function () {
    this.echo('getFocus');
    var focus = [];
    focus = casper.evaluate(getAttriValue, '.card.card10 a', 'href');
    focus = focus.forEach(function (element, index) {
        return element.split('/', 2);
    });
    return focus;
}

casper.getMessagesCard = function () {

        this.echo('GET CARDS');
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
            tauthor = this.evaluate(getInnerHTML, '.item-main span'); //微博作者
            ttime = this.evaluate(getInnerHTML, '.item-minor span.time'); //发送时间
            tfrom = this.evaluate(getInnerHTML, '.item-minor span.from'); //发送设备
            tmessages = this.evaluate(getInnerHTML, '.weibo-detail p.default-content'); //发送内容
            tbesend = this.evaluate(getInnerHTML, 'a[data-node=forward] em'); //转发数
            tlike = this.evaluate(getInnerHTML, 'a[data-node=like] em'); //点赞数
            tresend = this.evaluate(getAttriValue, '.weibo-detail div.extend-content', 'data-jump');
            tID = this.evaluate(getAttriValue, '.card-list div.card.card9', 'data-jump'); //获取微博跳转链接
        });
        casper.then(function () {
            var i = 0;

            for (i = 0; i < tID.length; i++) {
                console.log(i);
                cards[i] = new Object();
                cards[i].ID = tID[i];
                cards[i].author = tauthor[i]; //微博作者
                cards[i].time = ttime[i]; //发送时间
                cards[i].from = tfrom[i]; //发送设备
                cards[i].messages = tmessages[i]; //发送内容
                cards[i].besend = isNaN(tbesend[i]) ? 0 : parseInt(tbesend[i]); //转发数
                cards[i].like = isNaN(tlike[i]) ? 0 : parseInt(tlike[i]); //点赞数
                cards[i].resend = tresend[i];
                this.echo(JSON.stringify(cards[i], null, '\t'));
            } //for

            //fs.write('./data/info.json', temp, 644);
        });



    } //getMessagesCard

casper.displayCookies = function () //显示当前cookies
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
var login = function (USER, PASS) //微博登录
    {

        if (!cookies.checkCookies()) {
            casper.wait(2000, function () {
                this.capture('./data/weibo.png'); //网页打开页面截图
                this.echo(this.getTitle());
                this.click(x('/html/body/div/div/a[2]')); //点击登录
                casper.displayCookies();
            });

            casper.then(function () {
                this.fillSelectors('form', {
                    'input[id="loginName"]': USER,
                    'input[id="loginPassword"]': PASS
                }, false);

                this.click(x('//*[@id="loginAction"]')); //点击登录按钮
            });


            casper.wait(2000, function () {
                this.echo(this.getCurrentUrl()); //登录成功标志
                this.capture("./data/login.png");
                casper.displayCookies();
                cookies.saveCookies();
            });
        } else {
            casper.reload(function () {
                this.echo('reload!');
                this.wait(2000, function () {
                    this.capture('./data/reload.png');
                });

            });
        }
        return true;
    } //caspWeibo.login
exports.login = login;

var getMsg = function (userID) //获取微博消息
    {
        var url = 'http://m.weibo.cn/u/'+ userID;
        casper.echo(url);
        casper.thenOpen(url);
        casper.waitForText('查看更多微博', function () {
            this.capture('./data/mainPage.png');
            this.click('.more-detail a.mct-d');
            this.wait(1000);
        }).then(function () {
            this.echo('getmsg');
            this.capture('./data/detail.png');
        });
        casper.then(function () {
            try {
                casper.tryAndScroll();
            } catch (err) {
                this.echo(err);
            }
        });
        try {
            casper.wait(2000, function () {
                casper.getMessagesCard();
                this.capture('./data/afterdetail.png');
            }).thenEvaluate(function () {
                console.log('evaluate');
                //getMessagesCard();
            });
        } catch (err) {
            this.echo(err);
        }
    }
exports.getMsg = getMsg;

var getUser = function (userID) //获取用户信息
    {
        var url = 'http://m.weibo.cn/users/'+ userID;
        casper.echo(url);
        casper.thenOpen(url);
        casper.then(function() {
            this.getAvatarInfo()
        });
    }
exports.getUser = getUser;
//
//var getMsgComments = function() //获取微博评论
//{
//    casper.then(function() {
//
//    });
//}
