import { computed } from 'vue'
import { MEDIA_ICONS } from '../../types/controls/MediaIcon.types'
import { MEDIA_BRAND_ICONS } from '../../types/controls/MediaBrandIcon.types'
import type { MediaIconName, MediaIconProps } from '../../types/controls/MediaIcon.types'

const PATHS: Record<MediaIconName, string> = { ...MEDIA_ICONS, ...MEDIA_BRAND_ICONS }

const MORPH_SHAPES: Partial<Record<MediaIconName, readonly [string, string]>> = {
	play: [
		'M187.2 36.9L321.5 110.5Q321.5 110.5 321.5 110.5L321.5 401.5Q321.5 401.5 321.5 401.5L187.2 475.1Q128 507.5 128 440L128 72Q128 4.5 187.2 36.9Z',
		'M320 109.6L511.6 214.6Q536.2 228 536.2 256L536.2 256Q536.2 284 511.6 297.4L320 402.4Q320 402.4 320 402.4L320 109.6Q320 109.6 320 109.6Z',
	],
	pause: [
		'M176 32L240 32Q288 32 288 80L288 432Q288 480 240 480L176 480Q128 480 128 432L128 80Q128 32 176 32Z',
		'M400 32L464 32Q512 32 512 80L512 432Q512 480 464 480L400 480Q352 480 352 432L352 80Q352 32 400 32Z',
	],
}

export function useMediaIcon(props: MediaIconProps) {
	return {
		morph: computed(() => MORPH_SHAPES[props.name] ?? null),
		path: computed(() => PATHS[props.name]),
	}
}
