import type meta from '../BaseLoader.stories'
import BaseLoader from '../../ui/BaseLoader.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const template = `
	<div class="story-row" style="align-items: flex-end; gap: 24px;">
		<div v-for="preset in presets" :key="preset.name" class="story-col" style="align-items: center; text-align: center;">
			<BaseLoader v-bind="args" :size-scale="preset.sizeScale" />
			<span class="story-label">{{ preset.label }}</span>
		</div>
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'hasLabel'] },
		docs: {
			description: { story: 'Размеры задаются `sizeScale`: при 100 индикатор 32 × 32px. Внутри поля или кнопки используйте 50–60.' },
			source: storySource({ template, imports: ['BaseLoader'], script: `const presets = ${literal(presets)}` }),
		},
	},
	render: args => ({
		components: { BaseLoader },
		setup: useStorySetup(args, { data: { presets } }),
		template,
	}),
}
