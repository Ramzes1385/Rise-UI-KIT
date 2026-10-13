import { expect } from 'storybook/test'
import type meta from '../../BaseStack.stories'
import BaseStack from '../../../ui/BaseStack.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { isStoryBranded, literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const template = `
	<div class="story-stack">
		<div v-for="preset in presets" :key="preset.name">
			<span class="story-label">{{ preset.label }}</span>
			<BaseStack v-bind="args" direction="row" :size-scale="preset.sizeScale">
				<div v-for="n in 3" :key="n" style="padding: 8px 16px; border: 1px solid var(--rise-border); border-radius: 8px; background: var(--rise-bg-elevated)">{{ n }}</div>
			</BaseStack>
		</div>
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['gap'] },
		docs: {
			description: {
				story: 'Размеры через `sizeScale`: промежутки меняются пропорционально (`md` — 12px при 75 и 20px при 125). Размер самих блоков задаёт их содержимое.',
			},
			source: storySource({
				template,
				imports: ['BaseStack'],
				script: `const presets = ${literal(presets)}`,
				omit: ['direction', 'sizeScale'],
			}),
		},
	},
	render: args => ({
		components: { BaseStack },
		setup: useStorySetup(args, { data: { presets } }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const gaps = [...canvasElement.querySelectorAll<HTMLElement>('.base-stack')].map(stack =>
			parseFloat(getComputedStyle(stack).columnGap),
		)
		await expect(gaps).toHaveLength(SIZE_PRESETS.length)
		for (let index = 1; index < gaps.length; index++) await expect(gaps[index]).toBeGreaterThan(gaps[index - 1])
		if (!isStoryBranded()) await expect(gaps).toEqual([12, 14, 16, 18, 20])
	},
}
