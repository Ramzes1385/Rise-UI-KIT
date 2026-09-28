import type { Meta } from '@storybook/vue3-vite'
import BaseSplitButton from '../ui/BaseSplitButton.vue'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const render = (args => ({
	components: { BaseSplitButton },
	setup: () => ({ props: useArgsWithoutSlots(args, []) }),
	template: '<BaseSplitButton v-bind="props" />',
})) satisfies Meta<typeof BaseSplitButton>['render']
