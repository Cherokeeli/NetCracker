//*************************
//微博模块
//*************************
//var x = require('casper').selectXPath;
//var cookies = require('./tool/Cookies');


function getCurrentInfosNum() {
    return document.querySelectorAll('.card-list div.card').length;
} //getCurrentInfosNum

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
                    this.wait(2000);
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

function getInnerHTML(selector) {
    console.log('getHTML');
    try {
    var nodes = document.querySelectorAll(selector);
        } catch(err) {
        console.log(err);
    }

    console.log(nodes.length);
    return Array.prototype.map.call(nodes, function (e) {
        return e.innerHTML;
    });

}

function getJumpLink(selector) {
    console.log('getJumpLink');
    try {
    var nodes = document.querySelectorAll(selector);
    } catch(err) {
        console.log(err);
    }
    console.log(nodes.length);
    return Array.prototype.map.call(nodes, function (e) {
        return e.getAttribute('data-jump');
    });

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
    casper.then(function() {
        tauthor = this.evaluate(getInnerHTML,'.item-main span'); //微博作者
        this.echo(tauthor);
        ttime = this.evaluate(getInnerHTML,'.item-minor span.time'); //发送时间
        tfrom = this.evaluate(getInnerHTML,'.item-minor span.from'); //发送设备
        tmessages = this.evaluate(getInnerHTML,'.weibo-detail p.default-content'); //发送内容
        tbesend = this.evaluate(getInnerHTML,'a[data-node=forward] em'); //转发数
        tlike = this.evaluate(getInnerHTML,'a[data-node=like] em'); //点赞数
        tresend = this.evaluate(getJumpLink,'.weibo-detail div.extend-content');
        tID = this.evaluate(getJumpLink,'.card-list div.card.card9'); //获取微博跳转链接
    });
    casper.then(function(){
    var i = 0;

    for (i = 0; i < tID.length; i++) {
        console.log(i);
        cards[i] = new Object();
        cards[i].ID = tID[i];
        cards[i].author = tauthor[i]; //微博作者
        cards[i].time = ttime[i]; //发送时间
        cards[i].from = tfrom[i]; //发送设备
        cards[i].messages = tmessages[i]; //发送内容
        cards[i].besend = isNaN(tbesend[i])?0:parseInt(tbesend[i]); //转发数
        cards[i].like = isNaN(tlike[i])?0:parseInt(tlike[i]); //点赞数
        cards[i].resend = tresend[i];
    } //for
        var temp = JSON.stringify(cards);
    fs.write('./data/info.json', temp, 644);
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

var login = function (USER, PASS) //微博登录
    {

            if (!cookies.checkCookies()) {
                casper.wait(3000, function () {
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
                    this.wait(2000,function(){
                        this.capture('./data/reload.png');
                    });

                });
            }

        return true;

    } //caspWeibo.login

var getMsg = function () //获取微博消息
    {
        casper.waitForText('查看更多微博', function () {
            this.capture('./data/mainPage.png');
            this.click('.more-detail a.mct-d');
            this.wait(2000);
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
        }).thenEvaluate(function(){
            console.log('evaluate');
            //getMessagesCard();
        });
        } catch(err) {
            this.echo(err);
        }
    }


//var getUsers = function() //获取用户信息
//{
//    casper.then(function() {
//
//    });
//}
//
//var getMsgComments = function() //获取微博评论
//{
//    casper.then(function() {
//
//    });
//}

exports.login = login;
exports.getMsg = getMsg;
