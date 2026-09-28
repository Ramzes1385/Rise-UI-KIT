import BaseRange from '../ui/BaseRange.vue'
import type { Meta } from '@storybook/vue3-vite'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'

export const render = (args => {
	const onUpdate = useModelArg()
	return {
		components: { BaseRange },
		setup: () => ({ props: useArgsWithoutSlots(args, ['thumb']), onUpdate }),
		template: '<div class="story-narrow"><BaseRange v-bind="props" @update:model-value="onUpdate" /></div>',
	}
}) satisfies Meta<typeof BaseRange>['render']
