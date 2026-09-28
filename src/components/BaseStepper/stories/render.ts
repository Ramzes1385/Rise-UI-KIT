import { SLOT_KEYS } from './shared'
import BaseStepper from '../ui/BaseStepper.vue'
import type { Meta } from '@storybook/vue3-vite'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'

export const render = (args => {
	const onUpdate = useModelArg()
	return {
		components: { BaseStepper },
		setup: () => ({ props: useArgsWithoutSlots(args, SLOT_KEYS), onUpdate }),
		template: '<BaseStepper v-bind="props" @update:model-value="onUpdate" />',
	}
}) satisfies Meta<typeof BaseStepper>['render']
