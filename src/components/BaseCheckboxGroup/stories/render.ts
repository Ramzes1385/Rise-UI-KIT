import type { Meta } from '@storybook/vue3-vite'
import BaseCheckboxGroup from '../ui/BaseCheckboxGroup.vue'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'

export const render = (args => {
	const onUpdate = useModelArg()
	return {
		components: { BaseCheckboxGroup },
		setup: () => ({ props: useArgsWithoutSlots(args, []), onUpdate }),
		template: '<BaseCheckboxGroup v-bind="props" @update:model-value="onUpdate" />',
	}
}) satisfies Meta<typeof BaseCheckboxGroup>['render']
