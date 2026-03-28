import './style.css'

import { createApp } from 'vue'

import App from './App.vue'
import { detectBrowserLocale, i18n } from './helpers/i18n.js'

const app = createApp(App)
app.use(i18n)

// Apply saved locale or detect from browser
i18n.global.locale.value = localStorage.getItem('modfolio-locale') || detectBrowserLocale()

app.mount('#app')
