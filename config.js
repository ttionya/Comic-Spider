export default {

    // 要下载的漫画 Id
    // 一次一个...不要搞事
    downloadComicId: 13707,


    // 要下载的章节 Id 和 标题
    // 一次一个...不要搞事
    // 只对 npm run chapter 有效
    downloadChapterId: 0,
    downloadChapterDir: '', // 漫画文件夹名


    // 请求相关内容
    request: {

        // 方法：HEAD、GET、POST、PUT、DEL
        method: 'GET',

        // 待爬取的 URL，带参数的用 {{id}} 替换
        url: '{{id}}',

        // 查询参数，常用于 GET
        // a=1&b=2
        // { a: 1, b: 2 }
        query: '',

        // 发送数据，常用于 POST
        // a=1&b=1
        // { a: 1, b: 2 }
        send: '',

        // 跟随重定向数量
        redirects: 5
    },


    // 请求的头部信息，每个内容都会原样输入
    headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, sdch',
        'Cookie': '',
        'Host': 'www.u17.com',
        'Referer': '',
        'DNT': 1,
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.98 Safari/537.36'
    },


    // 并发数，过高会被当作攻击，建议 20 - 30
    limit: 2,

    // 每次请求延迟时间，以 ms 计算
    delay: 1000,

    // 开启下载功能
    download: true,


    // log4js
    log4js: {

        // 日志等级：OFF FATAL ERROR WARN INFO DEBUG TRACE ALL
        logLevel: 'INFO',

        // 保存到文件
        // 置空表示不保存，放在 logs 文件夹里
        logFile: ''
    }
}