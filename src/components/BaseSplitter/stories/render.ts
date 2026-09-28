import { LETTERS, BOX, PANES } from './shared'
import type { Meta } from '@storybook/vue3-vite'
import BaseSplitter from '../ui/BaseSplitter.vue'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'

export const render = (args => {
	const onUpdate = useModelArg()
	return {
		components: { BaseSplitter },
		setup: () => ({ props: useArgsWithoutSlots(args), onUpdate, letters: LETTERS, box: BOX }),
		template: `<div :style="box"><BaseSplitter v-bind="props" @update:model-value="onUpdate">${PANES}</BaseSplitter></div>`,
	}
}) satisfies Meta<typeof BaseSplitter>['render']
