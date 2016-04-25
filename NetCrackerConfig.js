module.exports = {
    workerNum:      2,          //工作者进程数量，建议不要高于CPU核心数量
    maxMessages:    100,        //获取微博消息前多少条，因为太陈旧的信息无用
    coolMinutes:    1,          //冷却时间
    coolLimitUser:  30,         //设置爬取了多少数量的用户后进行冷却
    dbName:         "Weibo3",   //微博数据库名称
    sockPort:       2000,       //IPC socket监听端口
    userFlow:                   //用户账号库，账号越多，被和谐的可能性越小
    [
        ['18938866425','13464451579'],
        ['13267241477','ql13530088648']
    ]
}
