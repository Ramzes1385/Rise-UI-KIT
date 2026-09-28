import { computed } from 'vue'
import type { AvatarGroupProps } from '../types/BaseAvatarGroup.types'
import { useStandardBaseComponent } from '@composables/useBaseComponent'

export function useBaseAvatarGroup(props: AvatarGroupProps) {
	const visibleCount = computed(() => (props.items.length - props.max <= 1 ? props.items.length : Math.max(props.max, 0)))

	return {
		...useStandardBaseComponent('base-avatar-group', props, ['root', 'item', 'more']),
		visibleItems: computed(() => props.items.slice(0, visibleCount.value)),
		restCount: computed(() => props.items.length - visibleCount.value),
	}
}
