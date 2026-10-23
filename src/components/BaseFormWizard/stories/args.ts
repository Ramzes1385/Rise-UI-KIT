import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseFormWizard from '../ui/BaseFormWizard.vue'

export const args = {
	isLinear: true,
	isLoading: false,
	isDisabled: false,
	titleTag: 'h2',
	variant: 'default',
	sizeScale: 100,
	onNext: fn(),
	onBack: fn(),
	onSkip: fn(),
	onFinish: fn(),
	onInvalid: fn(),
	'onStep-change': fn(),
} satisfies Meta<typeof BaseFormWizard>['args']
