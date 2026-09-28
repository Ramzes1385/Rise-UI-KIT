import type { Meta } from '@storybook/vue3-vite'
import BaseCheckbox from '../ui/BaseCheckbox.vue'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'

export const render = (args => {
	const onUpdate = useModelArg()
	return {
		components: { BaseCheckbox },
		setup: () => ({ props: useArgsWithoutSlots(args), onUpdate }),
		template: '<BaseCheckbox v-bind="props" @update:model-value="onUpdate" />',
	}
}) satisfies Meta<typeof BaseCheckbox>['render']
