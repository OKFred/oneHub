"use strict";

var main = (() => {
    async function rpcQuery(req, res) {
        let { user } = req.headers;
        if (user !== global.envGetter("userName")) return res.status(400).send("未授权");
        let { status, result } = validation(req.body, "rpcQuery");
        if (!status) return res.status(400).send("无效传参"); //验证失败
        let { data } = result;
        let newObj = JSON.parse(data);
        let queryMsg = await doFetch(newObj);
        saveData(queryMsg);
        return res.send(queryMsg);
    }

    async function saveData(queryMsg) {
        if (queryMsg === undefined) return;
        if (queryMsg.info.for === "查询github数据") {
            let { id, login, html_url, avatar_url, followers, following } = queryMsg.response.data;
            let queryTime = new Date().valueOf();
            let date = new Date(queryTime).Format("yyyy-MM-dd");
            let newId = id + "-" + date;
            let args = [newId, login, html_url, avatar_url, followers, following, queryTime];
            saveGithub(args);
        }
        return;
    }

    async function saveGithub(args) {
        let what = "添加整行";
        let actionArr = [prepareSQL("github", what, args), { exit: true }];
        let fn = (obj) => {
            let { status, result } = obj;
            if (!status) console.log("bad job", result);
        };
        sqlExec.emit("sql", actionArr, fn);
  }
  
    async function githubReadQuery(req, res) {
        let what = "查询全部";
        let actionArr = [prepareSQL("github", what), { exit: true }];
        let fn = (obj) => {
            let { status, result } = obj;
            let code = status ? 200 : 400;
            res.status(code).send(result);
        };
        sqlExec.emit("sql", actionArr, fn);
    }

    return {
        githubReadQuery,
        rpcQuery,
        saveData,
    };
})();

if (typeof exports !== "undefined") exports.main = main;
