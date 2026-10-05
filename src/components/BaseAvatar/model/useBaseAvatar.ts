import { UI_ARIA } from '@/locales/messages'
import { useUi } from '@composables/base/useUi'
import { AVATAR_MASCOT_REACT_MS } from '../types/BaseAvatar.types'
import { useClickable } from '@composables/interaction/useClickable'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
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

function useAvatarImage(props: BaseAvatarProps) {
	const imgRef = ref<HTMLImageElement | null>(null)
	const hasImageError = ref(false)
	const isImageLoaded = ref(false)
	watch(
		() => props.src,
		() => {
			hasImageError.value = false
			isImageLoaded.value = false
		},
	)
	onMounted(() => {
		if (imgRef.value?.complete && imgRef.value.naturalWidth > 0) isImageLoaded.value = true
	})

	return {
		imgRef,
		hasImageError,
		isImageLoaded,
		handleImageError: (): void => {
			hasImageError.value = true
		},
		handleImageLoad: (): void => {
			isImageLoaded.value = true
		},
	}
}

export function useBaseAvatar(props: BaseAvatarProps, emit: BaseAvatarEmits) {
	const clickable = useClickable({ event: 'click', isDisabled: () => Boolean(props.isDisabled) })

	return {
		...clickable,
		...useMascotReaction(props),
		buttonLabel: computed(() => (clickable.isClickable.value ? props.alt || props.name || UI_ARIA.AVATAR : undefined)),
		...useStandardBaseComponent('base-avatar', props, ['root', 'content', 'img', 'initials', 'online', 'mascot']),
		ringClass: computed(() => (props.ring && props.ring !== 'none' ? `base-avatar--ring-${props.ring}` : '')),
		...useAvatarImage(props),
		ui: useUi(props, 'base-avatar'),
		initials: computed(() => toInitials(props.name)),
		handleClick: (event: MouseEvent) => {
			if (!props.isDisabled) emit('click', event)
		},
	}
}
