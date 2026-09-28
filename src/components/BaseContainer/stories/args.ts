import type { Meta } from '@storybook/vue3-vite'
import type BaseContainer from '../ui/BaseContainer.vue'

export const args = {
	size: 'md',
	tag: 'div',
	sizeScale: 100,
} satisfies Meta<typeof BaseContainer>['args']
