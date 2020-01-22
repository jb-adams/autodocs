var axios       = require('axios'),
    fs          = require('fs'),
    MarkdownIt  = require('markdown-it');

var globalHelpers = require('./globalHelpers');
var getFileId = globalHelpers['fileId'];
var snakeCase = globalHelpers['snakeCase'];

const convertLinks = s => {
    mdLinkRegex = /\[(.+?)\]\((.+?)\)/g;
    while ((m = mdLinkRegex.exec(s)) != null) {
        var aHtml = `<a href="${m[2]}">${m[1]}</a>`;
        s = s.replace(m[0], aHtml);
    }
    return s;
}

const convertCode = s => {
    mdCodeRegex = /\`(.+?)\`/g;
    while ((m = mdCodeRegex.exec(s)) != null) {
        var codeHtml = `<span class="code">${m[1]}</span>`;
        s = s.replace(m[0], codeHtml);
    }
    return s;
}

const convertBold = s => {
    mdBoldRegex = /\*\*(.+?)\*\*/g;
    while ((m = mdBoldRegex.exec(s)) != null) {
        var boldHtml = `<strong>${m[1]}</strong>`;
        s = s.replace(m[0], boldHtml);
    }
    return s;
}

const convertItalic = s => {
    mdItalicRegex = /_(.+?)_/g;
    while ((m = mdItalicRegex.exec(s)) != null) {
        var italicHtml = `<em>${m[1]}</em>`;
        s = s.replace(m[0], italicHtml);
    }
    return s;
}

const convertImg = s => {
    mdImgRegex = /\!\[(.+?)\]\((.+?)\)/g
    while ((m = mdImgRegex.exec(s)) != null) {
        var imgHtml = `<img src="${m[2]}" alt="${m[1]}">`
        s = s.replace(m[0], imgHtml);
    }
    return s
}

const md2HtmlMain = (blockId, mdString, docCounter, addTitleToMainSection) => {
    var mdit = new MarkdownIt();
    var allTokens = mdit.parse(mdString, {});
    var final = "";
    addTitleToMainSection = parseInt(addTitleToMainSection);

    var elementCssMap = {
        h1: {
            "element": "span",
            "class": ["section-header"],
            "liClasses": ["heading", "tier1", "avoid-navbar"]
        },
        h2: {
            "element": "span",
            "class": [],
            "liClasses": ["heading", "tier2", "avoid-navbar"]
        },
        h3: {
            "element": "span",
            "class": [],
            "liClasses": ["heading", "tier3", "avoid-navbar"]
        },
        h4: {
            "element": "span",
            "class": [],
            "liClasses": ["heading", "tier4", "avoid-navbar"]
        },
        h5: {
            "element": "span",
            "class": [],
            "liClasses": ["heading", "tier5", "avoid-navbar"]
        },
        h6: {
            "element": "span",
            "class": [],
            "liClasses": ["heading", "tier6", "avoid-navbar"]
        },
        p: {
            "element": "p",
            "class": ["p"]
        },
        table: {
            "element": "table",
            "class": ["tbl"]
        },
        th: {
            "element": "th",
            "class": ["tbl-cell", "tbl-header"]

        },
        td: {
            "element": "td",
            "class": ["tbl-cell"]
        },
        li: {
            "element": "li",
            "class": ["p"]
        }
    }

    allTokens.forEach((token, i) => {
        var tc = ""; // html for single token
        var opening = token.type.endsWith("open");
        var closing = token.type.endsWith("close");
    
        if (opening || closing) {
            var oldTag = token.tag;
            var newTag = elementCssMap.hasOwnProperty(oldTag) ?
                         elementCssMap[oldTag]["element"] :
                         oldTag;
            var newClasses = elementCssMap.hasOwnProperty(oldTag) ?
                             elementCssMap[oldTag]["class"] :
                             [];
            var classString = newClasses.length > 0 ?
                              ` class="${newClasses.join(' ')}"` :
                              ""

            var contentTag = opening ?
                             `<${newTag}${classString}>` :
                             `</${newTag}>`
            
            var liTag = "";

            var titleMainSection = true;
            if (addTitleToMainSection) {
                if (i <= 2) {
                    titleMainSection = false;
                }
            }
            
            if (oldTag.startsWith("h") && titleMainSection) {
                if (closing) {
                    liTag += "</li>";
                } else {
                    liClasses = elementCssMap[oldTag].hasOwnProperty("liClasses") ?
                                elementCssMap[oldTag]["liClasses"] :
                                []
                    liClassString = liClasses.length > 0 ?
                                    ` class="doc-counter ${liClasses.join(' ')}"` :
                                    ` class="doc-counter"`
                    var liId = snakeCase(
                        blockId, allTokens[i+1].content, {});
                    var liIdString = ` id="_${liId}"`;

                    liTag += `<li${liIdString}${liClassString}>`;
                }
            }

            tc = contentTag;
            if (parseInt(docCounter)) {
                tc = opening ? liTag + contentTag : contentTag + liTag;
            }
        } else if (token.type === "inline") {
            tc += convertLinks(
                convertCode(
                    convertItalic(
                        convertBold(
                            convertImg(token.content)))));
        } else if (token.type === "fence") {
            tc += `<p class="p"><span class="code">${token.content}</span></p>`;
        }
    
        final += tc;

        if (addTitleToMainSection) {
            if (i === 2) {
                final += `<ol class="doc-counter">`;
            }
        }
    })

    if (addTitleToMainSection) {
        final += "</ol>";
    }
    return final;
}

module.exports = md2HtmlMain;
