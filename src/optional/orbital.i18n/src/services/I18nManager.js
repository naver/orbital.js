import I18nAgent from './I18nAgent';
import EventEmitter from 'events';

/**
 * Terms
 * Language Packs > A Language Pack > A Message Set > A Message
 {
   'some-package-id': {
     'fr-CA': {
       'hello': 'Bonjour'
     },
     'en-US': {
       'hello': 'Hello'
     }
   },
   'other-package-id': {
     ...
   }
 }
 * 1) Language Packs : All contributions for 'orbital.i18n:languages'.
 * 2) A Language Pack : A language contribution for a package.
 * 3) A Message Set : A set of contributions for a locale.
 * 4) A Message : A single message string or object for a message id.
 */
class I18nManager extends EventEmitter {

    constructor(context) {
        super();
        this.context = context;
        this._logger = context.getService('orbital.core:logger');
        this._languagePacks = {};
        this._postProcessors = {};
        this._initLocale();
        this._addListeners();
        this._collectExtensions();
    }

    createAgent(packageId) {
        return new I18nAgent(packageId, this);
    }

    getDefaultLocale() {
        return this._defaultLocale;
    }

    getLanguagePacks() {
        return this._languagePacks;
    }

    /**
     * Returns current locale.
     * ('en', 'en-US', 'en_US', ... etc)
     * @return {string}
     */
    getLocale() {
        return this._locale;
    }

    getPostProcessors() {
        return this._postProcessors;
    }

    off(...args) {
        this.removeListener(...args);
    }

    setLocale(locale) {
        this._logger.debug(`setLocale('${locale}')`);
        const oldLocale = this._locale;
        this._locale = locale;
        if (oldLocale !== locale) {
            this.emit('localeChange', oldLocale, locale);
        }
    }

    _addListeners() {
        const context = this.context;
        context.on('extensionRegistered', (registration) => {
            const extId = registration.getExtensionId();
            const packageId = registration.getContributor().getPlugin().getId();
            if (extId === 'orbital.i18n:languages') {
                registration.getModule().then(module => {
                    const meta = registration.getMeta();
                    this._addMessageSet(packageId, meta.locale, module);
                });
            }
            if (extId === 'orbital.i18n:post-process') {
                registration.getModule().then(module => {
                    this._postProcessors[packageId] = module;
                });
            }
        });
        context.on('extensionUnregistered', (registration) => {
            const extId = registration.getExtensionId();
            const packageId = registration.getContributor().getPlugin().getId();
            if (extId === 'orbital.i18n:languages') {
                const meta = registration.getMeta();
                this._removeMessageSet(packageId, meta.locale);
            }
            if (extId === 'orbital.i18n:post-process') {
                Reflect.deleteProperty(this._postProcessors, packageId);
            }
        });
    }

    _addMessageSet(packageId, locale, data) {
        if (!this._languagePacks[packageId]) {
            this._languagePacks[packageId] = {};
        }
        this._languagePacks[packageId][locale] = data;
    }

    _collectExtensions() {
        const context = this.context;
        context.getExtensionRegistrations('orbital.i18n:languages')
            .forEach((registration) => {
                const packageId = registration.getContributor().getPlugin().getId();
                registration.getModule().then(module => {
                    const meta = registration.getMeta();
                    this._addMessageSet(packageId, meta.locale, module);
                });
            });
    }

    _getProjectConfig() {
        if (this._projectConfig) {
            return this._projectConfig;
        }
        const project = this.context.getService('orbital.core:project');
        this._projectConfig = project.getConfig();
        return this._projectConfig;
    }

    _initLocale() {
        const config = this._getProjectConfig();
        const detector = this.context.getService('orbital.i18n:detector');
        detector.emitter.on('ready', () => {
            detector.detect(config).then(locale => {
                this.setLocale(locale);
            }).catch(e => {
                this._logger.info(e);
                this.setLocale(config.i18n.default);
            });
        });
        this._defaultLocale = config.i18n.default;
    }

    _removeMessageSet(packageId, locale) {
        Reflect.deleteProperty(this._languagePacks[packageId], locale);
    }
}

export default I18nManager;
