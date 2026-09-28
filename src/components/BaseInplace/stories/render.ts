import BaseInplace from '../ui/BaseInplace.vue'
import type { Meta } from '@storybook/vue3-vite'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'

export const render = (args => {
	const onUpdate = useModelArg()
	return {
		components: { BaseInplace },
		setup: () => ({ props: useArgsWithoutSlots(args, []), onUpdate }),
		template: '<BaseInplace v-bind="props" @update:model-value="onUpdate" />',
	}
}) satisfies Meta<typeof BaseInplace>['render']
