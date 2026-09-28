import BaseUser from '../ui/BaseUser.vue'
import type { Meta } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const render = (args => ({
	components: { BaseUser },
	setup: () => ({ props: useArgsWithoutSlots(args, []) }),
	template: '<BaseUser v-bind="props" />',
})) satisfies Meta<typeof BaseUser>['render']
