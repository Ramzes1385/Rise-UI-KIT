import type BaseStack from '../ui/BaseStack.vue'
import type { Meta } from '@storybook/vue3-vite'

export const args = {
	direction: 'column',
	gap: 'md',
	align: 'stretch',
	justify: 'start',
	isWrap: false,
	isInline: false,
	tag: 'div',
	sizeScale: 100,
} satisfies Meta<typeof BaseStack>['args']
