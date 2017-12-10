import fs from 'fs';
import config from '../config';


// 判断目录/文件是否存在
const fsExistsSync = path => {
    try {
        fs.accessSync(path, fs.F_OK);
    }
    catch (e) {
        return false;
    }
    return true;
}

// 获得 Header 内容
const getHeaderObj = () => {
    // 请求头信息
    let configHeaders = config.headers,
        headers = {};

    // 构造请求头信息
    for (let key in configHeaders) {
        headers[key] = configHeaders[key];
    }

    return headers;
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export default {
    fsExistsSync,
    getHeaderObj,
    sleep
}