import { ref, onBeforeUnmount } from 'vue'
import { createColorMode } from '@composables/useColorMode'

export function useFrameColorMode() {
	const frame = ref<HTMLElement | null>(null)
	const colorMode = createColorMode({ target: () => frame.value, storageKey: false, initialMode: 'light' })
	onBeforeUnmount(colorMode.stop)
	return { frame, colorMode }
}
