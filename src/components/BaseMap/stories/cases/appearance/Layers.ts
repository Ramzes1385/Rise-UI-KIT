import BaseMap from '../../../ui/BaseMap.vue'
import type meta from '../../BaseMap.stories'
import { OFFICES, liveOrDemo } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'
import { MAP_LAYERS } from '../../../types/BaseMap.types'
import { literal, storySource, useStorySetup, withYandexMapsKey } from '@/stories/helpers'

const markers = OFFICES.slice(0, 2)

const template = `
	<div class="story-grid" style="--story-grid-min: 260px">
		<BaseMap v-for="layer in MAP_LAYERS" :key="layer" v-bind="args" :layer="layer" :markers="markers" :aria-label="layer" />
	</div>
`

export const Layers: StoryObj<typeof meta> = {
	decorators: [withYandexMapsKey],
	parameters: {
		docs: {
			description: {
				story: [
					'`layer` выбирает подложку: `scheme` — схема, `satellite` — спутниковый снимок, `hybrid` — снимок с подписями схемы.',
					'Подложку можно менять на лету: карта не пересоздаётся, метки и центр остаются. У Яндекса `hybrid` оставляет поверх снимка только подписи схемы.',
					'С ключом из `.env.local` — Яндекс Карты, без него — демо-поставщик без сети (снимок изображён градиентом).',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseMap', 'MAP_LAYERS'], script: `const markers = ${literal(markers)}` }),
			story: { inline: false, height: '320px' },
		},
		controls: { include: ['sizeScale', 'height', 'zoom'] },
	},
	args: { ...liveOrDemo.args, height: '220px', zoom: 12 },
	beforeEach: liveOrDemo.beforeEach,
	render: args => ({
		components: { BaseMap },
		setup: useStorySetup(args, { data: { MAP_LAYERS, markers } }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		for (const layer of MAP_LAYERS) {
			const region = canvas.getByRole('region', { name: layer })
			await waitFor(() => expect(within(region).getByRole('button', { name: 'Арбат' })).toBeInTheDocument())
		}
		await userEvent.tab()
		await expect(within(canvas.getByRole('region', { name: 'scheme' })).getByRole('button', { name: 'Красная площадь' })).toHaveFocus()
		if (canvasElement.querySelector('.story-demo-map') === null) return
		for (const layer of MAP_LAYERS) {
			const demo = canvas.getByRole('region', { name: layer }).querySelector('.story-demo-map') as HTMLElement
			await waitFor(() => expect(demo.dataset.layer).toBe(layer))
		}
	},
}
