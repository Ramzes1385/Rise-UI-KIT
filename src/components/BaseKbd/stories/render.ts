import BaseKbd from '../ui/BaseKbd.vue'
import type { Meta } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const render = (args => ({
	components: { BaseKbd },
	setup: () => ({ props: useArgsWithoutSlots(args, []) }),
	template: '<BaseKbd v-bind="props" />',
})) satisfies Meta<typeof BaseKbd>['render']
