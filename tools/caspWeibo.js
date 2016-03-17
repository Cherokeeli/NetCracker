//*************************
//微博模块
//*************************
//var x = require('casper').selectXPath;
//var cookies = require('./tool/Cookies');

function getCurrentInfoNum() {return document.querySelectorAll('.card-list div.card').length;}

casper.tryAndScroll=function() {
    try{
    this.echo('scroll!!');
    this.scrollToBottom();
    //var info = this.getElementInfo();
    //this.wait(500);
    if (this.exists('div.loading')) {
        var curItems = this.evaluate(getCurrentInfoNum);
        this.echo(curItems);
        casper.waitFor(function check(){
            return curItems != this.evaluate(getCurrentInfoNum);
        }, function then(){
            this.tryAndScroll();
        }, function onTimeout(){
            this.echo("Timout reached");
        }, 20000);
    } else {
        this.echo("no more items");
  }
    }catch(err) {
        this.echo(err);
    }
}

casper.getTotalInfoNum = function() {return 185;
    //return parseInt(document.querySelector('.layout-box a:nth-child(2) div:nth-child(1)').innerHTML);}
                                    }

function getMessages() {
    var messages = document.querySelectorAll('p.default-content');
    return Array.prototype.map.call(messages, function(e) {
        return e.innerHTML;
    });
}//casper.getMessages

casper.displayCookies=function() //显示当前cookies
{
    console.log('---------------------------------------------------------------');
    var cookies = phantom.cookies;
    for (var i = 0, len = cookies.length; i < len; i++) {
        console.log(cookies[i].name + ': ' + cookies[i].value);
    }
    console.log('---------------------------------------------------------------');
}//casper.displayCookies

var login = function(USER,PASS) //微博登录
{
    try{
    if (!cookies.checkCookies()) {
    casper.wait(3000, function() {
        this.capture('./data/weibo.png'); //网页打开页面截图
        this.echo(this.getTitle());
        this.click(x('/html/body/div/div/a[2]')); //点击登录
        casper.displayCookies(); 
    }); 

    casper.then(function() { 
        this.fillSelectors('form', { 
            'input[id="loginName"]': USER, 
            'input[id="loginPassword"]': PASS 
        }, false); 

        this.click(x('//*[@id="loginAction"]'));  //点击登录按钮
    }); 

    casper.wait(2000, function(){
        this.echo(this.getCurrentUrl());  //登录成功标志
        this.capture("./data/login.png");
        casper.displayCookies();
        cookies.saveCookies();
    }); 
    } else {
        casper.reload(function() {
            this.echo('reload!');
        });
    }
    } catch(err) {
        console.log(err);
    }
    return true;
    
}//caspWeibo.login

var getMsg = function() //获取微博消息
{
    try{
    var num = casper.getTotalInfoNum();
    } catch(err) {
        console.log(err);
    }
    console.log(num);
    casper.waitForText('查看更多微博',function() {
        this.capture('./data/mainPage.png');
        this.click('.more-detail a.mct-d');
        this.wait(2000);
    }).then(function() {
        this.echo('getmsg');
        this.capture('./data/detail.png');
    });
    casper.then(function() {
        try {
       casper.tryAndScroll();
        } catch(err) {
            this.echo(err);
        }
    });
    casper.wait(5000,function() {
       this.capture('./data/afterdetail.png');
    });
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
