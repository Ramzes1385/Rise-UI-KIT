import type { Ref } from 'vue'
import { computed } from 'vue'
import { useMotion } from '@composables/app/useMotion'

export function useSearchMotion(anchor: Ref<HTMLElement | null>) {
	const motion = useMotion(anchor)

	return {
		isMotionReduced: motion.isReduced,
		motionAttrs: computed((): Record<string, string> => {
			const preset = motion.preset.value
			return anchor.value?.closest('[data-rise-motion]') ? { 'data-rise-motion': preset } : {}
		}),
	}
}
