import { computed } from 'vue'
import { useUi } from '@composables/base/useUi'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { AvatarGroupItem, AvatarGroupProps } from '../types/BaseAvatarGroup.types'

function withKeys(items: readonly AvatarGroupItem[]) {
	const seen = new Map<string, number>()
	return items.map(item => {
		const count = (seen.get(item.name) ?? 0) + 1
		seen.set(item.name, count)
		return { ...item, key: `${item.name}#${count}` }
	})
}

function pinLeaving(el: Element): void {
	const item = el as HTMLElement
	item.style.left = `${item.offsetLeft}px`
	item.style.top = `${item.offsetTop}px`
	item.style.margin = '0'
}

export function useBaseAvatarGroup(props: AvatarGroupProps) {
	const visibleCount = computed(() => (props.items.length - props.max <= 1 ? props.items.length : Math.max(props.max, 0)))

	return {
		...useStandardBaseComponent('base-avatar-group', props, ['root', 'item', 'more']),
		ui: useUi(props, 'base-avatar-group'),
		visibleItems: computed(() => withKeys(props.items).slice(0, visibleCount.value)),
		restCount: computed(() => props.items.length - visibleCount.value),
		handleBeforeLeave: pinLeaving,
	}
}
