import {ref, watch } from 'vue'

export type Theme = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'app-theme'

const currentTheme = ref<Theme>('system')
const isDark = ref<boolean>(false)
let isInitialized = false

export function useTheme() {
    function applyTheme(theme: Theme): void {
        const root = document.documentElement

        if(theme === 'dark') {
            root.classList.add('dark-theme')
            isDark.value = true
        } else if (theme === 'light') {
            root.classList.remove('dark-theme')
            isDark.value = false
        } else {
            const preferDark = window.matchMedia('(prefers-color-scheme: dark)').matches

            if (preferDark) {
                root.classList.add('dark-theme')
                isDark.value = true
            } else {
                root.classList.remove('dark-theme')
                isDark.value = false
            }
        }
    }

    function init(): void {
        if (isInitialized) return

        const savedTheme = localStorage.getItem(STORAGE_KEY) as Theme | null
        if (savedTheme) {
            currentTheme.value = savedTheme
        }

        applyTheme(currentTheme.value)

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        mediaQuery.addEventListener('change', () => {
            if (currentTheme.value === 'system') {
                applyTheme('system')
            }
        })

        watch(currentTheme, (theme) => {
            localStorage.setItem(STORAGE_KEY, theme)
            applyTheme(theme)
        })

        isInitialized = true
    }

    function toggleTheme(): void {
        currentTheme.value = currentTheme.value === 'dark' ? 'light' : 'dark'
    }

    function setTheme(theme: Theme): void{
        currentTheme.value = theme
    }

    return {
        theme: currentTheme,
        isDark,
        init,
        toggleTheme,
        setTheme
    }
}