import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseAnimation from '../ui/BaseAnimation.vue'

export const args = {
	show: true,
	name: 'fade',
	mode: 'out-in',
	isGroup: false,
	tag: 'div',
	'onAfter-enter': fn(),
	'onAfter-leave': fn(),
} satisfies Meta<typeof BaseAnimation>['args']
