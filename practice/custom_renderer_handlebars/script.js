var fs = require('fs');
var yaml = require('js-yaml');
var Handlebars = require('handlebars');
var Filter = require('handlebars.filter');
var marked = require('marked');
var MarkdownIt = require('markdown-it');

var header_partial = fs.readFileSync('templates/partials/header.html', {encoding: 'utf-8'});
var footer_partial = fs.readFileSync('templates/partials/footer.html', {encoding: 'utf-8'});
Handlebars.registerPartial('header', header_partial);
Handlebars.registerPartial('footer', footer_partial);

Filter.registerHelper(Handlebars);
Handlebars.registerHelper("random", () => "returns this string!");
Handlebars.registerHelper("sum", (a, b) => `the sum is ${a + b}`);
Handlebars.registerHelper("MyMarkdown", md => {
    var mdit = new MarkdownIt();
    var allTokens = mdit.parse(md);
    var final = "";

    var elementMap = {
        h1: "span", h2: "span", h3: "span", h4: "span", h5: "span", h6: "span"
    }

    allTokens.forEach((token, i) => {
        var tc = ""; // html for single token
        var opening = token.type.endsWith("open");
        var closing = token.type.endsWith("close");

        if (opening || closing) {
            var oldTag = token.tag;
            var newTag = elementMap.hasOwnProperty(oldTag) ?
                         elementMap[oldTag] :
                         oldTag;

            var contentTag = "<";
            if (closing) {
                contentTag += "/";
            }
            contentTag += newTag + ">";

            var liTag = "";
            if (oldTag.startsWith("h")) {
                if (closing) {
                    liTag += "</li>";
                } else {
                    liTag += `<li class="doc-counter">`;
                }
                
            }

            tc = opening ? liTag + contentTag : contentTag + liTag;
        } else if (token.type === "inline") {
            tc += token.content;
        }

        final += tc;

        if (i === 2) {
            final += `<ol class="doc-counter">`;
        }

    })

    // final += "<h4>end of my function! 123</h4>";
    final += "</ol>"
    console.log(final);
    return final;
})

function render(filename, data) {
    var source   = fs.readFileSync(filename,'utf8').toString();
    var template = Handlebars.compile(source);
    var output = template(data);
    return output;
}

var data = {}
var oaiString = fs.readFileSync('/Users/jadams/Github/ga4gh-rnaseq/schema/rnaget-openapi.yaml', {encoding: 'utf-8'});
var oaiObj = yaml.load(oaiString);
data.oai = oaiObj;

// RENDER FROM MARKDOWN
var md_dir = "/Users/jadams/Github/ga4gh-rnaseq/schema/markdown";

var pre_oai_md_fns = [
    "intro.md",
    // "principles.md"
];

// var post_oai_md_fns = [
//     "comments.md",
//     "closing.md"
// ];

pre_oai_md = [];
post_oai_md = [];

pre_oai_md_fns.forEach(fn => {
    var fp = md_dir + "/" + fn;
    var md = fs.readFileSync(fp, {encoding: 'utf-8'});
    var mdit = new MarkdownIt();
    var result = mdit.parse(md);
    // console.log(result);
    pre_oai_md.push(md);
})

/*
post_oai_md_fns.forEach(fn => {
    var fp = md_dir + "/" + fn;
    var md = fs.readFileSync(fp, {encoding: 'utf-8'});
    post_oai_md.push(md);
})
*/

data.pre_oai = pre_oai_md;
// data.post_oai = post_oai_md;

// console.log(data.pre_oai);
// var test_html = marked.parse(test_md);
// console.log(test_html);



var result = render('templates/apidoc.html', data);
fs.writeFileSync("build/index.html", result);
