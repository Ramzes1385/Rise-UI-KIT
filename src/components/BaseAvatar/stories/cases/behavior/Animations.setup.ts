import { ref } from 'vue'
import type { BaseAvatarExpose } from '../../../types/BaseAvatar.types'

export function setup() {
	const presets = ['none', 'subtle', 'standard', 'expressive']
	const avatars = ref<BaseAvatarExpose[]>([])

	function replay(): void {
		avatars.value.forEach(avatar => avatar.react('surprised'))
	}

	return { presets, avatars, replay }
}
