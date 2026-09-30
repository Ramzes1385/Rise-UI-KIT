import { SMALL } from '../shared'
import type meta from '../BaseJsonViewer.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseJsonViewer from '../../ui/BaseJsonViewer.vue'
import { SIZE_PRESETS, sizeLabel, useArgsWithoutSlots } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125 — дерево и кнопки панели вместе.' } },
		controls: { include: ['variant'] },
	},
	render: args => ({
		components: { BaseJsonViewer },
		setup: () => ({ props: useArgsWithoutSlots(args), presets: SIZE_PRESETS, sizeLabel, small: SMALL }),
		template: `
			<div class="story-stack">
				<BaseJsonViewer
					v-for="preset in presets"
					:key="preset.name"
					v-bind="props"
					:value="small"
					:has-toolbar="false"
					:size-scale="preset.sizeScale"
					:label="sizeLabel(preset)" />
			</div>
		`,
	}),
}
