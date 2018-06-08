# vue-i18n-async
Async load lang from internet or local

# Install
> npm install vue-i18n-async

# Usage
- in entry
```javascript
import Vue from 'vue'
import VueI18n from 'vue-i18n'
import vueI18nAsync from './plugin/vue-i18n-async'

Vue.use(VueI18n)

Vue.use(vueI18nAsync, {
    async: (lang, resolve, reject) => {
      axios.get('http://localhost:8090/zh-cn.json', {
        timeout: 3000
      })
        .then(({data}) => {
          resolve(lang, data)
        })
        .catch(() => reject(/* newLang */))
    },
    failback: (lang, resolve) => {
      import(/* webpackChunkName: "lang-[request]" */ `../../lang/${lang}.json`)
        .then(messages => {
          resolve(messages)
        })
    }
  })

const i18n = new VueI18n({
  locale: 'en',
  messages: {
    en: undefine,
    'zh-cn': undefine
  }
})

new Vue({
  ...
  i18n,
  ...
})
```
- in components
```javascript
// switch lang
// if axios and request set, request from internet first.
// then request local if fail.
this.$i18nAsync('zh-cn')
```

```javascript
// !Be careful
// if all messages is undefine when Vue init,
// DO make sure use force param to load lang when Vue created!
this.$i18nAsync('en', true) // force === true
```
