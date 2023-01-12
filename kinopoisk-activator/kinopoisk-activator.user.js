// ==UserScript==
// @name            KinoPoisk Activator
// @name:ru         Активатор КиноПоиска
// @namespace       https://github.com/vattik/userscripts/tree/main/kinopoisk-activator
// @version         2023.1.9
// @description     Adds to site www.kinopoisk.ru ability to watch movies for free
// @description:ru  Добавляет на сайт www.kinopoisk.ru возможность бесплатного просмотра фильмов
// @author          Alexey Mihaylov <citizen777@list.ru>
// @license         MIT
// @updateURL       https://raw.githubusercontent.com/vattik/userscripts/main/kinopoisk-activator/kinopoisk-activator.user.js
// @downloadURL     https://raw.githubusercontent.com/vattik/userscripts/main/kinopoisk-activator/kinopoisk-activator.user.js
// @supportURL      https://github.com/vattik/userscripts/issues
// @icon            https://favicon.yandex.net/favicon/v2/https://www.kinopoisk.ru/?size=32
// @match           *://www.kinopoisk.ru/*
// @noframes
// @grant           none
// @require         https://yastatic.net/jquery/3.3.1/jquery.min.js#md5=a09e13ee94d51c524b7e2a728c7d4039
// ==/UserScript==

'use strict';

// TODO: rewrite userscript with MutationObserver for AJAX-site

const akp = {
    currentKID: '',
    htmlBtns: '',
    init: () => {
        const btnsInsert = setInterval(() => {
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
    buttons: {
        generate: () => {
            const kID = akp.getKID();
            const kName = $('h1[itemprop="name"] > *:parent:eq(0)').text();
            const links = [].concat(
                akp.getLinks(kID, kName, 'https://website.yandexcloud.net/kpact/#**SEARCH**'),
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
                // inserting in FORM/SECTION/ARTICLE/HEADER/FOOTER because any block element other than DIV is suitable
                $('div[class*="styles_header__"] div[class*="styles_title__"]').eq(0).after(`<form id="akp-container">${akp.htmlBtns}<style>${akp.getCSS()}</style></form>`);
                akp.currentKID = akp.getKID();
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
    getCSS: () => {
        return `
            #akp-container {
                margin-bottom: 10px;
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

$(function() {
    akp.init();
});
