let fs = require("fs");
let adm_zip = require("adm-zip");

let main = (() => {
    async function zip(zipFileOutput, originalFileArr) {
        let zip = new adm_zip();
        originalFileArr.forEach((originalFile) => {
            let file;
            try {
                file = fs.statSync(originalFile);
                if (file.isDirectory()) zip.addLocalFolder(originalFile);
                else zip.addLocalFile(originalFile);
            } catch (e) {
                return console.log("压缩报错", e);
            }
        });
        zip.writeZip(zipFileOutput);
    }

    function unzip(dirOutput, zipFile) {
        let unzip = new adm_zip(zipFile);
        unzip.extractAllTo(dirOutput, true);
    }
    return { zip, unzip };
})();

if (typeof exports !== "undefined") exports.main = main;
