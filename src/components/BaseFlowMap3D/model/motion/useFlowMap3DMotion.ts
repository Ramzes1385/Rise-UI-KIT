import type { Ref } from 'vue'
import { computed } from 'vue'
import { useMotion } from '@composables/app/useMotion'

const BLEND_FACTOR = 2

export function useFlowMap3DMotion(target: Readonly<Ref<HTMLElement | null>>) {
	const motion = useMotion(target)
	return {
		preset: motion.preset,
		isReduced: motion.isReduced,
		canParticles: computed(() => !motion.isReduced.value && motion.preset.value !== 'subtle'),
		blendMs: () => motion.duration('xslow') * BLEND_FACTOR,
		flightMs: () => motion.duration('xslow'),
		fadeMs: () => motion.duration('base'),
	}
}
