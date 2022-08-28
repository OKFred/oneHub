"use strict";
console.log("surf the internet--网上冲浪");
//外部模块

//私有模块
let taskQuery = require("../response/tasks/taskQuery.js").main;

//实例开始
async function handleGithubData() {
    let queryObj = prepareMsg("查询github数据");
    let queryMsg = await doFetch(queryObj);
    taskQuery.saveData(queryMsg);
    return;
}

handleGithubData();
let halfDay = 12 * 60 * 60 * 1000;
setInterval(handleGithubData, halfDay); //每半天查一次（以免疏漏）
if (typeof exports !== "undefined") exports.main = { handleGithubData };
