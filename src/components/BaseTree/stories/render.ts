import BaseTree from '../ui/BaseTree.vue'
import type { Meta } from '@storybook/vue3-vite'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'

export const render = (args => {
	const onExpanded = useModelArg('expandedIds')
	const onSelected = useModelArg('selectedIds')
	return {
		components: { BaseTree },
		setup: () => ({ props: useArgsWithoutSlots(args, []), onExpanded, onSelected }),
		template:
			'<div class="story-narrow"><BaseTree v-bind="props" @update:expanded-ids="onExpanded" @update:selected-ids="onSelected" /></div>',
	}
}) satisfies Meta<typeof BaseTree>['render']
