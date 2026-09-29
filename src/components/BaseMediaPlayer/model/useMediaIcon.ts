import { computed } from 'vue'
import { MEDIA_ICONS } from '../types/MediaIcon.types'
import type { MediaIconProps } from '../types/MediaIcon.types'

const MORPH_SHAPES: Partial<Record<MediaIconProps['name'], readonly [string, string]>> = {
	play: ['M8,5.14 L13.5,8.64 L13.5,15.64 L8,19.14 Z', 'M13.5,8.64 L19,12.14 L19,12.14 L13.5,15.64 Z'],
	pause: ['M6,5 L10,5 L10,19 L6,19 Z', 'M14,5 L18,5 L18,19 L14,19 Z'],
}

export function useMediaIcon(props: MediaIconProps) {
	return {
		morph: computed(() => MORPH_SHAPES[props.name] ?? null),
		path: computed(() => MEDIA_ICONS[props.name]),
	}
}
