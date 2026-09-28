import { expect } from 'storybook/test'
import type meta from '../BaseCard.stories'
import BaseCard from '../../ui/BaseCard.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { SIZE_PRESETS, useArgsWithoutSlots, sizeLabel } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant'] },
		docs: {
			description: { story: 'Размеры через `sizeScale`: отступы, текст и радиус масштабируются вместе.' },
			source: {
				code: SIZE_PRESETS.map(preset => `<BaseCard :size-scale="${preset.sizeScale}" title="${preset.name}">…</BaseCard>`).join(
					'\n',
				),
			},
		},
	},
	render: args => ({
		components: { BaseCard },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'title', 'subtitle']), presets: SIZE_PRESETS, sizeLabel }),
		template: `
			<div class="story-grid" style="--story-grid-min: 220px; align-items: start;">
				<BaseCard v-for="preset in presets" :key="preset.name" v-bind="props" :size-scale="preset.sizeScale" :title="sizeLabel(preset)" subtitle="Обновлён 15 мая">
					Выручка выросла на 12%.
				</BaseCard>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const title = canvas.getByRole('heading', { name: 'xl · 125' })
		await expect(getComputedStyle(title).fontSize).toBe('20px')
		await expect(getComputedStyle(title.closest('.base-card__header') as HTMLElement).padding).toBe('20px 25px')
	},
}
