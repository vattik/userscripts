// ==UserScript==
// @name            KinoPoisk Activator
// @name:ru         Активатор КиноПоиска
// @namespace       https://github.com/vattik/userscripts/tree/main/kinopoisk-activator
// @version         2022.10.18
// @description     Adds to site www.kinopoisk.ru ability to watch movies for free
// @description:ru  Добавляет на сайт www.kinopoisk.ru возможность бесплатного просмотра фильмов
// @author          Alexey Mihaylov <citizen777@list.ru>
// @license         MIT
// @updateURL       https://raw.githubusercontent.com/vattik/userscripts/main/kinopoisk-activator/kinopoisk-activator.user.js
// @downloadURL     https://raw.githubusercontent.com/vattik/userscripts/main/kinopoisk-activator/kinopoisk-activator.user.js
// @supportURL      https://github.com/vattik/userscripts/issues
// @icon            https://favicon.yandex.net/favicon/v2/https://www.kinopoisk.ru/?size=32
// @match           *://*.kinopoisk.ru/film/*
// @match           *://*.kinopoisk.ru/series/*
// @noframes
// @grant           none
// @require         https://yastatic.net/jquery/3.3.1/jquery.min.js#md5=a09e13ee94d51c524b7e2a728c7d4039
// ==/UserScript==

'use strict';

// TODO: rewrite userscript for AJAX-site

const akp = {
    currentKID: '',
    htmlBtns: '',
    init: () => {
        const btnsInsert = setInterval(() => {
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
                akp.getLinks(kID, kName, 'https://4h0y.gitlab.io/#**SEARCH**')
                // akp.getLinks(kID, kName, 'https://4h0y.bitbucket.io/#**SEARCH**')
                // akp.getLinks(kID, kName, 'https://kin-x.com/#**SEARCH**')
            );
            let html = '';
            links.forEach((value, index) => {
                html += `<a href="${value}" target="_blank">Смотреть (источник ${index+1})</a>\n`;
            });
            if (html) {
                akp.htmlBtns = html;
            }
        },
        insert: () => {
            if (akp.htmlBtns) {
                // inserting in FORM/SECTION/ARTICLE/HEADER/FOOTER because any block element other than DIV is suitable
                $('div[class^="styles_title__"]').after(`<form id="akp-container">${akp.htmlBtns}<style>${akp.getCSS()}</style></form>`);
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
        if (kName) {
            links.push( pattern.replace('**SEARCH**', encodeURIComponent(kName)) );
        }
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
                padding: 11px 32px;
                line-height: 22px;
                white-space: nowrap;
                color: #fff;
                text-decoration: none;
                font-size: 16px;
                font-weight: 500;
                font-family: Graphik Kinopoisk LC Web,Arial,Tahoma,Verdana,sans-serif;
                border-radius: 4px;
                background: linear-gradient(130.16deg,#f26100 34.4%,#f60 66.11%,#ff9400 96.37%);
            }
            #akp-container a:before {
                content: "";
                display: inline-block;
                width: 0;
                height: 0;
                margin-right: 9px;
                border-color: transparent;
                border-left-color: #fff;
                border-style: solid;
                border-width: 7px 0 7px 12px;
            }
        `;
    }
};

$(function() {
    akp.init();
});
