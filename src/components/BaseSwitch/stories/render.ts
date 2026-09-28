import BaseSwitch from '../ui/BaseSwitch.vue'
import type { Meta } from '@storybook/vue3-vite'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'

export const render = (args => {
	const onUpdate = useModelArg()
	return {
		components: { BaseSwitch },
		setup: () => ({ props: useArgsWithoutSlots(args), onUpdate }),
		template: '<BaseSwitch v-bind="props" @update:model-value="onUpdate" />',
	}
}) satisfies Meta<typeof BaseSwitch>['render']
