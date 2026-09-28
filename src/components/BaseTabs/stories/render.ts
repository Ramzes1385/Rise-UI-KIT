import BaseTabs from '../ui/BaseTabs.vue'
import type { Meta } from '@storybook/vue3-vite'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'

export const render = (args => {
	const onUpdate = useModelArg()
	return {
		components: { BaseTabs },
		setup: () => ({ props: useArgsWithoutSlots(args), onUpdate }),
		template: '<BaseTabs v-bind="props" @update:model-value="onUpdate" />',
	}
}) satisfies Meta<typeof BaseTabs>['render']
