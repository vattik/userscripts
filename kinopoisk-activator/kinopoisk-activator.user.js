// ==UserScript==
// @name            KinoPoisk Activator
// @name:ru         Активатор КиноПоиска
// @namespace       https://github.com/vattik/userscripts/tree/main/kinopoisk-activator
// @version         2025.6.28
// @description     Adds to site www.kinopoisk.ru ability to watch movies for free
// @description:ru  Добавляет на сайт www.kinopoisk.ru возможность бесплатного просмотра фильмов и сериалов
// @author          Alexey Mihaylov <citizen777@list.ru>
// @license         MIT
// @updateURL       https://raw.githubusercontent.com/vattik/userscripts/main/kinopoisk-activator/kinopoisk-activator.user.js
// @downloadURL     https://raw.githubusercontent.com/vattik/userscripts/main/kinopoisk-activator/kinopoisk-activator.user.js
// @supportURL      https://github.com/vattik/userscripts/issues
// @icon            https://favicon.yandex.net/favicon/v2/https://www.kinopoisk.ru/?size=32
// @match           *://website.yandexcloud.net/kpact/*
// @match           *://www.kinopoisk.ru/*
// @grant           GM_xmlhttpRequest
// @connect         kinobox.tv
// @connect         kinobox.in
// @connect         kinohost.web.app
// @connect         ddbb.lol
// @connect         *
// ==/UserScript==

// TODO: rewrite userscript with MutationObserver for AJAX-site

const akp = {
    currentKID: '',
    htmlBtns: '',
    init: () => {
        const btnsInsert = setInterval(() => {
            akp.removeGarbage();
            if (!/^\/(?:film|series)\/\d/i.test(location.pathname)) {
                return;
            }
            if (document.getElementById('akp-container') === null) {
                // for new document
                akp.buttons.generate();
                akp.buttons.insert();
            } else if (akp.getKID() && akp.currentKID && akp.getKID() !== akp.currentKID) {
                // for AJAX-modified document
                akp.buttons.remove();
                akp.buttons.generate();
                akp.buttons.insert();
            }
        }, 2000);
    },
    removeGarbage: () => {
        let adBlockCloseButtons = document.querySelectorAll('[class*="adBlockWarningRoot"] [class*="closeButton"]');
        if (adBlockCloseButtons.length === 0) {
            adBlockCloseButtons = PageDOM.xpathQuery('//*[ *[2][contains(normalize-space(),"блокировщик рекламы")] ]/*[1][self::button or @type="button"]');
        }
        if (adBlockCloseButtons.length) {
            adBlockCloseButtons[0].click();
        }
        // below mobile version only
        const touchBottomBanner = document.querySelector('[id*="touch_bottom_banner"]');
        if (touchBottomBanner) {
            touchBottomBanner.style.display = 'none';
        }
        const iframes = document.getElementsByTagName('iframe');
        for (const iframe of iframes) {
            if (iframe.src !== '') {
                continue;
            }
            const stayButton = iframe.contentWindow.document.getElementById('stay-button');
            if (stayButton) {
                stayButton.click();
            }
        }
    },
    buttons: {
        generate: () => {
            const kID = akp.getKID();
            const kNameNode = document.querySelector('h1[itemprop="name"] > *:first-child');
            const kName = kNameNode === null ? '' : kNameNode.innerText;
            const links = [].concat(
                akp.getLinks(kID, kName, 'https://website.yandexcloud.net/kpact/?manager=' + encodeURIComponent(GM_info.scriptHandler) + '&script=' + encodeURIComponent(GM_info.script.version) + '#**SEARCH**'),
                // akp.getLinks(kID, kName, 'https://4h0y.gitlab.io/#**SEARCH**')
                // akp.getLinks(kID, kName, 'https://4h0y.bitbucket.io/#**SEARCH**')
                // akp.getLinks(kID, kName, 'https://kin-x.com/#**SEARCH**')
            );
            let html = '';
            links.forEach((value, index) => {
                let rText = links.length > 1 ? ` (источник ${index+1})` : '';
                html += `<a href="${value}" target="_blank">СМОТРЕТЬ БЕСПЛАТНО${rText}</a>\n`;
            });
            if (html) {
                akp.htmlBtns = html;
            }
        },
        insert: () => {
            if (akp.htmlBtns) {
                let mobile = false;
                let outputRoot = document.querySelector('div[class*="styles_header__"] div[class*="styles_title__"]');
                if (outputRoot === null) {
                    outputRoot = document.querySelector(':is(div[class*="style_subtitle__"], div[class*="styles_subtitle__"]) ~ :is(div[class*="style_meta__"], div[class*="styles_meta__"])');
                    if (outputRoot !== null) {
                        mobile = true;
                    }
                }
                if (outputRoot !== null) {
                    // inserting in FORM/SECTION/ARTICLE/HEADER/FOOTER because any block element other than DIV is suitable
                    const outputElement = document.createElement('form');
                    outputElement.id = 'akp-container';
                    outputElement.innerHTML = `<style>${akp.getCSS(mobile)}</style>\n${akp.htmlBtns}`;
                    outputRoot.parentNode.insertBefore(outputElement, outputRoot.nextSibling);
                    akp.currentKID = akp.getKID();
                }
            }
        },
        remove: () => {
            akp.htmlBtns = '';
            document.getElementById('akp-container').remove();
        },
    },
    getLinks: (kID, kName, pattern) => {
        if (!pattern) {
            return [];
        }
        const links = [];
        if (kID) {
            links.push( pattern.replace('**SEARCH**', kID) );
        }
        // if (kName) {
        //     links.push( pattern.replace('**SEARCH**', encodeURIComponent(kName)) );
        // }
        return links;
    },
    getKID: () => {
        const kIDs = /\/(\d+)\//.exec(location.href);
        return kIDs !== null ? kIDs[1] : null;
    },
    getCSS: (mobile = false) => {
        return `
            #akp-container {
                margin-bottom: 10px;
                ${mobile === true ? 'text-align: center;' : ''}
            }
            #akp-container a {
                display: inline-flex;
                align-items: center;
                margin-bottom: 6px;
                padding: 15px 28px 13px;
                line-height: 22px;
                white-space: nowrap;
                color: #fff;
                text-decoration: none;
                font-size: 16px;
                font-weight: 600;
                font-family: Graphik Kinopoisk LC Web,Arial,Tahoma,Verdana,sans-serif;
                border-radius: 8px;
                background-color: #fa5501;
                background-image: linear-gradient(270deg, rgba(255, 145, 89, 0) 48.44%, #ff9159 75.52%, rgba(255, 145, 89, 0) 100%);
                background-repeat: no-repeat;
                animation: bg-move linear 5s infinite;
            }
            @keyframes bg-move {
                0%   { background-position: -500px 0; }
                100% { background-position: 1000px 0; }
            }
            #akp-container a:before {
                content: "";
                display: inline-block;
                width: 0;
                height: 0;
                margin-right: 11px;
                margin-bottom: 2px;
                border-color: transparent;
                border-left-color: #fff;
                border-style: solid;
                border-width: 8px 0 8px 15px;
            }
        `;
    }
};

const extraTools = {
    init: () => {
        if (typeof xhr_external === 'function') {
            xhr_external = function (details, body, callback) {
                if (details && details === 'CHECKING READY') {
                    return true;
                }
                if (details && typeof details === 'object') {
                    GM_xmlhttpRequest(details);
                }
            };
            return;
        }
        setTimeout(extraTools.init, 1500); // бесконечно ждём, когда на веб-странице станет доступна нужная нам переменная
    }
};

if (/^https?:\/\/website\.yandexcloud\.net\/kpact\//i.test(location.href)) {
    extraTools.init();
} else {
    akp.init();
}

/*
 * PageDOM JavaScript Library
 * https://github.com/vattik/libs/tree/main/page-dom
 */

const PageDOM = {};
PageDOM.version = '0.0.2-kpact';

const xpathQuery = function(xpath, root = null) {
    if (root === null) root = document;
    const evaluator = new XPathEvaluator();
    const expression = evaluator.createExpression(xpath);
    const xpathResult = expression.evaluate(root, XPathResult.UNORDERED_NODE_ITERATOR_TYPE);
    const result = [];
    let node = xpathResult.iterateNext();
    while (node) {
        result.push(node);
        node = xpathResult.iterateNext();
    }
    return result;
};

const findSingleNode = function(xpath, root = null, allowEmpty = true, regexp = null, clean = true) {
    const nodes = xpathQuery(xpath, root);
    if (nodes.length === 0) {
        // console.log('node not found: ' + xpath);
        return null;
    }
    if (nodes.length !== 1) {
        // console.log(`multiple (${nodes.length}) nodes found: ${xpath}, expected single node`);
        return null;
    }
    let nodeText = clean ? cleanXMLValue(nodes[0].textContent) : nodes[0].textContent;
    if (regexp !== null) {
        const matches = regexp.exec(nodeText);
        if (matches === null) {
            // console.log(`no match: [${nodeText}] with [${regexp}]`);
            return null;
        } else if (matches && matches.length === 1) {
            nodeText = matches[0];
        } else if (matches && matches.length > 1) {
            nodeText = matches[1];
        }
    }
    if (nodeText === '' && !allowEmpty) {
        // console.log('node empty: ' + xpath);
        return null;
    }
    return nodeText;
};

const findNodes = function(xpath, root = null, regexp = null, clean = true) {
    const nodes = xpathQuery(xpath, root);
    if (nodes.length === 0) {
        // console.log('nodes not found: ' + xpath);
        return [];
    }
    const result = [];
    for (const node of nodes) {
        const nodeText = clean ? cleanXMLValue(node.textContent) : node.textContent;
        if (regexp !== null) {
            const matches = regexp.exec(nodeText);
            if (matches === null) {
                // console.log(`no match: [${nodeText}] with [${regexp}]`);
                result.push(null);
            } else if (matches && matches.length === 1) {
                result.push(matches[0]);
            } else if (matches && matches.length > 1) {
                result.push(matches[1]);
            }
        } else {
            result.push(nodeText);
        }
    }
    // console.log(`found ${nodes.length} nodes: ${xpath}`);
    return result;
};

const cleanXMLValue = function(s) {
    s = s.replace(/\s+/g, ' ');
    s = s.replace(/^\s+/, '').replace(/\s+$/, ''); // trim
    return s;
};

PageDOM.xpathQuery = xpathQuery;
PageDOM.findSingleNode = findSingleNode;
PageDOM.findNodes = findNodes;
