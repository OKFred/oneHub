let rpc = [
    {
        request: {
            header: {
                method: "GET",
            },
            url: "https://api.github.com/users/okfred",
            data: {},
        },
        response: {},
        info: {
            for: "查询github数据",
            type: "github",
        },
    },
];
if (typeof exports !== "undefined") exports.main = rpc;
