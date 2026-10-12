import { createApp } from 'vue'
import './assets/reset.css'
import './assets/main.css'
import './assets/fonts.css'
import App from './App.vue'
import { databaseService} from './services/database.service.ts'
import { useTheme } from './composable/useTheme.ts'

async function initApp() {
    const {init: initTheme} = useTheme()
    initTheme()

    await databaseService.init()

    const app = createApp(App)
    app.mount('#app')
}

initApp().catch(error => {
    console.error('Failed to initialize app:', error)
})


