import type { Meta } from '@storybook/vue3-vite'
import BaseAvatarGroup from '../ui/BaseAvatarGroup.vue'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const render = (args => ({
	components: { BaseAvatarGroup },
	setup: () => ({ props: useArgsWithoutSlots(args, []) }),
	template: '<BaseAvatarGroup v-bind="props" />',
})) satisfies Meta<typeof BaseAvatarGroup>['render']
