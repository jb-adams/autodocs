var fs = require('fs'),
    MarkdownIt = require('markdown-it'),
    path       = require('path');

var globalHelpers = require('./globalHelpers');

const getFileId = globalHelpers['fileId'];
const snakeCase = globalHelpers['snakeCase'];

function getHeadings(allTokens) {

    const findHeadingContent = (start, end) => {
        for (var i = start; i <= end; i++) {
            var token = allTokens[i];
            if (token.type == "inline") {
                return token.content;
            }
        }
    }

    const findHeadingCoords = () => {
        var headings = []
        for (var a = 0; a < allTokens.length; a++) {
            var tokenA = allTokens[a];
            if (tokenA.type === "heading_open") {
                var start = a;
                var end = undefined;

                for (var b = a + 1; b < allTokens.length; b++) {
                    var tokenB = allTokens[b];
                    if (tokenB.type === "heading_close") {
                        var end = b;
                        break;
                    }
                }
                headings.push(findHeadingContent(start, end));
            }
        }
        return headings;
    };

    return findHeadingCoords();
}

function md2HtmlSidebar(blockId, mdString, docCounter, addTitleToMainSection) {
    var mdit = new MarkdownIt();
    var allTokens = mdit.parse(mdString, {});
    var headings = getHeadings(allTokens);
    docCounter = parseInt(docCounter);
    addTitleToMainSection = parseInt(addTitleToMainSection);

    var html = "";
    if (addTitleToMainSection) {
        html += `<ol class="doc-counter">`
    }

    for (var i = 0; i<headings.length; i++) {
        var liClasses = ["toc-entry"];
        var aClasses = ["toc-link"];
        var href = `#_${snakeCase(blockId, headings[i], {})}`;
        if (addTitleToMainSection && i === 0) {
            href = `#_${snakeCase(blockId, {})}`;
        }
        var content = headings[i];
        var startOl = "";
        
        if (docCounter) {
            liClasses.push("doc-counter");
        }

        var liOpen = "";
        var liClose = "";
        if (addTitleToMainSection) {
            if (i === 0) {
                startOl += "<ol";
                if (docCounter) {
                    startOl += ` class="doc-counter"`
                }
                startOl += ">";

            } else {
                liClasses.push("toc-tab1");
                liOpen = `<li class="${liClasses.join(" ")}">`;
                liClose = "</li>"
            }
        } else {
            liClasses.push("toc-tab1");
            liOpen = `<li class="${liClasses.join(" ")}">`;
            liClose = "</li>"
        }
        html += `
            ${liOpen}
                <a class="${aClasses.join(" ")}" href="${href}">${content}</a>
            ${liClose}`;
    }

    if (addTitleToMainSection) {
        html += `</ol>`;
    }
   return html;
}

module.exports = md2HtmlSidebar;
