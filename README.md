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
  axios, // axios or axios like plugin, optional, for request.
  request: 'http://localhost:8090/{lang}.js', // optional, {lang} will replace with lang name
  path: '@/lang/', // require, the dir path of lang.js,
  // the same messages with new VueI18n()
  messages: {
    en: undefine,
    'zh-cn': undefine
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
