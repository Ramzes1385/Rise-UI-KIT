import type meta from '../BaseFileUpload.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFileUpload from '../../ui/BaseFileUpload.vue'
import { SIZE_PRESETS, useArgsWithoutSlots, sizeLabel } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		maxWidth: 760,
		controls: { include: ['variant'] },
		docs: {
			description: { story: 'Размеры через `sizeScale`: отступы, шрифт и иконки зоны и строк файлов масштабируются вместе.' },
			source: { code: SIZE_PRESETS.map(preset => `<BaseFileUpload :size-scale="${preset.sizeScale}" />`).join('\n') },
		},
	},
	render: args => ({
		components: { BaseFileUpload },
		setup: () => ({ props: useArgsWithoutSlots(args, ['sizeScale', 'label']), presets: SIZE_PRESETS, sizeLabel }),
		template: `
			<div class="story-grid" style="--story-grid-min: 280px; align-items: end;">
				<BaseFileUpload v-for="preset in presets" :key="preset.name" v-bind="props" :size-scale="preset.sizeScale" :label="sizeLabel(preset)" />
			</div>
		`,
	}),
}
