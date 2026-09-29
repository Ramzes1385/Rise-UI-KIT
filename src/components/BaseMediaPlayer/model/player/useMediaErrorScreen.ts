import { computed } from 'vue'
import { usePlayerContext } from './usePlayerContext'
import type { MediaErrorEffect, MediaErrorLayer } from '../../types/overlays/MediaError.types'

const SCENES: Record<MediaErrorEffect, string[]> = {
	retro: ['stars', 'sun', 'grid', 'shade'],
	aurora: ['blob', 'blob', 'blob', 'shade'],
	noise: ['noise', 'scanlines', 'roll', 'shade'],
	glitch: ['slice', 'slice', 'slice', 'shade'],
	none: [],
}

export function useMediaErrorScreen() {
	const { props, classes, overlayError, errorMessage, canRetry, retryPlayback } = usePlayerContext()
	const effect = computed<MediaErrorEffect>(() => props.errorEffect)
	return {
		overlayError,
		errorMessage,
		canRetry,
		retryPlayback,
		overlayClasses: computed(() => [classes.value.overlay, `base-media-player__overlay--${effect.value}`]),
		errorLayers: computed<MediaErrorLayer[]>(() =>
			SCENES[effect.value].map((name, index) => ({ key: `${name}-${index}`, className: `base-media-player__error-${name}` })),
		),
	}
}
