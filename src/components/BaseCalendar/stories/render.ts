import type { Meta } from '@storybook/vue3-vite'
import BaseCalendar from '../ui/BaseCalendar.vue'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'

export const render = (args => {
	const onUpdate = useModelArg()
	return {
		components: { BaseCalendar },
		setup: () => ({ props: useArgsWithoutSlots(args, []), onUpdate }),
		template: '<BaseCalendar v-bind="props" @update:model-value="onUpdate" />',
	}
}) satisfies Meta<typeof BaseCalendar>['render']
