import type { Ref } from 'vue'
import { nextTick, ref } from 'vue'
import { useMotion } from '@composables/app/useMotion'
import { useRoadmap3DSize } from '../view/useRoadmap3DSize'
import { useRoadmap3DView } from '../view/useRoadmap3DView'
import { useReducedMotion } from '@composables/app/useReducedMotion'
import { useRoadmapModel } from '@components/BaseRoadmap/model/useRoadmapModel'
import type { BaseRoadmap3DEmits, Roadmap3DProps } from '../../types/BaseRoadmap3D.types'
import type { BaseRoadmapEmits, BaseRoadmapProps } from '@components/BaseRoadmap/types/BaseRoadmap.types'

export function useRoadmap3DCore(props: Roadmap3DProps, emit: BaseRoadmap3DEmits, rootRef: Readonly<Ref<HTMLElement | null>>) {
	const isReducedMotion = useReducedMotion()
	const motion = useMotion(rootRef)
	const announcement = ref('')
	const announce = (text: string): void => {
		announcement.value = ''
		void nextTick(() => (announcement.value = text))
	}
	const model = useRoadmapModel(props as unknown as BaseRoadmapProps, emit as BaseRoadmapEmits)
	const { isCompact } = useRoadmap3DSize(() => props.compactBreakpoint, rootRef)
	const view = useRoadmap3DView({ props, emit, isReviewing: model.isReviewing })
	return { model, view, isCompact, isReducedMotion, motion, announce, announcement }
}
