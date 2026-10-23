import { ITEMS } from './shared'
import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import { StoryRouterLink } from '@/stories/helpers'
import type BaseBreadcrumbs from '../ui/BaseBreadcrumbs.vue'

export const args = {
	items: ITEMS,
	variant: 'default',
	separator: 'chevron',
	maxItems: 0,
	showHome: false,
	homeIcon: 'home',
	sizeScale: 100,
	linkComponent: StoryRouterLink,
	onNavigate: fn(),
	'onItem-click': fn(),
} satisfies Meta<typeof BaseBreadcrumbs>['args']
