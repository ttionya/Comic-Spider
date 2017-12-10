import "babel-polyfill";
import fs from 'fs';
import superAgent from 'superagent';
import cheerio from 'cheerio';
import mkdirp from 'mkdirp';
import fetch from './libs/fetch';
import config from './config';
import logger from './libs/logger';
import func from './libs/func';


// 获得信息
superAgent(config.request.method, `http://www.u17.com/comic/${config.downloadComicId}.html`)
    .set(func.getHeaderObj())
    .set({
        'Referer': 'http://u17.com/'
    })
    .buffer(true) // must
    .redirects(config.request.redirects)
    .query(config.request.query)
    .send(config.request.send)
    .end(async (err, result) => {
        const log = logger.getLogger('漫画列表'); // 日志

        if (err) {
            log.error(err);
        }
        else {
            let $ = cheerio.load(result.text),
                list = $('#chapter li a');

            // 创建文件夹
            let comicPath = `comic/${$('h1.fl').text().trim()}`;
            !func.fsExistsSync(comicPath) && mkdirp.sync(comicPath);

            for (let i = 0, len = list.length, item; i < len; i++) {
                item = list[i].attribs;

                // 无内容则下一个
                if (!item) continue;

                // 无法处理 VIP 限定章节
                // if (/vip_chapter/.test(item.class)) {
                //     logger.getLogger('VIP章节').warn(`无法处理VIP章节：${item.title}`);
                //
                //     continue;
                // }

                // 无法处理付费章节
                // if (/pay_chapter/.test(item.class)) {
                //     logger.getLogger('付费章节').warn(`无法处理付费章节：${item.title}`);
                //
                //     continue;
                // }

                let idArr = /\/(\d+)/.exec(item.href),
                    idData = {
                        id: (idArr && idArr[1]) || 0,
                        needPay: false
                    };
                
                // 若接口被封，则无法获得付费章节和 VIP 章节列表
                // 付费章节
                /pay_chapter/.test(item.class) && (idData.needPay = true);
                // VIP 章节
                /vip_chapter/.test(item.class) && (idData.needPay = true);

                // 获取章节图片
                let imgListData;
                if (!idData.needPay) {
                    imgListData = await fetch.fetchFreeChapterImgList(idData.id);
                }
                else {
                    imgListData = await fetch.fetchChapterImgList(idData.id);
                }
                
                imgListData.path = comicPath;
                await fetch.downloadImg(imgListData);
            }

            log.info('完成');
        }
    });