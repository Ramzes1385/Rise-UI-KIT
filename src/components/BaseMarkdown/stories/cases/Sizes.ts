import type meta from '../BaseMarkdown.stories'
import BaseMarkdown from '../../ui/BaseMarkdown.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { SIZE_PRESETS, sizeLabel, useArgsWithoutSlots } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125.' } },
		controls: { include: ['variant'] },
	},
	render: args => ({
		components: { BaseMarkdown },
		setup: () => ({
			props: useArgsWithoutSlots(args),
			items: SIZE_PRESETS.map(preset => ({ preset, source: `### ${sizeLabel(preset)}\n\nТекст с **выделением** и \`кодом\`.` })),
		}),
		template: `
			<div style="display: grid; gap: 16px">
				<BaseMarkdown v-for="item in items" :key="item.preset.name" v-bind="props" :size-scale="item.preset.sizeScale" :source="item.source" />
			</div>`,
	}),
}
