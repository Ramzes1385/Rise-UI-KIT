import type { Meta } from '@storybook/vue3-vite'
import type BaseInfiniteScroll from '../ui/BaseInfiniteScroll.vue'
import { baseArgTypes, hiddenArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes(),
	...hiddenArgTypes('variant', 'color'),
	mode: { control: 'inline-radio', options: ['intersect', 'manual'], table: propGroup(ARG_GROUP.behavior) },
	distance: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
	root: { control: false, table: propGroup(ARG_GROUP.behavior) },
	loadingText: { control: 'text', table: propGroup(ARG_GROUP.content) },
	emptyText: { control: 'text', table: propGroup(ARG_GROUP.content) },
	errorText: { control: 'text', table: propGroup(ARG_GROUP.content) },
	loadMoreText: { control: 'text', table: propGroup(ARG_GROUP.content) },
} satisfies Meta<typeof BaseInfiniteScroll>['argTypes']
