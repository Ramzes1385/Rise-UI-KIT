import { expect } from 'storybook/test'
import type meta from '../../BaseCard.stories'
import BaseCard from '../../../ui/BaseCard.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const template = `
	<div class="story-grid" style="--story-grid-min: 220px; align-items: start;">
		<BaseCard v-for="preset in presets" :key="preset.name" v-bind="args" :size-scale="preset.sizeScale" :title="preset.label" subtitle="Обновлён 15 мая">
			Выручка выросла на 12%.
		</BaseCard>
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant'] },
		docs: {
			description: { story: 'Размеры через `sizeScale`: отступы, текст и радиус масштабируются вместе.' },
			source: storySource({
				template,
				imports: ['BaseCard'],
				script: `const presets = ${literal(presets)}`,
				omit: ['default', 'title', 'subtitle'],
			}),
		},
	},
	render: args => ({
		components: { BaseCard },
		setup: useStorySetup(args, { data: { presets }, slots: ['default', 'title', 'subtitle'] }),
		template,
	}),
	play: async ({ canvas }) => {
		const title = canvas.getByRole('heading', { name: 'xl · 125' })
		await expect(getComputedStyle(title).fontSize).toBe('20px')
		await expect(getComputedStyle(title.closest('.base-card__header') as HTMLElement).padding).toBe('20px 25px')
	},
}
