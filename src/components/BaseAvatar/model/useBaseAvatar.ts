import { UI_ARIA } from '@/locales/messages'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { AVATAR_MASCOT_REACT_MS } from '../types/BaseAvatar.types'
import { useClickable } from '@composables/interaction/useClickable'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { AvatarMood, BaseAvatarEmits, BaseAvatarProps } from '../types/BaseAvatar.types'

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

function useMascotReaction(props: BaseAvatarProps) {
	const reaction = ref<AvatarMood | null>(null)
	let timer: ReturnType<typeof setTimeout> | undefined
	const clear = (): void => clearTimeout(timer)
	onBeforeUnmount(clear)
	return {
		currentMood: computed<AvatarMood>(() => reaction.value ?? props.mood ?? 'idle'),
		react: (mood: AvatarMood, ms: number = AVATAR_MASCOT_REACT_MS): void => {
			clear()
			reaction.value = mood
			timer = setTimeout(() => {
				reaction.value = null
			}, ms)
		},
	}
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
		...useMascotReaction(props),
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
