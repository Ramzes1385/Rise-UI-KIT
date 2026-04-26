import { router, store } from '@/app/providers'
import { createIconPlugin } from '@/shared/composables/useIcon'
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

app.use(store)
app.use(router)
app.use(createIconPlugin())

app.mount('#app')
