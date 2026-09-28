import BaseEmpty from '../ui/BaseEmpty.vue'
import type { Meta } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const render = (args => ({
	components: { BaseEmpty },
	setup: () => ({ props: useArgsWithoutSlots(args) }),
	template: '<div class="story-medium"><BaseEmpty v-bind="props" /></div>',
})) satisfies Meta<typeof BaseEmpty>['render']
