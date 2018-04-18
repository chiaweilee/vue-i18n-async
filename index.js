/*!
 * +v MIT
 */
import _forEach from 'lodash/forEach'

const setting = {
    axios: undefined,
    request: undefined,
    path: undefined,
    messages: undefined
}

const setI18nLanguage = function (lang, messages) {
    // this -> $i18n
    if (!messages) return
    this.locale = lang
    this.setLocaleMessage(lang, messages)
    document.querySelector('html').setAttribute('lang', lang)
    return lang
}

const loadLang = function (lang) {
    // this -> vm
    if (!setting.axios && setting.request) {
        console.warn('No axios or axios like plugin set for online lang request!')
        return
    }
    if (!setting.path) {
        if (setting.request) {
            // local lang from online ONLY
            console.warn('Lang lang from online only might cause some problems!')
            return
        } else {
            console.warn('Both of online lang request and local lang path not set!')
        }
    }
    if (setting.request) {
        // 1, try load JSON from online
        setting.axios.get(setting.request.replace(/\{lang\}/gi, lang))
            .then(({data}) => {
                // get online lang success
                setI18nLanguage.call(this.$i18n, lang, data)
            })
            .catch(
                () => {
                    // 2, load online fail, use local
                    console.warn('Get online lang package fail, use local instead.')
                    loadLocal.call(this, lang)
                }
            )
    } else {
        // 1, no online set, try load local
        loadLocal.call(this, lang)
    }
}

const loadLocal = function (lang) {
    import(/* webpackChunkName: "lang-[request]" */ `@/lang/${lang}`).then(messages => setI18nLanguage.call(this.$i18n, lang, messages))
}

const $i18nAsync = function (lang, force = false) {
    // this -> vm
    if (!lang) return
    if (force || this.$i18n.locale !== lang) {
        if (force || setting.messages[lang] === undefined) {
            return loadLang.call(this, lang)
        }
        return Promise.resolve(setI18nLanguage.call(this.$i18n, lang, setting.messages[lang]))
    }
    return Promise.resolve(lang)
}

export default {
    install: (Vue, options) => {
        _forEach(options, (o, name) => {
            if (['axios', 'request', 'path', 'messages'].indexOf(name) > -1) {
                setting[name] = o
            }
        })
        Object.defineProperty(Vue.prototype, '$i18nAsync', {value: $i18nAsync})
    }
}
