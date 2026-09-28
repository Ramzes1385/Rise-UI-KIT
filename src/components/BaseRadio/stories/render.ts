import BaseRadio from '../ui/BaseRadio.vue'
import type { Meta } from '@storybook/vue3-vite'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'

export const render = (args => {
	const onUpdate = useModelArg()
	return {
		components: { BaseRadio },
		setup: () => ({ props: useArgsWithoutSlots(args), onUpdate }),
		template: '<BaseRadio v-bind="props" @update:model-value="onUpdate" />',
	}
}) satisfies Meta<typeof BaseRadio>['render']
