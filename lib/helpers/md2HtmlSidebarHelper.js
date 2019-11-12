var fs = require('fs'),
    MarkdownIt = require('markdown-it'),
    path       = require('path');

var globalHelpers = require('../helpers/globalHelpers');

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

function md2HtmlSidebarHelper(mdFilepath) {
    var mdString = fs.readFileSync(mdFilepath, {encoding: 'utf-8'});
    var mdit = new MarkdownIt();
    var allTokens = mdit.parse(mdString);
    var headings = getHeadings(allTokens);

    var html = `<li class="toc-entry doc-counter">
        <a class="toc-link" href="#_${getFileId(mdFilepath)}">${headings[0]}</a>
        <ol class="doc-counter">`;
    for (var i = 1; i<headings.length; i++) {
        html += `<li class="toc-entry toc-tab1 doc-counter">
            <a class="toc-link" href="#_${snakeCase(getFileId(mdFilepath), headings[i], {})}">${headings[i]}</a>
        </li>`;
    }

    html += `
        </ol>
    </li>`;
    
   return html;
}

module.exports = md2HtmlSidebarHelper;
