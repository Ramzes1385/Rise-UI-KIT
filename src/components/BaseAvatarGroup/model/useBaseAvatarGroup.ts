/** Composable: логика BaseAvatarGroup — видимые аватары и счётчик остальных */
import { computed } from 'vue'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import type { AvatarGroupProps } from '../types/BaseAvatarGroup.types'

export function useBaseAvatarGroup(props: AvatarGroupProps) {
	/** Показываются max аватаров; если остаётся один человек, показывается и он вместо «+1» */
	const visibleCount = computed(() => (props.items.length - props.max <= 1 ? props.items.length : Math.max(props.max, 0)))

	return {
		...useStandardBaseComponent('base-avatar-group', props, ['root', 'item', 'more']),
		visibleItems: computed(() => props.items.slice(0, visibleCount.value)),
		restCount: computed(() => props.items.length - visibleCount.value),
	}
}
