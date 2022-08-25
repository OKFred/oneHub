"use strict";
console.log("loading database--数据库准备");

//外部模块
let EventEmitter = require("events");
let fs = require("fs");

//配置项
let _config = {
    DBFile: "./db/github.db",
    DBArchiveName: () => {
        let today = new Date().Format("yyyyMMdd");
        return `./archive/db/github_backup_${today}.zip`;
    },
    DBDir: "./db/",
    DBArchiveDir: "./archive/db/",
    sqlObj: {
        github: [
            {
                name: "表格删除",
                type: "drop",
                query: `
                DROP TABLE IF EXISTS "github";
        `,
            },
            {
                name: "表格创建",
                type: "create",
                query: `
                CREATE TABLE "github" (
                  "id" TEXT NOT NULL,
                  "login" TEXT,
                  "html_url" TEXT,
                  "avatar_url" TEXT,
                  "followers" INTEGER,
                  "following" INTEGER,
                  "query_time" TEXT,
                  PRIMARY KEY ("id")
                );
        `,
            },
            {
                name: "查询全部",
                type: "select",
                query: `
                SELECT
                    *
                FROM
                    github;
        `,
            },
            {
                name: "添加整行",
                type: "replace",
                query: `
                REPLACE INTO github (id,login, html_url, avatar_url, followers, following, query_time)
                VALUES (?,?,?,?,?,?,?)
        `,
            },
        ],
    },
};

let main = (() => {
    let sqlite3 = require("sqlite3").verbose();
    let db = new sqlite3.Database(init());
    let sqlExec = new EventEmitter();
    let SQL = JSON.stringify(_config.sqlObj);
    let oneDay = 24 * 60 * 60 * 1000;

    setInterval(backupDB, oneDay); //每天备份
    setInterval(backupDBClear, oneDay); //每天GC

    function init() {
        if (!fs.existsSync(_config.DBDir)) {
            try {
                fs.mkdirSync(_confi.DBDir);
            } catch (error) {
                return console.log("DB folder error--数据库文件夹未创建");
            }
        }
        if (!fs.existsSync(_config.DBArchiveDir)) {
            try {
                fs.mkdirSync(_config.DBArchiveDir);
            } catch (error) {
                return console.log("DB archive folder error--数据库备份文件夹未创建");
            }
        }
        if (!fs.existsSync(_config.DBFile)) {
            fs.writeFileSync(_config.DBFile, "", { flag: "a" });
            console.log("database created -- 数据库已生成");
            setTimeout(houseTableInit, 0); //且等 sqlite3 初始化
        }
        return _config.DBFile;
    }

    function houseTableInit() {
        let actionArr = [
            prepareSQL("github", "表格删除"),
            prepareSQL("github", "表格创建"),
            { exit: true },
        ];
        let fn = (obj) => {
            let { status, result } = obj;
            if (!status) return console.log("sqlite--表格创建失败", result);
            return console.log("sqlite--表格创建成功");
        };
        sqlExec.emit("sql", actionArr, fn);
    }

    function backupDB() {
        console.log("time to backup -- 该备份数据库了");
        zip(_config.DBArchiveName(), [_config.DBFile]);
    }

    function backupDBClear() {
        console.log("time to backup Clear -- 该清理数据库了。节省磁盘空间");
        let oneDay = 24 * 60 * 60 * 1000;
        let today = new Date().valueOf();
        let yesterday = new Date().valueOf() - oneDay;
        let monthOfToday = new Date(today).getMonth() + 1;
        let monthOfYesterday = new Date(yesterday).getMonth() + 1;
        if (monthOfToday === monthOfYesterday) {
            console.log("明天再检查 是否需要清理");
            return; // 每天检查一次是否为新月份
        }
        fs.readdir(_config.DBArchiveDir, (err, files) => {
            if (err) return console.log("无法遍历该目录" + err);
            files.forEach((file) => {
                fs.unlink(_config.DBArchiveDir + file, function (err) {
                    if (err) return console.log(err);
                    console.log(file + ">>文件已删除");
                });
            });
        });
    }

    function prepareSQL(table, what, args) {
        let sqlObj = JSON.parse(SQL);
        let actionObj = sqlObj[table].find((obj) => obj.name === what);
        actionObj.args = args;
        return actionObj;
    }

    sqlExec.on("sql", (actionArr, fn, index, data) => {
        if (typeof fn !== "function") fn = console.log;
        if (index === undefined) index = 0;
        let actionObj = actionArr[index];
        let { name, type, query, args, exit } = actionObj;
        if (!exit) console.log(type + "\t" + name);
        args ? args.unshift(query) : (args = [query]);
        if (data !== undefined || exit) {
            fn({ status: true, result: data });
        } else if (type === "select") {
            db.all(...args, (error, result) => {
                if (error) return fn({ status: false, result: { args, error } });
                if (actionArr.length - 1 > index)
                    sqlExec.emit("sql", actionArr, fn, ++index, result);
            }); //read
        } else {
            db.run(...args, (error) => {
                if (error) return fn({ status: false, result: { args, error } });
                if (actionArr.length - 1 > index) sqlExec.emit("sql", actionArr, fn, ++index);
            }); //write
        }
    });

    return {
        prepareSQL,
        sqlExec,
    };
})();

if (typeof exports !== "undefined") exports.main = main;
