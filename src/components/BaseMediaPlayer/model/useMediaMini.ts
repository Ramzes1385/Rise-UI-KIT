import type { MediaMiniOptions } from '../types/MediaScreen.types'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const VISIBLE_SHARE = 0.25

export function useMediaMini(options: MediaMiniOptions) {
	const isScrolledPast = ref(false)
	const isActive = ref(false)
	const isDismissed = ref(false)
	let observer: IntersectionObserver | undefined
	onMounted(() => {
		const root = options.root.value
		if (!root || typeof IntersectionObserver === 'undefined') return
		observer = new IntersectionObserver(
			entries => {
				const entry = entries[entries.length - 1]
				isScrolledPast.value = entry.intersectionRatio < VISIBLE_SHARE && entry.boundingClientRect.top < 0
			},
			{ threshold: [0, VISIBLE_SHARE] },
		)
		observer.observe(root)
	})
	onBeforeUnmount(() => observer?.disconnect())
	watch(
		() => [isScrolledPast.value, options.state.isPaused] as const,
		([isPast, isPaused]) => {
			if (!isPast) {
				isActive.value = false
				isDismissed.value = false
			} else if (!isPaused && !isDismissed.value && options.isEnabled() && !options.isFullscreen()) isActive.value = true
		},
	)

	return {
		isMini: computed(() => isActive.value && !options.isFullscreen()),
		closeMini(): void {
			isActive.value = false
			isDismissed.value = true
			options.pause()
		},
		expandMini(): void {
			options.root.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
		},
	}
}
