//*************************
//手机版微博登录
//*************************
//var x = require('casper').selectXPath;

casper.displayCookies=function()
{
    console.log('---------------------------------------------------------------');
    var cookies = phantom.cookies;
    for (var i = 0, len = cookies.length; i < len; i++) {
        console.log(cookies[i].name + ': ' + cookies[i].value);
    }
    console.log('---------------------------------------------------------------');
}//casper.displayCookies

var login = function(USER,PASS)
{
    //casper.start('http://m.weibo.cn/') 

    casper.wait(3000, function() {
        this.capture('weibo.png'); //网页打开页面截图
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

    casper.wait(5000, function(){ 
        this.echo(this.getCurrentUrl());  //登录成功标志
        this.capture("login.png"); 
        casper.displayCookies();
    }); 
    
}//caspWeibo.login

exports.login = login;