import { ITEMS } from './shared'
import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import { StoryRouterLink } from '@/stories/helpers'
import type BaseBottomNav from '../ui/BaseBottomNav.vue'

export const args = {
	items: ITEMS,
	modelValue: 'home',
	variant: 'default',
	isFixed: false,
	hideOnScroll: false,
	maxBadge: 99,
	sizeScale: 100,
	linkComponent: StoryRouterLink,
	onSelect: fn(),
	onNavigate: fn(),
} satisfies Meta<typeof BaseBottomNav>['args']
