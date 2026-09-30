import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseInputNumber.stories'
import BaseInputNumber from '../../../ui/BaseInputNumber.vue'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.filter(preset => ['xs', 'md', 'xl'].includes(preset.name)).map(preset => ({
	name: preset.name,
	sizeScale: preset.sizeScale,
	label: sizeLabel(preset),
}))

const template = `
	<div class="story-row">
		<BaseInputNumber v-for="preset in presets" :key="preset.name" v-bind="args" :size-scale="preset.sizeScale" :label="preset.label" />
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Размеры через `sizeScale`: высота поля и кнопок 24, 32 и 40px.' },
			source: storySource({
				template,
				imports: ['BaseInputNumber'],
				script: `const presets = ${literal(presets)}`,
				omit: ['sizeScale', 'label'],
			}),
		},
		controls: { include: ['variant'] },
	},
	render: args => ({
		components: { BaseInputNumber },
		setup: useStorySetup(args, { data: { presets }, slots: ['sizeScale', 'label'] }),
		template,
	}),
}
