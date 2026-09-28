import { expect } from 'storybook/test'
import { useFrameColorMode } from '../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../BaseColorModeButton.stories'
import BaseColorModeButton from '../../ui/BaseColorModeButton.vue'
import { useArgsWithoutSlots, SIZE_PRESETS, sizeLabel } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125. Кнопка остаётся квадратной.' } },
		controls: { include: ['variant'] },
	},
	render: args => ({
		components: { BaseColorModeButton },
		setup: () => ({ props: useArgsWithoutSlots(args, []), presets: SIZE_PRESETS, sizeLabel, ...useFrameColorMode() }),
		template: `
			<div ref="frame" class="story-frame story-row" style="background: var(--rise-bg);">
				<BaseColorModeButton v-for="preset in presets" :key="preset.name" v-bind="props" :size-scale="preset.sizeScale" :label="'Тёмная тема, ' + sizeLabel(preset)" :color-mode="colorMode" />
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		for (const button of canvas.getAllByRole('button')) {
			const { width, height } = button.getBoundingClientRect()
			await expect(width).toBeCloseTo(height, 0)
		}
	},
}
