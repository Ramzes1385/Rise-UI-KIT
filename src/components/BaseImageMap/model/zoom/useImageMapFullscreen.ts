import type { Ref } from 'vue'
import { onBeforeUnmount, onMounted, ref } from 'vue'

export function useImageMapFullscreen(rootRef: Ref<HTMLElement | null>) {
	const isFullscreen = ref(false)
	const isSupported = ref(false)

	const sync = (): void => {
		isFullscreen.value = Boolean(rootRef.value) && document.fullscreenElement === rootRef.value
	}

	onMounted(() => {
		isSupported.value = Boolean(document.fullscreenEnabled && rootRef.value?.requestFullscreen)
		document.addEventListener('fullscreenchange', sync)
	})
	onBeforeUnmount(() => document.removeEventListener('fullscreenchange', sync))

	return {
		isFullscreen,
		isFullscreenSupported: isSupported,
		async toggleFullscreen(): Promise<void> {
			try {
				if (isFullscreen.value) await document.exitFullscreen()
				else await rootRef.value?.requestFullscreen()
			} catch {
				sync()
			}
		},
	}
}
