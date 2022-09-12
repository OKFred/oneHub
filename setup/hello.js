"use strict";
console.log(`how are you? Now is ${new Date().toLocaleString()}\nTime to Go Global!`);
/* 声明一些全局变量 */

//外部模块
let os = require("os");
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

//服务器状态
global.serverStatus = Object.assign(
    {},
    (() => {
        let freemem = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
        let totalmem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
        let cpu = os.cpus()[0].model + "*" + os.cpus().length;
        let hostname = os.hostname();
        let uptime = (os.uptime() / 3600).toFixed(2);
        let queryTime = new Date().valueOf();
        let nets = os.networkInterfaces();
        let ipArr = [];
        for (let netArr of Object.values(nets)) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
            for (let netObj of netArr) {
                let { family, internal, address } = netObj;
                let familyV4Value = typeof family === "string" ? "IPv4" : 4;
                if (family === familyV4Value && !internal) {
                    ipArr.push(address);
                    break;
                }
            }
        }
        console.log(
           "主机名： " + hostname,
            "ip： " + ipArr[0],
            "cpu： " + cpu,
            "内存合计： " + totalmem + "GB, 当前可用 " + freemem,
            "待机时长： " + uptime + " Hours",
            "启动时间： " + new Date(queryTime).toLocaleString(),
        );
        return {
            hostname,
            ip: ipArr[0],
            cpu,
            freemem,
            totalmem,
            uptime
        };
    })(),
);
setTimeout(() => console.log("EOF", "-".repeat(66)), 6666);
