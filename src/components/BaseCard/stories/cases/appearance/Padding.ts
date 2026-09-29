import { expect } from 'storybook/test'
import type meta from '../../BaseCard.stories'
import BaseCard from '../../../ui/BaseCard.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots, placeholderImage } from '@/stories/helpers'

export const Padding: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Отступы `padding`: без пропа — 16px 20px из стилей; число — Y = n, X = 2n;',
					'объект `{ x, y, top, right, bottom, left }` задаёт стороны напрямую; `0` — картинка во всю ширину.',
				].join('\n'),
			},
			source: {
				code: [
					'<BaseCard title="Из стилей">…</BaseCard>',
					'<BaseCard :padding="8" title="8 → 8px 16px">…</BaseCard>',
					'<BaseCard :padding="{ x: 24, y: 12 }" title="x: 24, y: 12">…</BaseCard>',
					'<BaseCard :padding="0"><img :src="cover" alt="…" /></BaseCard>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseCard },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['default', 'title', 'subtitle']),
			cover: placeholderImage({ width: 480, height: 240, hue: 200 }),
		}),
		template: `
			<div class="story-grid" style="--story-grid-min: 220px; align-items: start;">
				<BaseCard v-bind="props" title="Из стилей">16px 20px</BaseCard>
				<BaseCard v-bind="props" :padding="8" title="8 → 8px 16px">Компактная карточка</BaseCard>
				<BaseCard v-bind="props" :padding="{ x: 24, y: 12 }" title="x: 24, y: 12">Отступы по осям</BaseCard>
				<BaseCard v-bind="props" :padding="0">
					<img :src="cover" alt="Горы в тумане" style="display: block; width: 100%;" />
				</BaseCard>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const [themed, numeric, , edgeToEdge] = canvasElement.querySelectorAll<HTMLElement>('.base-card')
		await expect(themed.style.getPropertyValue('--card-pad-top')).toBe('')
		await expect(numeric.style.getPropertyValue('--card-pad-left')).toBe('16px')
		await expect(getComputedStyle(edgeToEdge.querySelector('.base-card__body') as HTMLElement).padding).toBe('0px')
	},
}
