import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../BaseColorModeButton.stories'
import { FRAME_SOURCE, useFrameColorMode } from '../shared'
import BaseColorModeButton from '../../ui/BaseColorModeButton.vue'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const template = `
	<div ref="frame" class="story-frame story-row" style="background: var(--rise-bg);">
		<BaseColorModeButton
			v-for="preset in presets"
			:key="preset.name"
			v-bind="args"
			:size-scale="preset.sizeScale"
			:label="'Тёмная тема, ' + preset.label"
			:color-mode="colorMode" />
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125. Кнопка остаётся квадратной.' },
			source: storySource({
				template,
				imports: ['BaseColorModeButton'],
				...FRAME_SOURCE,
				script: `const presets = ${literal(presets)}\n${FRAME_SOURCE.script}`,
				omit: ['sizeScale'],
			}),
		},
		controls: { include: ['variant'] },
	},
	render: args => {
		const setup = useStorySetup(args, { slots: [], data: { presets } })
		return {
			components: { BaseColorModeButton },
			setup: () => ({ ...setup(), ...useFrameColorMode() }),
			template,
		}
	},
	play: async ({ canvas }) => {
		for (const button of canvas.getAllByRole('button')) {
			const { width, height } = button.getBoundingClientRect()
			await expect(width).toBeCloseTo(height, 0)
		}
	},
}
