import type { Meta } from '@storybook/vue3-vite'
import type BaseLayout from '../ui/BaseLayout.vue'
import { baseArgTypes, hiddenArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes(),
	...hiddenArgTypes('variant', 'color'),
	hasSkipLink: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	skipLinkLabel: { control: 'text', table: propGroup(ARG_GROUP.content) },
	mainId: { control: 'text', table: propGroup(ARG_GROUP.content) },
	isHeaderSticky: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	isSidebarVisibleOnMobile: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	ui: { control: false },
} satisfies Meta<typeof BaseLayout>['argTypes']
