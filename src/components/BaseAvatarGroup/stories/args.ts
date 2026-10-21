import { PEOPLE } from './shared'
import type { Meta } from '@storybook/vue3-vite'
import type BaseAvatarGroup from '../ui/BaseAvatarGroup.vue'

export const args = {
	items: PEOPLE,
	max: 4,
	shape: 'square',
	ariaLabel: 'Участники проекта',
	variant: 'default',
	sizeScale: 100,
} satisfies Meta<typeof BaseAvatarGroup>['args']
