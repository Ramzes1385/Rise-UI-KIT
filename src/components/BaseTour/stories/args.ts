import { STEPS } from './shared'
import { fn } from 'storybook/test'
import type BaseTour from '../ui/BaseTour.vue'
import type { Meta } from '@storybook/vue3-vite'

export const args = {
	isOpen: false,
	step: 0,
	steps: STEPS,
	placement: 'auto',
	showSkip: true,
	showProgress: true,
	showArrow: true,
	onSkip: fn(),
	onFinish: fn(),
	onClose: fn(),
	'onUpdate:isOpen': fn(),
	'onUpdate:step': fn(),
} satisfies Meta<typeof BaseTour>['args']
