import { expect } from 'storybook/test'
import type meta from '../../BaseText.stories'
import BaseText from '../../../ui/BaseText.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const template = `
	<div class="story-col">
		<div v-for="preset in presets" :key="preset.name" class="story-row">
			<span class="story-label">{{ preset.label }}</span>
			<BaseText v-bind="args" :size-scale="preset.sizeScale">Отчёт за май готов</BaseText>
		</div>
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['weight', 'color'] },
		docs: {
			description: { story: 'Размер задаёт `sizeScale`: кегль и интерлиньяж масштабируются вместе (100 — 14/20px).' },
			source: storySource({ template, imports: ['BaseText'], script: `const presets = ${literal(presets)}` }),
		},
	},
	render: args => ({
		components: { BaseText },
		setup: useStorySetup(args, { data: { presets } }),
		template,
	}),
	play: async ({ canvas }) => {
		const [xs, , md, , xl] = canvas.getAllByText('Отчёт за май готов')
		await expect(getComputedStyle(xs).fontSize).toBe('10.5px')
		await expect(getComputedStyle(md).fontSize).toBe('14px')
		await expect(getComputedStyle(xl).lineHeight).toBe('25px')
	},
}
