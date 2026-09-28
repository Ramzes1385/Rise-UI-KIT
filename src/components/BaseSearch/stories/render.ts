import type { SearchArgs } from './shared'
import BaseSearch from '../ui/BaseSearch.vue'
import type { Meta } from '@storybook/vue3-vite'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'

export const render = (args => {
	const onUpdate = useModelArg()
	return {
		components: { BaseSearch },
		setup: () => ({ props: useArgsWithoutSlots(args, []), onUpdate }),
		template: '<div class="story-narrow"><BaseSearch v-bind="props" @update:model-value="onUpdate" /></div>',
	}
}) satisfies Meta<SearchArgs>['render']
