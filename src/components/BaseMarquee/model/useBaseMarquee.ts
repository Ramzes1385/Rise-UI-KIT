import { UI_MARQUEE } from '@/locales/messages'
import { useUi } from '@composables/base/useUi'
import { useMarqueeSize } from './useMarqueeSize'
import { computed, nextTick, ref, watch } from 'vue'
import { useReducedMotion } from '@composables/app/useReducedMotion'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseMarqueeEmits, MarqueeProps } from '../types/BaseMarquee.types'
import { useScrollableRegion } from '@composables/interaction/useScrollableRegion'

function usePausedState(props: MarqueeProps, emit: BaseMarqueeEmits) {
	const isPaused = ref(props.isPaused)

	watch(
		() => props.isPaused,
		value => {
			isPaused.value = value
		},
	)

	function togglePause(): void {
		isPaused.value = !isPaused.value
		emit('update:isPaused', isPaused.value)
	}

	return { isPaused, togglePause }
}

export function useBaseMarquee(props: MarqueeProps, emit: BaseMarqueeEmits) {
	const viewportRef = ref<HTMLElement | null>(null)
	const trackRef = ref<HTMLElement | null>(null)
	const isVertical = computed(() => props.direction === 'up' || props.direction === 'down')
	const isReducedMotion = useReducedMotion()
	const { viewportSize, groupSize, measure } = useMarqueeSize(viewportRef, trackRef, () => isVertical.value)
	const { isScrollable } = useScrollableRegion({ elementRef: viewportRef, orientation: 'both' })
	const isRunning = computed(() => !isReducedMotion.value && groupSize.value > 0 && props.speed > 0)
	const copies = computed(() => {
		if (isReducedMotion.value) return 0
		return groupSize.value > 0 ? Math.max(1, Math.ceil(viewportSize.value / groupSize.value)) : 1
	})

	watch(isVertical, () => void nextTick(measure))

	return {
		...useStandardBaseComponent('base-marquee', props, ['root', 'viewport', 'item', 'button']),
		...usePausedState(props, emit),
		ui: useUi(props, 'base-marquee'),
		viewportRef,
		trackRef,
		isVertical,
		isReducedMotion,
		isRunning,
		groupCount: computed(() => copies.value + 1),
		hasPauseControl: computed(() => props.hasPauseButton && !isReducedMotion.value),
		viewportTabindex: computed(() => (isReducedMotion.value && isScrollable.value ? 0 : undefined)),
		motionStyle: computed(() => ({
			'--marquee-gap': `${props.gap}px`,
			...(isRunning.value && { '--marquee-duration': `${groupSize.value / props.speed}s` }),
		})),
		rootLabel: computed(() => props.label || UI_MARQUEE.LABEL),
	}
}
