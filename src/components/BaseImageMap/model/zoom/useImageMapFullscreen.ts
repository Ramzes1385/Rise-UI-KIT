import type { Ref } from 'vue'
import { useScrollLock } from '@composables/overlay/useScrollLock'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const FULLSCREEN_TOGGLE_ATTR = 'data-map-fullscreen'

function isNativeAvailable(root: HTMLElement | null): boolean {
	return Boolean(document.fullscreenEnabled && root?.requestFullscreen)
}

function restoreFocus(root: HTMLElement | null): void {
	const active = document.activeElement
	if (active && active !== document.body) return
	root?.querySelector<HTMLElement>(`[${FULLSCREEN_TOGGLE_ATTR}]`)?.focus()
}

function useFallbackMode(rootRef: Readonly<Ref<HTMLElement | null>>, onExit: () => void) {
	const isFallback = ref(false)
	const scrollLock = useScrollLock()

	const onEscape = (event: KeyboardEvent): void => {
		if (event.key !== 'Escape' || event.defaultPrevented) return
		const active = document.activeElement
		if (active && active !== document.body && !rootRef.value?.contains(active)) return
		onExit()
	}

	watch(isFallback, value => {
		if (value) {
			scrollLock.lock()
			document.addEventListener('keydown', onEscape)
			return
		}
		scrollLock.unlock()
		document.removeEventListener('keydown', onEscape)
	})
	onBeforeUnmount(() => {
		document.removeEventListener('keydown', onEscape)
		scrollLock.unlock()
	})

	return isFallback
}

export function useImageMapFullscreen(rootRef: Readonly<Ref<HTMLElement | null>>) {
	const isNative = ref(false)
	const isFullscreen = ref(false)
	const isFullscreenSupported = ref(false)
	const isFallback = useFallbackMode(rootRef, exitFallback)

	function sync(): void {
		isNative.value = Boolean(rootRef.value) && document.fullscreenElement === rootRef.value
		isFullscreen.value = isNative.value || isFallback.value
	}

	function exitFallback(): void {
		isFallback.value = false
		sync()
	}

	async function requestNative(): Promise<void> {
		try {
			await rootRef.value?.requestFullscreen()
		} catch {
			sync()
		}
	}

	async function toggleFullscreen(): Promise<void> {
		if (isFallback.value) exitFallback()
		else if (isNative.value) await document.exitFullscreen().catch(sync)
		else if (isNativeAvailable(rootRef.value)) await requestNative()
		else {
			isFallback.value = true
			sync()
		}
	}

	watch(isFullscreen, (value, previous) => {
		if (previous && !value) void nextTick(() => restoreFocus(rootRef.value))
	})
	onMounted(() => {
		isFullscreenSupported.value = true
		document.addEventListener('fullscreenchange', sync)
	})
	onBeforeUnmount(() => document.removeEventListener('fullscreenchange', sync))

	return { isFullscreen, isFullscreenSupported, isFullscreenFallback: isFallback, toggleFullscreen }
}
