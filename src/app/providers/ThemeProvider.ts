import { readonly, ref } from 'vue'

export type Theme = 'light' | 'dark'

const theme = ref<Theme>('light')

export function useTheme() {
	function toggleTheme() {
		theme.value = theme.value === 'light' ? 'dark' : 'light'
		document.documentElement.setAttribute('data-theme', theme.value)
	}

	return {
		theme: readonly(theme),
		toggleTheme,
	}
}
