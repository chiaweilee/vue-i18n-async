/*!
 * +v MIT
 */
import _forEach from 'lodash/forEach'

var setting = {
    request: undefined,
    path: undefined,
    messages: undefined
}

var setI18nLanguage = function (lang, messages) {
    // this -> $i18n
    if (!messages) return
    this.locale = lang
    this.setLocaleMessage(lang, messages)
    document.querySelector('html').setAttribute('lang', lang)
    return lang
}

var loadLang = function (lang) {
    // this -> vm
    if (setting.request && setting.request.plugin) {
        if (typeof setting.request.before === 'function') {
            setting.request.before()
        }
        // 1, try load JSON from online
        setting.request.plugin.get(setting.request.url.replace(/\{lang\}/gi, lang), {
            timeout: setting.request.timeout
        })
            .then(function (e) {
                // get online lang success
                return setI18nLanguage.call(this.$i18n, lang, e.data)
                if (typeof setting.request.after === 'function') {
                    setting.request.after()
                }
            })
            .catch(
                function () {
                    // 2, load online fail, use local
                    console.warn('Get online lang package fail, use local instead.')
                    loadLocal.call(this, lang)
                    if (typeof setting.request.after === 'function') {
                        setting.request.after()
                    }
                }
            )
    } else {
        loadLocal.call(this, lang)
    }
}

var loadLocal = function (lang) {
    import(/* webpackChunkName: "lang-[request]" */ `@/lang/${lang}`).then(function (messages) {
        return setI18nLanguage.call(this.$i18n, lang, messages)
    })
}

var $i18nAsync = function (lang, force) {
    // this -> vm
    if (!lang) return
    if (force === true || this.$i18n.locale !== lang) {
        if (force === true || setting.messages[lang] === undefined) {
            return loadLang.call(this, lang)
        }
        return Promise.resolve(setI18nLanguage.call(this.$i18n, lang, setting.messages[lang]))
    }
    return Promise.resolve(lang)
}

export default {
    install: function (Vue, options) {
        _forEach(options, function (o, name) {
            if (['request', 'path', 'messages'].indexOf(name) > -1) {
                setting[name] = o
            }
        })
        Object.defineProperty(Vue.prototype, '$i18nAsync', {value: $i18nAsync})
    }
}
