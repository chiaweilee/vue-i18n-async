/*!
 * +v MIT
 */
import _forEach from 'lodash/forEach'

const setting = {
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
    if (setting.request && !setting.request.plugin) {
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
    if (setting.request.plugin) {
        if (typeof setting.request.before === 'function') {
            setting.request.before()
        }
        // 1, try load JSON from online
        setting.request.plugin.get(setting.request.url.replace(/\{lang\}/gi, lang), {
            timeout: setting.request.timeout
        })
            .then(({data}) => {
            // get online lang success
            setI18nLanguage.call(this.$i18n, lang, data)
        if (typeof setting.request.after === 'function') {
            setting.request.after()
        }
    })
    .catch(
            () => {
            // 2, load online fail, use local
            console.warn('Get online lang package fail, use local instead.')
        loadLocal.call(this, lang)
        if (typeof setting.request.after === 'function') {
            setting.request.after()
        }
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
    if (['request', 'path', 'messages'].indexOf(name) > -1) {
        setting[name] = o
    }
})
Object.defineProperty(Vue.prototype, '$i18nAsync', {value: $i18nAsync})
}
}
