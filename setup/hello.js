"use strict";
console.log(`how are you? Now is ${new Date().toLocaleString()}\nTime to Go Global!`);
/* 声明一些全局变量 */

//外部模块
let dotenv = require("dotenv"); //环境变量

//私有模块
require("../base/proto_date.js"); //Date Formatter
require("../base/proto_string.js"); //String Formatter

global.envGetter = function envGetter(key) {
    const config = dotenv.config();
    if (config.error) return console.log("环境变量解析失败，请重新配置");
    let envObj = config.parsed;
    if (key === undefined) return envObj;
    return envObj[key];
}; //读取环境变量 .env
global.logTool = require("./logTool.js").main; //日志
let network = require("../base/network.js").main;
let sqlite = require("./sqlite.js").main;
let { zip, unzip } = require("./archiver.js").main;

//运维
global.zip = zip; //压缩
global.unzip = unzip; //解压

//数据库
global.sqlExec = sqlite.sqlExec;
global.prepareSQL = sqlite.prepareSQL;
global.validation = require("../response/filter.js").main.validation;

//网络请求
global.doFetch = network.doFetch;
global.paramToObj = network.paramToObj;
global.objToParam = network.objToParam;

//网络请求中介
require("../request/surfer.js").main;
let rpc = require("../fetch/rpc.js").main; //有RPC就查RPC，没有就交由后台处理
let rpcDataStr = typeof rpc !== "undefined" && rpc ? JSON.stringify(rpc) : "";
global.prepareMsg = function prepareMsg(What) {
    if (rpcDataStr && What !== "后台任务") {
        let rpcData = JSON.parse(rpcDataStr);
        return rpcData.find((obj) => obj.info.for === What);
    } else if (typeof agent !== "undefined" && What === "外包") {
        return {
            request: { header: { method: "GET" }, data: {} },
            response: { data: {} },
            info: { type: "agent", for: "外包" },
        };
    }
    return {
        request: { data: "" },
        response: { data: {} },
        info: { type: "background", for: "后台任务" },
    };
};
