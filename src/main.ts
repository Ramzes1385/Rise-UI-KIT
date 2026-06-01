import { createApp } from 'vue'

import App from './App.vue'
import { createUiKitPlugin } from './plugin'
import './styles/index.scss'

const app = createApp(App)

app.use(createUiKitPlugin())
app.mount('#app')
