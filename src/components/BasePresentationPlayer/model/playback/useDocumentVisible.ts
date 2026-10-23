import { onBeforeUnmount, onMounted, ref } from 'vue'

export function useDocumentVisible() {
	const isVisible = ref(true)
	const sync = (): void => {
		isVisible.value = document.visibilityState !== 'hidden'
	}
	onMounted(() => {
		sync()
		document.addEventListener('visibilitychange', sync)
	})
	onBeforeUnmount(() => document.removeEventListener('visibilitychange', sync))
	return isVisible
}
