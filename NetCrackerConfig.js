module.exports = {
    workerNum:      1,          //工作者进程数量，建议不要高于CPU核心数量
    maxMessages:    10,        //获取微博消息前多少条，因为太陈旧的信息无用
    coolMinutes:    0.25,          //冷却时间分钟
    coolLimitUser:  2,         //设置爬取了多少数量的用户后进行冷却
    dbName:         "Mr",   //微博数据库名称
    sockPort:       2000,       //IPC socket监听端口
    scrollRetries:  10,         //当滚动没有载入新元素，重试的次数
    userFlow:                   //用户账号库，账号越多，被和谐的可能性越小
    [
        ['18938866425','13464451579'],
        ['13267241477','ql13530088648'],
        ['18026991162','z84521051']
    ]
}
