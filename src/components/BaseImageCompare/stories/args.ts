import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import { placeholderImage } from '@/stories/helpers'
import type BaseImageCompare from '../ui/BaseImageCompare.vue'

export const args = {
	before: placeholderImage({ hue: 210 }),
	after: placeholderImage({ hue: 24 }),
	beforeAlt: 'Горы в холодном свете до цветокоррекции',
	afterAlt: 'Те же горы в тёплом свете после цветокоррекции',
	position: 50,
	variant: 'default',
	sizeScale: 100,
	'onUpdate:position': fn(),
} satisfies Meta<typeof BaseImageCompare>['args']
