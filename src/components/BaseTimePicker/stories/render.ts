import type { Meta } from '@storybook/vue3-vite'
import BaseTimePicker from '../ui/BaseTimePicker.vue'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'

export const render = (args => {
	const onUpdate = useModelArg()
	return {
		components: { BaseTimePicker },
		setup: () => ({ props: useArgsWithoutSlots(args, []), onUpdate }),
		template:
			'<div class="story-narrow" style="max-width: 220px;"><BaseTimePicker v-bind="props" @update:model-value="onUpdate" /></div>',
	}
}) satisfies Meta<typeof BaseTimePicker>['render']
