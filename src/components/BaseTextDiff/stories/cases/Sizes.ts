import type meta from '../BaseTextDiff.stories'
import BaseTextDiff from '../../ui/BaseTextDiff.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { SHORT_AFTER, SHORT_BEFORE } from '../shared'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const before = SHORT_BEFORE

const after = SHORT_AFTER

const template = `
	<div class="story-stack">
		<BaseTextDiff
			v-for="preset in presets"
			:key="preset.name"
			v-bind="args"
			:before="before"
			:after="after"
			:size-scale="preset.sizeScale"
			:label="preset.label" />
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125.' },
			source: storySource({
				template,
				imports: ['BaseTextDiff'],
				script: [
					`const presets = ${literal(presets)}`,
					`const before = ${literal(before)}`,
					`const after = ${literal(after)}`,
				].join('\n'),
			}),
		},
		controls: { include: ['variant', 'mode'] },
	},
	render: args => ({
		components: { BaseTextDiff },
		setup: useStorySetup(args, { data: { presets, before, after } }),
		template,
	}),
}
