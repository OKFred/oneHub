"use strict";
console.log("server time--服务器开机");

//外部模块
let http = require("http");
let express = require("express");
let session = require("express-session");
let formData = require("express-form-data");

//私有模块
let taskQuery = require("./tasks/taskQuery.js").main;

//配置 Express http 服务器
let app = express();
let sessionMiddleware = session({
    secret: global.envGetter("sessionSecret") || "secret",
    cookie: { maxAge: 24 * 60 * 60 * 1000, sameSite: "lax" },
    resave: true,
    saveUninitialized: false,
    rolling: true,
    proxy: true,
}); //启用session

app.use(express.json()); //接收 POST 必备
app.use(express.urlencoded({ extended: true }));
app.use(formData.parse());
app.use(sessionMiddleware);
app.disable("x-powered-by");

//网络消息处理👇
app.all("/", (req, res) => res.send("hello there!"));
app.get("/query/github", taskQuery.githubReadQuery);
app.post("/query/rpc", taskQuery.rpcQuery);

const PORT = global.envGetter("PORT") || 80;
const httpServer = http.createServer(app);
httpServer.listen(PORT, () =>
    console.log(
        `http service enabled -- 服务已启用: http://${
            global.serverStatus ? global.serverStatus.ip : ""
        }:${PORT}`,
    ),
);
