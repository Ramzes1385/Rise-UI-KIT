import type { Meta } from '@storybook/vue3-vite'
import BaseSegmented from '../ui/BaseSegmented.vue'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'

export const render = (args => {
	const onUpdate = useModelArg()
	return {
		components: { BaseSegmented },
		setup: () => ({ props: useArgsWithoutSlots(args, []), onUpdate }),
		template: '<BaseSegmented v-bind="props" @update:model-value="onUpdate" />',
	}
}) satisfies Meta<typeof BaseSegmented>['render']
