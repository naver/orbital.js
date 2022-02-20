import defaultConfig from './default.config';
import normalize from './normalize';
import cookie from 'js-cookie';

function extract(str, sep, key) {
    let value;
    const tokens = str.split(sep);
    tokens.some(token => {
        const pair = token.split('=');
        if (key === pair[0].trim()) {
            value = pair[1].trim();
            return true;
        }
        return false;
    });
    return value;
}

const detect = {
    querystring(key) {
        return extract(window.location.search.substr(1), '&', key);
    },
    cookie(key) {
        return cookie.get(key);
    },
    localStorage(key) {
        return localStorage.getItem(key);
    },
    navigator() {
        return window.navigator.language;
    },
    htmlTag() {
        return document.documentElement.getAttribute('lang');
    }
};

class WebDetector {

    detect(pConfig) {
        return new Promise((resolve, reject) => {
            try {
                let config;
                if (pConfig && pConfig.i18n && pConfig.i18n.detector
                    && pConfig.i18n.detector.web) {
                    config = normalize(pConfig.i18n.detector.web);
                } else {
                    config = defaultConfig;
                }
                const {persistent, order, lookupKey} = config;
                let detection;
                order.some((way) => {
                    if (typeof detect[way] === 'function') {
                        detection = detect[way](lookupKey[way]);
                        return detection;
                    }
                    return false;
                });
                if (!detection) {
                    detection = pConfig.i18n.default;
                }
                if (persistent) {
                    const cookieArgs = [lookupKey.cookie, detection];
                    if (config.cookie.expires) {
                        cookieArgs.push({
                            expires: config.cookie.expires
                        });
                    }
                    cookie.set(...cookieArgs);
                    localStorage.setItem(
                        lookupKey.localStorage, detection);
                }
                resolve(detection);
            } catch (e) {
                reject(e);
            }
        });
    }
}

export default WebDetector;
