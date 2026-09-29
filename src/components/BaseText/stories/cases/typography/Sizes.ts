import { expect } from 'storybook/test'
import type meta from '../../BaseText.stories'
import BaseText from '../../../ui/BaseText.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { SIZE_PRESETS, useArgsWithoutSlots, sizeLabel } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['weight', 'color'] },
		docs: {
			description: { story: 'Размер задаёт `sizeScale`: кегль и интерлиньяж масштабируются вместе (100 — 14/20px).' },
			source: {
				code: SIZE_PRESETS.map(preset => `<BaseText :size-scale="${preset.sizeScale}">${preset.name}</BaseText>`).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseText },
		setup: () => ({ props: useArgsWithoutSlots(args), presets: SIZE_PRESETS, sizeLabel }),
		template: `
			<div class="story-col">
				<div v-for="preset in presets" :key="preset.name" class="story-row">
					<span class="story-label">{{ sizeLabel(preset) }}</span>
					<BaseText v-bind="props" :size-scale="preset.sizeScale">Отчёт за май готов</BaseText>
				</div>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const [xs, , md, , xl] = canvas.getAllByText('Отчёт за май готов')
		await expect(getComputedStyle(xs).fontSize).toBe('10.5px')
		await expect(getComputedStyle(md).fontSize).toBe('14px')
		await expect(getComputedStyle(xl).lineHeight).toBe('25px')
	},
}
