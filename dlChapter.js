import "babel-polyfill";
import fs from 'fs';
import superAgent from 'superagent';
import cheerio from 'cheerio';
import mkdirp from 'mkdirp';
import fetch from './libs/fetch';
import config from './config';
import logger from './libs/logger';
import func from './libs/func';


(async () => {
    const comicPath = `comic/${config.downloadChapterDir}`,
        chapterId = config.downloadChapterId,
        log = logger.getLogger('单独下载');

    if (!func.fsExistsSync(comicPath) || !chapterId) {
        logger.getLogger('单独下载错误').error('漫画文件夹不存在或章节 Id 错误');
        return;
    }

    log.info(`下载【${chapterId}】到【${comicPath}】文件夹`)

    let imgListData = await fetch.fetchChapterImgList(chapterId);
    
    imgListData.path = comicPath;
    await fetch.downloadImg(imgListData);

    log.info('完成');
})();