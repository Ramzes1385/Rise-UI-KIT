import type { Ref } from 'vue'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { WebkitMediaElement } from '../types/MediaCore.types'

function canWebkitFullscreen(media: HTMLMediaElement | null): boolean {
	return typeof (media as WebkitMediaElement | null)?.webkitEnterFullscreen === 'function'
}

function useWebkitEvents(media: Readonly<Ref<HTMLMediaElement | null>>, isFullscreen: Ref<boolean>): void {
	watch(
		media,
		(element, _, onCleanup) => {
			if (!element) return
			const begin = (): void => {
				isFullscreen.value = true
			}
			const end = (): void => {
				isFullscreen.value = false
			}
			element.addEventListener('webkitbeginfullscreen', begin)
			element.addEventListener('webkitendfullscreen', end)
			onCleanup(() => {
				element.removeEventListener('webkitbeginfullscreen', begin)
				element.removeEventListener('webkitendfullscreen', end)
			})
		},
		{ immediate: true },
	)
}

export function useMediaFullscreen(target: Readonly<Ref<HTMLElement | null>>, media: Readonly<Ref<HTMLMediaElement | null>>) {
	const isFullscreen = ref(false)
	const isSupported = ref(false)
	const sync = (): void => {
		isFullscreen.value = Boolean(target.value) && document.fullscreenElement === target.value
	}
	onMounted(() => {
		isSupported.value = document.fullscreenEnabled || canWebkitFullscreen(media.value)
		document.addEventListener('fullscreenchange', sync)
	})
	onBeforeUnmount(() => document.removeEventListener('fullscreenchange', sync))
	useWebkitEvents(media, isFullscreen)

	const enter = async (): Promise<void> => {
		if (target.value && document.fullscreenEnabled) await target.value.requestFullscreen().catch(() => undefined)
		else (media.value as WebkitMediaElement | null)?.webkitEnterFullscreen?.()
	}
	const exit = async (): Promise<void> => {
		if (document.fullscreenElement) await document.exitFullscreen().catch(() => undefined)
	}

	return { isFullscreen, isSupported, enter, exit, toggle: () => (isFullscreen.value ? exit() : enter()) }
}
