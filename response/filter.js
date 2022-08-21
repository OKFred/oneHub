var joi = require("joi"); //字符串验证

var main = (() => {
    function validation(paramObj, profile) {
        //传入验证
        if (!Object.keys(paramObj).length) return { status: false, result: "未传参" };
        let schema;
        if (profile == "rpcQuery") {
            schema = joi.object({
                data: joi.string().min(3).required(),
            });
        } else if (!profile) {
            return { status: false, result: "filter 未定义" };
        }
        let validateResults = schema.validate(paramObj);
        let status, result;
        if (validateResults.error) {
            status = false;
            result = validateResults.error.details[0].message;
        } else {
            status = true;
            result = validateResults.value;
        }
        return { status, result };
    } //一定要有返回值
    return {
        validation,
    };
})();

if (typeof exports !== "undefined") exports.main = main;
