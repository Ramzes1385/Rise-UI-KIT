import { onBeforeUnmount, onMounted, ref } from 'vue'

const THEME_ATTRIBUTES = ['data-theme', 'data-rise-theme']
const DARK_QUERY = '(prefers-color-scheme: dark)'

export function useColorPickerTheme() {
	const stamp = ref(0)
	let observer: MutationObserver | null = null
	let media: MediaQueryList | null = null
	const bump = (): void => {
		stamp.value += 1
	}

	onMounted(() => {
		observer = new MutationObserver(bump)
		observer.observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: THEME_ATTRIBUTES })
		media = typeof window.matchMedia === 'function' ? window.matchMedia(DARK_QUERY) : null
		media?.addEventListener('change', bump)
	})

	onBeforeUnmount(() => {
		observer?.disconnect()
		media?.removeEventListener('change', bump)
	})

	return stamp
}
