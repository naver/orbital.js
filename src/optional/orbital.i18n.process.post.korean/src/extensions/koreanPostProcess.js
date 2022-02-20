/*
* Copyright (c) 2017 Gyusun Yeom
* https://github.com/Perlmint/i18next-korean-postposition-processor
*/
/*eslint camelcase: 0*/
/*eslint complexity: 0*/
/*eslint no-param-reassign: 0*/

const maps = [
    ['을', '를'],
    ['이', '가'],
    ['은', '는'],
    ['으로', '로'],
    ['과', '와']
];

export default {

    process(value) {

        const matches = value.match(/(?:[가-힣]|[0-9]+)\[\[(?:을|를|이|가|은|는|(?:으로)|로|과|와)\]\]/g);
        if (matches == null) {
            return value;
        }
        for (let i = 0, matches_1 = matches; i < matches_1.length; i++) {
            const match = matches_1[i];
            const pieces = match.split('[[');
            const pre = pieces[0];
            const postposition = pieces[1].replace('[[', '').replace(']]', '');
            let existFinal;
            const preCode = pre.charCodeAt(0);
            if (preCode >= 44032) {
                const final = (preCode - 44032) % 28;
                existFinal = final !== 0;
            } else {
                // number
                const lastCh = pre[pre.length - 1];
                switch (lastCh) {
                    case '1':
                    case '3':
                    case '6':
                    case '7':
                    case '8':
                        existFinal = true;
                        break;
                    case '2':
                    case '4':
                    case '5':
                    case '9':
                        existFinal = false;
                        break;
                    default: {
                        const matched = pre.match(/0+$/);
                        const zeroLength = matched[0].length;
                        // 12 - 조, 20 - 해, 24 - 자, 32 - 구, 44 - 재, >=52 - 항하사, 아승기, 나유타, 불가사의, 무량대수
                        if (zeroLength === 12
                            || zeroLength === 20
                            || zeroLength === 24
                            || zeroLength === 32
                            || zeroLength === 44
                            || zeroLength >= 52
                        ) {
                            existFinal = false;
                        } else {
                            existFinal = true;
                        }
                        break;
                    }
                }
            }
            for (let j = 0, maps_1 = maps; j < maps_1.length; j++) {
                const item = maps_1[j];
                if (item.indexOf(postposition) === -1) {
                    continue;
                }
                value = value.replace(match, '' + pre + (existFinal ? item[0] : item[1]));
                break;
            }
        }
        return value;
    }
};
