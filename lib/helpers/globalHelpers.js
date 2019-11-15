var path = require('path');

const globalHelpers = {
    "code": (...strings) => {
        return `<span class="code">`
               + strings.slice(0, strings.length - 1).join(" ")
               + `</span>`
    },
    "codeMd2Html": s => {
        mdCodeRegex = /\`(.+?)\`/g;
        while ((m = mdCodeRegex.exec(s)) != null) {
            var codeHtml = `<span class="code">${m[1]}</span>`;
            s = s.replace(m[0], codeHtml);
        }
        return s;
    },
    "linksMd2Html": s => {
        mdLinkRegex = /\[(.+?)\]\((.+?)\)/g;
        while ((m = mdLinkRegex.exec(s)) != null) {
            var aHtml = `<a href="${m[2]}">${m[1]}</a>`;
            s = s.replace(m[0], aHtml);
        }
        return s;
    },
    "codeAndLinksMd2Html": s => {
        return globalHelpers["linksMd2Html"](globalHelpers["codeMd2Html"](s))
    },
    "uppercase": (...strings) => {
        return strings.slice(0, strings.length-1).join(" ").toUpperCase();
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
        var s = modifiedStrings.join("_");
        s = s.replace(/[-:]/g, "");
        return s;
    },
    "stringEquals": (a, b) => {
        return a === b;
    }
}

module.exports = globalHelpers;