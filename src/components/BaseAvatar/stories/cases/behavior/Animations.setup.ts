import { ref } from 'vue'
import type { BaseAvatarExpose } from '../../../types/BaseAvatar.types'

export function setup() {
	const presets = ['none', 'subtle', 'standard', 'expressive']
	const avatars = ref<BaseAvatarExpose[]>([])
	const photoKey = ref(0)
	const isOnline = ref(true)

	function replay(): void {
		avatars.value.forEach(avatar => avatar.react('surprised'))
		photoKey.value++
	}

	return { presets, avatars, photoKey, isOnline, replay }
}
