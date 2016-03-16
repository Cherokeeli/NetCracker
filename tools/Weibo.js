try {
    var Spooky = require('spooky');
} catch (e) {
    var Spooky = require('../node_modules/spooky/lib/spooky');
}

var cheerio = require('cheerio');

var spooky = new Spooky({
        child: {
            transport: 'http'
        },
        casper: {
            logLevel: 'debug',
            verbose: true,
            pageSettings: { // 冒充浏览器
                userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 7_0 like Mac OS X; en-us) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53',
                userName: '13267241477',
                password: 'ql13530088648'
            },
            //'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5) AppleWebKit/537.4 (KHTML, like Gecko) Chrome/22.0.1229.94 Safari/537.4'
            
            //'Mozilla/5.0 (iPhone; CPU iPhone OS 7_0 like Mac OS X; en-us) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53'
            
                // 浏览器窗口大小
            viewportSize: {
                width: 320,
                height: 568
            }
        }
    }, function (err) {
        if (err) {
            e = new Error('Failed to initialize SpookyJS');
            e.details = err;
            throw e;
        }
//mobile 'https://passport.weibo.cn/signin/login?entry=mweibo&res=wel&wm=3349&r=http%3A%2F%2Fm.weibo.cn%2F'
        spooky.start('http://login.weibo.cn');
    
        spooky.then(function() {
//            this.mouse.click('a.btnWhite');
//            this.emit('after click');
            //this.fill('form')
            //this.wait(3000);
            //this.test.assertExists('form', 'form is found');
            this.captureSelector('weibo.png','html');
            this.emit('hello', 'Hello, from ' + this.evaluate(function () {
                return document.title;
            }));
        });
    
        spooky.then(function() {
           this.fillSelectors(
            'form',
             {
              'input[name=mobile]': '13267241477',
              'input[name=password_2569]': 'ql13530088648'
             },
             // if true submit the form
            true
            );
          });
    
        spooky.then(function() {
            this.wait(3000);
            this.captureSelector('weibologin.png','html');
        });
        spooky.run();
    });

spooky.on('error', function (e, stack) {
    console.error(e);

    if (stack) {
        console.log(stack);
    }
});

/*
// Uncomment this block to see all of the things Casper has to say.
// There are a lot.
// He has opinions.
spooky.on('console', function (line) {
    console.log(line);
});
*/

spooky.on('hello', function (greeting) {
    console.log(greeting);
});

spooky.on('log', function (log) {
    if (log.space === 'remote') {
        console.log(log.message.replace(/ \- .*/, ''));
    }
});