import type { Meta } from '@storybook/vue3-vite'
import BasePagination from '../ui/BasePagination.vue'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'

export const render = (args => {
	const onUpdate = useModelArg()
	return {
		components: { BasePagination },
		setup: () => ({ props: useArgsWithoutSlots(args), onUpdate }),
		template: '<BasePagination v-bind="props" @update:model-value="onUpdate" />',
	}
}) satisfies Meta<typeof BasePagination>['render']
