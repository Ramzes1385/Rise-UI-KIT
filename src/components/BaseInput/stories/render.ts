import BaseInput from '../ui/BaseInput.vue'
import type { Meta } from '@storybook/vue3-vite'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'

export const render = (args => {
	const onUpdate = useModelArg()
	return {
		components: { BaseInput },
		setup: () => ({ props: useArgsWithoutSlots(args, []), onUpdate }),
		template: '<div class="story-narrow"><BaseInput v-bind="props" @update:model-value="onUpdate" /></div>',
	}
}) satisfies Meta<typeof BaseInput>['render']
