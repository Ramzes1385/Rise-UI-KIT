import { SMALL_COLUMNS } from '../../shared'
import type meta from '../../BaseKanban.stories'
import BaseKanban from '../../../ui/BaseKanban.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { SIZE_PRESETS, sizeLabel, useArgsWithoutSlots } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125.' } },
		controls: { include: ['variant'] },
	},
	args: { columns: SMALL_COLUMNS },
	render: args => ({
		components: { BaseKanban },
		setup: () => ({ props: useArgsWithoutSlots(args), presets: SIZE_PRESETS, sizeLabel }),
		template:
			'<div style="display: grid; gap: 24px"><BaseKanban v-for="preset in presets" :key="preset.name" v-bind="props" :size-scale="preset.sizeScale" :aria-label="sizeLabel(preset)" /></div>',
	}),
}
