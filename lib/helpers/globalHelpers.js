var path = require('path');

const globalHelpers = {
    "codeMd2Html": s => {
        mdCodeRegex = /\`(.+?)\`/g;
        while ((m = mdCodeRegex.exec(s)) != null) {
            var codeHtml = `<span class="code">${m[1]}</span>`;
            s = s.replace(m[0], codeHtml);
        }
        return s;
    },
    "fileId": fn => {
        return path.basename(fn).split(".")[0];
    },
    "snakeCase": (...args) => {
        var strings = args.slice(0, args.length - 1);
        var modifiedStrings = [];
        strings.forEach(string => {
            modifiedStrings.push(string.toLowerCase().split(" ").join("_"));
        })
        return modifiedStrings.join("_");
    },
    "stringEquals": (a, b) => {
        return a === b;
    }
}

module.exports = globalHelpers;