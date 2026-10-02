import { clampIndex } from './timeline'
import { computed, ref, watch } from 'vue'
import type { BasePresentationPlayerEmits, BasePresentationPlayerProps } from '../types/BasePresentationPlayer.types'

export function usePresentationNavigation(props: BasePresentationPlayerProps, emit: BasePresentationPlayerEmits) {
	const count = computed(() => props.slides.length)
	const index = ref(clampIndex(props.slide ?? 0, count.value))

	watch(
		() => props.slide,
		value => {
			if (value !== undefined) index.value = clampIndex(value, count.value)
		},
	)
	watch(count, total => {
		index.value = clampIndex(index.value, total)
	})

	return {
		count,
		index,
		setIndex(value: number): void {
			const next = clampIndex(value, count.value)
			if (next === index.value) return
			index.value = next
			emit('update:slide', next)
		},
	}
}
