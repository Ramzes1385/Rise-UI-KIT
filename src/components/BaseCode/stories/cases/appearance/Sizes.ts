import type meta from '../../BaseCode.stories'
import BaseCode from '../../../ui/BaseCode.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const template = `<div class="story-stack"><BaseCode v-for="preset in presets" :key="preset.name" v-bind="args" :size-scale="preset.sizeScale" :title="preset.label" /></div>`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		a11y: { config: { rules: [{ id: 'landmark-unique', enabled: false }] } },
		docs: {
			description: { story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125 — шрифт, отступы и заголовок.' },
			source: storySource({ template, imports: ['BaseCode'], script: `const presets = ${literal(presets)}` }),
		},
		controls: { include: ['variant'] },
	},
	args: { code: 'npm install @ramzes1385/rise-ui-kit', language: 'bash' },
	render: args => ({
		components: { BaseCode },
		setup: useStorySetup(args, { data: { presets } }),
		template,
	}),
}
