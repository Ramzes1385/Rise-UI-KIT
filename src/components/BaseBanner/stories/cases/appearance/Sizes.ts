import { expect } from 'storybook/test'
import type meta from '../../BaseBanner.stories'
import BaseBanner from '../../../ui/BaseBanner.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const template = `
	<div class="story-stack">
		<BaseBanner
			v-for="preset in presets"
			:key="preset.name"
			v-bind="args"
			:size-scale="preset.sizeScale"
			:text="preset.label"
			:label="'Объявление ' + preset.name" />
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	args: { isClosable: true },
	parameters: {
		controls: { include: ['type', 'variant'] },
		docs: {
			description: { story: 'Размеры через `sizeScale`: отступы, текст, иконка и кнопка закрытия масштабируются вместе.' },
			source: storySource({ template, imports: ['BaseBanner'], script: `const presets = ${literal(presets)}` }),
		},
	},
	render: args => ({
		components: { BaseBanner },
		setup: useStorySetup(args, { data: { presets } }),
		template,
	}),
	play: async ({ canvas }) => {
		const closeButtons = canvas.getAllByRole('button', { name: 'Закрыть' })
		await expect(closeButtons).toHaveLength(presets.length)
		for (const button of closeButtons) {
			const { width, height } = button.getBoundingClientRect()
			await expect(Math.round(width)).toBe(Math.round(height))
		}
	},
}
