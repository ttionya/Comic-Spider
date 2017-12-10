import fs from 'fs';
import superAgent from 'superagent';
import cheerio from 'cheerio';
import { mapLimit } from 'async';
import download from 'download';
import mkdirp from 'mkdirp';
import fsExistsSync from './isExistDir';
import config from '../config';
import logger from './logger';


const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// 根据章节 Id 获得图片地址（免费章节）
let fetchFreeChapterImgList = chapterId => {
    // 请求头信息
    let configHeaders = config.headers,
        headers = {};

    // 构造请求头信息
    for (let key in configHeaders) {
        headers[key] = configHeaders[key];
    }

    return new Promise((resolve, reject) => {
        superAgent(config.request.method, `http://www.u17.com/chapter/${chapterId}.html`)
            .set(headers)
            .buffer(true) // must
            .redirects(config.request.redirects)
            .query(config.request.query)
            .send(config.request.send)
            .end(async (err, result) => {
                const log = logger.getLogger(`免费章节${chapterId.toString()}`); // 日志

                if (err) {
                    log.error(err);

                    reject(err);
                }
                else {
                    // 章节名
                    let $ = cheerio.load(result.text),
                        chapterName = /《[^》]*》(.*)在线阅读：/.exec($('meta[name="description"]')[0].attribs.content)[1];
                    
                    // 图片列表
                    let regex = /"src":"([^"]*)"/g,
                        imgUrlData = [],
                        base64UrlArr,
                        num = 1;

                    while ((base64UrlArr = regex.exec(result.text)) !== null) {
                        imgUrlData.push({
                            name: num++,
                            url: new Buffer(base64UrlArr[1], 'base64').toString()
                        });
                    }

                    log.info(`获得章节【${chapterName}】的【${imgUrlData.length}】条图片地址`);
                    resolve({
                        name: chapterName,
                        list: imgUrlData
                    });
                }
            });
    });
};

// 根据章节 Id 获得图片地址（通用接口 免费 + 付费 + VIP）
let fetchChapterImgList = chapterId => {
    // 请求头信息
    let configHeaders = config.headers,
        headers = {};

    // 构造请求头信息
    for (let key in configHeaders) {
        headers[key] = configHeaders[key];
    }

    return new Promise((resolve, reject) => {
        superAgent(config.request.method, `http://www.u17.com/comic/ajax.php?mod=chapter&act=get_chapter&chapter_id=${chapterId}`)
            .set(headers)
            .set({
                'Referer': `http://www.u17.com/buy_chapter_choice.php?chapter_id=${chapterId}`
            })
            .buffer(true) // must
            .redirects(config.request.redirects)
            .query(config.request.query)
            .send(config.request.send)
            .end(async (err, result) => {
                const log = logger.getLogger(`付费章节${chapterId.toString()}`); // 日志

                if (err) {
                    log.error(err);

                    reject(err);
                }
                else {
                    let json = '';
                    try {
                        json = JSON.parse(result.text);
                    }
                    catch (e) {}

                    // 失败
                    if (!json || !json.ext) {
                        log.error('未获得任何数据');

                        reject();
                    }
                    else {
                        let chapterName = json.ext.chapter.name,
                            imgList = json.ext.image_list,
                            imgUrlData = [];

                        for (let num in imgList) {
                            imgUrlData.push({
                                name: num,
                                url: new Buffer(imgList[num].src, 'base64').toString()
                            });
                        }

                        log.info(`获得章节【${chapterName}】的【${imgUrlData.length}】条图片地址`);
                        resolve({
                            name: chapterName,
                            list: imgUrlData
                        });
                    }
                }
            });
    });
};

// 下载图片
let downloadImg = listData => {
    return new Promise((resolve, reject) => {

        let concurrencyCount = 0,   // 并发数
            configHeaders = config.headers,
            headers = {};           // 请求头信息

        // 构造请求头信息
        for (let key in configHeaders) {
            headers[key] = configHeaders[key];
        }

        // 不存在章节文件夹则创建
        let chapterPath = `${listData.path}/${listData.name}`;
        !fsExistsSync(chapterPath) && mkdirp.sync(chapterPath);

        mapLimit(listData.list, config.limit, async list => {
            const log = logger.getLogger(chapterPath), // 日志
                filename = `${chapterPath}/${list.name}.jpg`;
            
            if (fsExistsSync(filename)) {
                log.warn(`【第${list.name}张】：该文件已存在`);

                return '';
            }

            // 并发数计数器 +1s
            concurrencyCount++;

            log.info(`【${concurrencyCount}】 开始下载【${listData.name}】【第${list.name}张】：${list.url}`);

            await download(list.url)
                .then(data => fs.writeFileSync(`${chapterPath}/${list.name}.jpg`, data));

            await sleep(config.delay);

            // 并发数计数器反向 +1s
            concurrencyCount--;

            return '';
        }, (err, result) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        });
    });
};

export default {
    fetchFreeChapterImgList,
    fetchChapterImgList,
    downloadImg
}