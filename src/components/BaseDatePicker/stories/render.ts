import type { Meta } from '@storybook/vue3-vite'
import BaseDatePicker from '../ui/BaseDatePicker.vue'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'

export const render = (args => {
	const onUpdate = useModelArg()
	return {
		components: { BaseDatePicker },
		setup: () => ({ props: useArgsWithoutSlots(args, []), onUpdate }),
		template: '<div class="story-narrow"><BaseDatePicker v-bind="props" @update:model-value="onUpdate" /></div>',
	}
}) satisfies Meta<typeof BaseDatePicker>['render']
