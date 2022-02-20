function dotNotation(obj, accessor) {
    /*eslint no-undefined: 0*/
    const arr = accessor.split('.');
    const lastIndex = arr.length - 1;
    return arr.reduce((acc, val, i) => {
        const nextAccum = acc[val];
        if (nextAccum === undefined) {
            if (lastIndex === i) {
                return undefined;
            }
            return {};
        }
        return nextAccum;
    }, obj);
}

function getLocaleLanguge(locale) {
    if (locale.indexOf('-') > 0) {
        return locale.split('-')[0];
    } else if (locale.indexOf('_') > 0) {
        return locale.split('_')[0];
    }
    return locale.substr(0, 2);
}

class MessageSet {

    constructor(manager, langPack) {
        this._manager = manager;
        this._langPack = langPack;
        this._defaultLocale = manager.getDefaultLocale();
    }

    getMessage(id) {
        return dotNotation(this._getMessageSet(this._manager.getLocale()), id)
            || dotNotation(this._getMessageSet(this._defaultLocale), id);
    }

    _getMessageSet(locale) {
        return this._langPack[locale]
            || this._langPack[getLocaleLanguge(locale)]
            || {};
    }
}

export default MessageSet;
