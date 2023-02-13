// ==UserScript==
// @name            KinoPoisk NFO
// @name:ru         КиноПоиск NFO
// @namespace       https://github.com/vattik/userscripts/tree/main/kinopoisk-nfo
// @version         2023.1.15
// @description     Generates NFO files with information about a movie or TV series
// @description:ru  Генерирует файлы в формате NFO со сведениями о фильме или сериале
// @author          Alexey Mihaylov <citizen777@list.ru>
// @license         MIT
// @updateURL       https://raw.githubusercontent.com/vattik/userscripts/main/kinopoisk-nfo/kinopoisk-nfo.user.js
// @downloadURL     https://raw.githubusercontent.com/vattik/userscripts/main/kinopoisk-nfo/kinopoisk-nfo.user.js
// @supportURL      https://github.com/vattik/userscripts/issues
// @icon            https://duckduckgo.com/i/kinopoisk.ru.ico
// @match           *://www.kinopoisk.ru/film/*
// @match           *://www.kinopoisk.ru/series/*
// @grant           none
// @require         https://raw.githubusercontent.com/vattik/libs/main/page-dom/0.0.2/page-dom.js
// @require         https://raw.githubusercontent.com/vattik/libs/main/kp-web/0.0.4/kp-web.js
// ==/UserScript==

// Структура полей для фильмов: https://kodi.wiki/view/NFO_files/Movies
// Структура полей для сериалов: https://kodi.wiki/view/NFO_files/TV_shows

// Страницы для демонстрации:
//  Фильм (https://www.kinopoisk.ru/film/447301/)
//  Мультфильм (https://www.kinopoisk.ru/film/45319/)
//  Сериал (https://www.kinopoisk.ru/series/1227803/)

// TODO: страница с эпизодами https://www.kinopoisk.ru/film/464963/episodes/

{
    const getCSS = function() {
        return `
            #k2n-container {
                margin-bottom: 10px;
            }
            #k2n-container a {
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
                border-radius: 28px;
                background: linear-gradient(130.16deg,#769def 34.4%,#6689db 66.11%,#88aeff 96.37%);
            }
            #k2n-container a:before {
                content: "";
                display: inline-block;
                width: 0;
                height: 0;
                margin-right: 9px;
                border-color: transparent;
                border-bottom-color: #fff;
                border-style: solid;
                border-width: 0 7px 12px 7px;
            }
            #k2n-container a ~ a:before {
                border-color: transparent;
                border-top-color: #fff;
                border-width: 12px 7px 0 7px;
            }
        `;
    };

    const normalizeFileName = function(fileName) {
        return fileName.replace(/:/g, '.').replace(/[?«»]/g, '');
    };

    const init = function() {
        const kpData = kpWeb.parse();

        const kID = kpData.id;
        const nfoType = kpData.type === 'series' ? 'tvshow' : 'movie';
        const kName = kpData.name;
        const kNameOriginal = kpData.origname;
        const kYear = kpData.year;
        const kCountries = kpData.country;
        const kGenres = kpData.genre;
        const kSlogan = kpData.slogan;
        const kDirectors = kpData.director;
        const kAge = kpData.age;
        const kMPAA = kpData.mpaa;
        // const kDuration = kpData.duration;
        const kActors = kpData.actor;
        const kPlotRows = kpData.description !== '' ? kpData.description.split('\n\n') : [];

        let nfoContent = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
        nfoContent += `<${nfoType}>\n`;
        nfoContent += `    <uniqueid type="kinopoisk" default="true">${kID}</uniqueid>\n`;
        nfoContent += `    <title>${kName}</title>\n`;
        if (kNameOriginal !== '') {
            nfoContent += `    <originaltitle>${kNameOriginal}</originaltitle>\n`;
        }
        nfoContent += `    <year>${kYear}</year>\n`;
        kCountries.forEach(function(kCountry, index) {
            nfoContent += `    <country${index === 0 ? ' clear="true"' : ''}>${kCountry.replace(/’/g, "'")}</country>\n`;
        });
        kGenres.forEach(function(kGenre, index) {
            nfoContent += `    <genre${index === 0 ? ' clear="true"' : ''}>${kGenre}</genre>\n`;
        });
        if (kSlogan !== '') {
            nfoContent += `    <tagline>${kSlogan}</tagline>\n`;
        }
        kDirectors.forEach(function(kDirector, index) {
            nfoContent += `    <director${index === 0 ? ' clear="true"' : ''}>${kDirector.replace(/’/g, "'")}</director>\n`;
        });
        if (kMPAA !== '') {
            nfoContent += `    <mpaa>${kMPAA}</mpaa>\n`; // PG-13
        }
        if (kAge !== '') {
            nfoContent += `    <certification>Russia:${kAge}</certification>\n`; // Russia:12+ / USA:PG-13
        }
        // if (kDuration) {
        //     nfoContent += `    <runtime>${kDuration}</runtime>\n`; // not actual for modern media centers
        // }
        if (kPlotRows.length) {
            // https://kodi.wiki/view/Label_Formatting
            nfoContent += `    <plot>${kPlotRows.join('[CR][CR]').replace(/\s+/g, ' ')}</plot>\n`;
        }
        kActors.forEach(function(kActor, index) {
            nfoContent += `    <actor${index === 0 ? ' clear="true"' : ''}>\n`;
            nfoContent += `        <name>${kActor.replace(/’/g, "'")}</name>\n`;
            nfoContent += '    </actor>\n';
        });
        nfoContent += `</${nfoType}>\n`;
        const nfoContentEncoded = encodeURIComponent(nfoContent);
        const outputFileURI = 'data:text/plain;charset=utf-8,' + nfoContentEncoded;
        const outputFileName = nfoType === 'tvshow' ? 'tvshow' : normalizeFileName(kName + ` (${kYear})`);
        let outputHtml = `<style>${getCSS()}</style>\n`;
        outputHtml += `<a href="#" id="k2n-view" title="Открыть на новой странице">Посмотреть .NFO</a>\n`;
        outputHtml += `<a href="${outputFileURI}" download="${outputFileName}.nfo" title="${outputFileName}.nfo">Скачать .NFO (${Math.ceil(nfoContent.length/1000)} КБ)</a>\n`;
        const btnsInsert = setInterval(() => {
            if (document.getElementById('k2n-container') === null) {
                const outputRoot = document.querySelector('div[class*="styles_header__"] div[class*="styles_title__"]');
                if (outputRoot === null) {
                    return;
                }
                const outputElement = document.createElement('form');
                outputElement.id = 'k2n-container';
                outputElement.dataset.nfo = nfoContentEncoded;
                outputElement.innerHTML = outputHtml;
                outputRoot.parentNode.insertBefore(outputElement, outputRoot.nextSibling);
                document.getElementById('k2n-view').addEventListener('click', function(e) {
                    e.preventDefault();
                    const w = window.open();
                    w.document.body.innerHTML = '<pre></pre>';
                    w.document.querySelector('pre').textContent = decodeURIComponent(document.getElementById('k2n-container').dataset.nfo);
                });
            }
        }, 2000);
    };

    init();
}
