import BaseRating from '../ui/BaseRating.vue'
import type { Meta } from '@storybook/vue3-vite'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'

export const render = (args => {
	const onUpdate = useModelArg()
	return {
		components: { BaseRating },
		setup: () => ({ props: useArgsWithoutSlots(args), onUpdate }),
		template: '<BaseRating v-bind="props" @update:model-value="onUpdate" />',
	}
}) satisfies Meta<typeof BaseRating>['render']
