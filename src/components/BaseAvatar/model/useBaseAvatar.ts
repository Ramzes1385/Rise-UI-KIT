import { computed, ref, watch } from 'vue'
import { UI_ARIA } from '@/locales/messages'
import { useClickable } from '@composables/interaction/useClickable'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseAvatarEmits, BaseAvatarProps } from '../types/BaseAvatar.types'

function toInitials(name: string | undefined): string {
	if (!name) return '?'
	const letters = name
		.split(' ')
		.map(part => part[0] ?? '')
		.filter(Boolean)
		.slice(0, 2)
		.join('')
	return letters.toUpperCase() || '?'
}

export function useBaseAvatar(props: BaseAvatarProps, emit: BaseAvatarEmits) {
	const hasImageError = ref(false)
	watch(
		() => props.src,
		() => {
			hasImageError.value = false
		},
	)

	const clickable = useClickable({ event: 'click', isDisabled: () => Boolean(props.isDisabled) })

	return {
		...clickable,
		buttonLabel: computed(() => (clickable.isClickable.value ? props.alt || props.name || UI_ARIA.AVATAR : undefined)),
		...useStandardBaseComponent('base-avatar', props, ['root', 'content', 'img', 'initials', 'online', 'mascot']),
		ringClass: computed(() => (props.ring && props.ring !== 'none' ? `base-avatar--ring-${props.ring}` : '')),
		hasImageError,
		initials: computed(() => toInitials(props.name)),
		handleImageError: (): void => {
			hasImageError.value = true
		},
		handleClick: (event: MouseEvent) => {
			if (!props.isDisabled) emit('click', event)
		},
	}
}
