import { computed, ref, watch } from 'vue'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
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

	return {
		...useStandardBaseComponent('base-avatar', props, ['root', 'content', 'img', 'initials', 'online']),
		hasImageError,
		initials: computed(() => toInitials(props.name)),
		handleImageError: (): void => {
			hasImageError.value = true
		},
		handleClick: (event: MouseEvent) => emit('click', event),
	}
}
