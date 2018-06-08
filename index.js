/*! Vue-I18n-async 0.1.0
 * +v MIT 2018
 */
var preset = {
    async: undefined,
    failback: undefined,
    messages: {}
}

var setLocaleMessage = function (lang, messages) {
    if (!lang || !messages) return
    this.locale = lang
    this.setLocaleMessage(lang, messages)
    document.querySelector('html').setAttribute('lang', lang)
    return lang
}

var tryLoadLang = function (lang) {
    var _this = this
    // async fallback
    var fallback = function (fallToLang) {
        tryLoadFromFailback.call(_this, fallToLang || lang)
    }
    if (preset.async && typeof preset.async === 'function') {
        // async callback
        var callback = function (toLang, message) {
            return setLocaleMessage.call(_this.$i18n, toLang || lang, message)
        }
        // try load async
        preset.async(lang, callback, function () {
            if (!preset.failback || typeof preset.failback !== 'function') console.warn('[Vue-I18n-Async]Load async fail..')
            console.warn('[Vue-I18n-Async]Load async fail, trying load from failback..')
            fallback.apply(_this, arguments)
        })
    } else {
        fallback()
    }
}

var tryLoadFromFailback = function (lang) {
    var _i18n = this.$i18n
    if (typeof preset.failback === 'function') {
        preset.failback(lang, function (messages) {
            setLocaleMessage.call(_i18n, lang, messages)
        })
    }
}

var $i18nAsync = function (lang, force) {
    if (!lang) return
    if (force === true || this.$i18n.locale !== lang) {
        if (force === true || preset.messages[lang] === undefined) {
            return tryLoadLang.call(this, lang)
        }
        return Promise.resolve(setI18nLanguage.call(this.$i18n, lang, preset.messages[lang]))
    }
    return Promise.resolve(lang)
}

export default {
    install: function (Vue, options) {
        if (options.async) preset.async = options.async
        if (options.failback) preset.failback = options.failback
        if (options.messages) preset.messages = options.messages
        Object.defineProperty(Vue.prototype, '$i18nAsync', {value: $i18nAsync})
    }
}
