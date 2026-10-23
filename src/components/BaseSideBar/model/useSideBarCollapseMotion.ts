import type { Ref } from 'vue'
import { useMotion } from '@composables/app/useMotion'
import { computed, onBeforeUnmount, ref, watch } from 'vue'

export function useSideBarCollapseMotion(isCollapsed: () => boolean, rootRef: Ref<HTMLElement | null>) {
	const motion = useMotion(rootRef)
	const isCollapsedView = ref(isCollapsed())
	const phase = ref<'idle' | 'labels-out' | 'labels-in'>('idle')
	let timer: ReturnType<typeof setTimeout> | undefined

	const settle = (collapsed: boolean): void => {
		isCollapsedView.value = collapsed
		phase.value = 'idle'
	}

	const later = (delay: number, collapsed: boolean): void => {
		timer = setTimeout(() => settle(collapsed), delay)
	}

	watch(isCollapsed, collapsed => {
		clearTimeout(timer)
		if (motion.isReduced.value || collapsed === isCollapsedView.value) return settle(collapsed)
		if (collapsed) {
			phase.value = 'labels-out'
			return later(motion.duration('fast'), true)
		}
		isCollapsedView.value = false
		phase.value = 'labels-in'
		later(motion.duration('slow') + motion.duration('fast'), false)
	})

	onBeforeUnmount(() => clearTimeout(timer))

	return {
		isCollapsedView,
		collapseMotionClass: computed(() => (phase.value === 'idle' ? undefined : `base-side-bar--${phase.value}`)),
	}
}
