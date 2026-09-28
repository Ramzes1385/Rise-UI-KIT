import type { Meta } from '@storybook/vue3-vite'
import BaseTextarea from '../ui/BaseTextarea.vue'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'

export const render = (args => {
	const onUpdate = useModelArg()
	return {
		components: { BaseTextarea },
		setup: () => ({ props: useArgsWithoutSlots(args), onUpdate }),
		template: '<div class="story-narrow"><BaseTextarea v-bind="props" @update:model-value="onUpdate" /></div>',
	}
}) satisfies Meta<typeof BaseTextarea>['render']
