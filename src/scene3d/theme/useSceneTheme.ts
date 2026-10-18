import { onBeforeUnmount, onMounted } from 'vue'

const THEME_ATTRIBUTES = ['data-theme', 'data-rise-theme']
const DARK_QUERY = '(prefers-color-scheme: dark)'

export function useSceneTheme(onChange: () => void): void {
	let observer: MutationObserver | null = null
	let media: MediaQueryList | null = null

	onMounted(() => {
		observer = new MutationObserver(onChange)
		observer.observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: THEME_ATTRIBUTES })
		media = typeof window.matchMedia === 'function' ? window.matchMedia(DARK_QUERY) : null
		media?.addEventListener('change', onChange)
	})

	onBeforeUnmount(() => {
		observer?.disconnect()
		media?.removeEventListener('change', onChange)
	})
}
