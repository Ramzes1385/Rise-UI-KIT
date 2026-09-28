import BaseSelect from '../ui/BaseSelect.vue'
import type { Meta } from '@storybook/vue3-vite'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'

export const render = (args => {
	const onUpdate = useModelArg()
	return {
		components: { BaseSelect },
		setup: () => ({ props: useArgsWithoutSlots(args, []), onUpdate }),
		template: '<div class="story-narrow"><BaseSelect v-bind="props" @update:model-value="onUpdate" /></div>',
	}
}) satisfies Meta<typeof BaseSelect>['render']
