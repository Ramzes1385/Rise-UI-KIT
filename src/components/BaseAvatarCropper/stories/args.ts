import type { Meta } from '@storybook/vue3-vite'
import { placeholderImage } from '@/stories/helpers'
import type BaseAvatarCropper from '../ui/BaseAvatarCropper.vue'

export const args = {
	src: placeholderImage({ width: 800, height: 500, hue: 200 }),
	shape: 'circle',
	size: 280,
	maxZoom: 4,
	variant: 'default',
	isDisabled: false,
	sizeScale: 100,
} satisfies Meta<typeof BaseAvatarCropper>['args']
