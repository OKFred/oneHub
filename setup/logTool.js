let fs = require("fs");
let EventEmitter = require("events");

let oneDay = 1000 * 60 * 60 * 24;
let _config = {
    logDir: "./log/",
    logArchiveDir: "./archive/log/",
    logArchiveName: () => {
        let yesterday = new Date().valueOf() - oneDay;
        let zipMonth = new Date(yesterday).Format("yyyy-MM"); //压缩上个月的日志
        return `./archive/log/db_backup_${zipMonth}.zip`;
    },
    taskName: "core",
    GCTimer: 0,
};

let main = (() => {
    let emitter = new EventEmitter();
    emitter.on("log", (taskName, ...args) => {
        _config.taskName = taskName || _config.taskName;
        logger(...args);
    });
    function logger(...args) {
        //日志输出
        args.forEach((arg) => {
            let result =
                typeof arg === "object"
                    ? new Date().toLocaleTimeString() + "\t" + JSON.stringify(arg) + "\n"
                    : new Date().toLocaleTimeString() + "\t" + arg + "\n";
            fs.writeFileSync(
                `./log/${_config.taskName}-${new Date().Format("yyyy-MM-dd")}.log`,
                result,
                { flag: "a" },
            );
        });
        return args[args.length - 1];
    }
    (function init() {
        if (!fs.existsSync(_config.logDir)) {
            try {
                fs.mkdirSync(_config.logDir);
            } catch (error) {
                return console.log("log folder error--日志文件夹未创建");
            }
        }
        if (!fs.existsSync(_config.logArchiveDir)) {
            try {
                fs.mkdirSync(_config.logArchiveDir);
            } catch (error) {
                return console.log("log archive folder error--日志备份文件夹未创建");
            }
        }
    })();
  function loggerGC() {
    clearTimeout(_config.GCTimer);
    let today = new Date().valueOf();
    let yesterday = new Date().valueOf() - oneDay;
    let monthOfToday = new Date(today).getMonth() + 1;
    let monthOfYesterday = new Date(yesterday).getMonth() + 1;
    fs.readdir(_config.logDir, (err, files) => {
      if (err) return console.log("无法遍历该目录" + err);
      files.forEach((file) => {
        if (new RegExp(yesterday).test(file))
          fs.rename(_config.logDir + file, _config.logArchiveDir + file);
      });
    }); // log目录历史日志迁移到archive目录
    if (monthOfToday === monthOfYesterday) {
      _config.GCTimer = setTimeout(loggerGC, oneDay);
      console.log("logTool--明天再检查 是否需要打包日志");
      return;
    } // 每天检查一次是否为新月份
    zip(_config.logArchiveName(), [_config.logArchiveDir]); //历史日志打包
    fs.readdir(_config.logArchiveDir, (err, files) => {
      if (err) return console.log("无法遍历该目录" + err);
      files.forEach((file) => {
        fs.unlink(_config.logArchiveDir + file, (error) => {
          console.log(error ? error : file + "删除成功");
        });
      });
    }); //历史日志清理
    clearConsole();
  }
    setTimeout(loggerGC, 0);

    function clearConsole() {
        let fileName = "./nohup.out";
        if (fs.existsSync(fileName)) {
            fs.writeFileSync(fileName, "", { flag: "w" });
        }
        console.clear();
        console.log("Concole GC");
    } //以免内存overflow

    return {
        emitter,
    };
})();

if (typeof exports !== "undefined") exports.main = main;
