// ==UserScript==
// @name            KinoPoisk Activator
// @name:ru         Активатор КиноПоиска
// @namespace       https://github.com/vattik/userscripts/tree/main/kinopoisk-activator
// @version         2020.10.08
// @description     Adds to site www.kinopoisk.ru ability to watch movies for free
// @description:ru  Добавляет на сайт www.kinopoisk.ru возможность бесплатного просмотра фильмов
// @author          Alexey Mihaylov <citizen777@list.ru>
// @license         MIT
// @updateURL       https://raw.githubusercontent.com/vattik/userscripts/main/kinopoisk-activator/kinopoisk-activator.user.js
// @downloadURL     https://raw.githubusercontent.com/vattik/userscripts/main/kinopoisk-activator/kinopoisk-activator.user.js
// @supportURL      https://github.com/vattik/userscripts/issues
// @match           *://*.kinopoisk.ru/film/*
// @match           *://*.kinopoisk.ru/series/*
// @icon            https://duckduckgo.com/i/kinopoisk.ru.ico
// @grant           none
// @require         https://code.jquery.com/jquery-3.5.1.min.js#md5=dc5e7f18c8d36ac1d3d4753a87c98d0a
// ==/UserScript==

'use strict';

const akp = {
    init: () => {
        akp.insertHTML();
    },
    insertHTML: () => {
        const kIDs = /\/(\d+)\//.exec(location.href);
        const kID = kIDs !== null ? kIDs[1] : null;
        const kName = $('h1[itemprop="name"] > *:parent:eq(0)').text();
        const links = [].concat(
            akp.getLinks(kID, kName, 'https://4h0y.gitlab.io/#**SEARCH**'),
            akp.getLinks(kID, kName, 'https://kin-x.com/#**SEARCH**')
        );
        let html = '';
        links.forEach((value, index) => {
            html += `<a href="${value}" target="_blank">Смотреть (источник ${index+1})</a>\n`;
        });
        if (html) {
            $('div[class^="styles_title__"]').after(`<div id="akp-container">${html}<style>${akp.getCSS()}</style></div>`);
        }
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

$(document).ready(function(){
    akp.init();
});
