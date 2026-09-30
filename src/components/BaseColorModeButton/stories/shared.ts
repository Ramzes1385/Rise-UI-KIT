import { onBeforeUnmount, ref } from 'vue'
import { createColorMode } from '@composables/app/useColorMode'

export function useFrameColorMode() {
	const frame = ref<HTMLElement | null>(null)
	const colorMode = createColorMode({ target: () => frame.value, storageKey: false, initialMode: 'light' })
	onBeforeUnmount(colorMode.stop)
	return { frame, colorMode }
}

export const FRAME_SOURCE = {
	importsFrom: { '@ramzes1385/rise-ui-kit/composables': ['createColorMode'] },
	vue: ['onBeforeUnmount', 'ref'],
	script: `
		const frame = ref(null)
		const colorMode = createColorMode({ target: () => frame.value, storageKey: false, initialMode: 'light' })
		onBeforeUnmount(colorMode.stop)
	`,
}
