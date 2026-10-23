import type BaseApp from '../ui/BaseApp.vue'
import type { Meta } from '@storybook/vue3-vite'
import { propGroup, ARG_GROUP } from '@/stories/helpers'

export const argTypes = {
	toaster: { control: 'object', table: propGroup(ARG_GROUP.behavior) },
	loadingBar: { control: 'object', table: propGroup(ARG_GROUP.appearance) },
	ui: { control: false },
} satisfies Meta<typeof BaseApp>['argTypes']
