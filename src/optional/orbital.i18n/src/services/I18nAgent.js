import MessageSet from './MessageSet';
import tokenize from './tokenize';

class I18nAgent {

    constructor(packageId, manager) {
        const languagePacks = manager.getLanguagePacks();
        this._postProcessors = manager.getPostProcessors();
        this._messageSet = new MessageSet(manager, languagePacks[packageId]);
    }

    /**
     * @param {String} id
     * @param {Object} replacement
     * @return {(String|Object|undefined)}
     */
    localize(id, replacement) {
        let message = this._messageSet.getMessage(id);
        const messageType = typeof message;
        if (messageType === 'string') {
            if (typeof replacement === 'object') {
                Reflect.ownKeys(replacement).forEach(key => {
                    const from = new RegExp('{{' + key + '}}', 'g');
                    message = message.replace(from, replacement[key]);
                });
            }
            return this.postProcess(message);
        } else if (messageType === 'undefined') {
            console.warn(`the i18n message for '${id}' not found`);
            return;
        }
        return message;
    }

    /**
     * @param {String} id
     * @param {Object} replacement
     * @return {Array}
     */
    localizeAsToken(id, replacement) {
        const tokens = this.tokenize(id);
        if (typeof replacement === 'object') {
            return tokens.map(token => {
                const tokenVal = token.value;
                if (token.type === 'variable' && replacement[tokenVal]) {
                    return replacement[tokenVal];
                }
                return tokenVal;
            });
        }
        return tokens.map(token => {
            return token.value;
        });
    }

    postProcess(message) {
        /*eslint no-param-reassign: 0*/
        const processors = this._postProcessors;
        Reflect.ownKeys(processors).forEach(packageId => {
            message = processors[packageId].process(message);
        });
        return message;
    }

    /**
     * @param {String} id
     * @return {Array.<Object>}
     */
    tokenize(id) {
        const message = this._messageSet.getMessage(id);
        const messageType = typeof message;
        if (messageType === 'string') {
            return tokenize(this.postProcess(message));
        } else if (messageType === 'object') {
            throw new Error(
                `agent cannot tokenize object, check the message for '${id}'`);
        } else if (messageType === 'undefined') {
            console.warn(
                `tokenize failed. the i18n message for '${id}' not found. it returns an empty array`);
            return [];
        }
    }
}

export default I18nAgent;
