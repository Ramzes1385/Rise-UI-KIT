import { fn } from 'storybook/test'
import type BaseLink from '../ui/BaseLink.vue'
import type { Meta } from '@storybook/vue3-vite'
import { StoryRouterLink } from '@/stories/helpers'

export const args = {
	label: 'Настройки проекта',
	to: '/projects/42/settings',
	variant: 'default',
	sizeScale: 100,
	isDisabled: false,
	hasExternalIcon: true,
	linkComponent: StoryRouterLink,
	onClick: fn(),
} satisfies Meta<typeof BaseLink>['args']
