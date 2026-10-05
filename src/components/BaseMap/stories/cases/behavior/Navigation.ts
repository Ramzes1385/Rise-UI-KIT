import BaseMap from '../../../ui/BaseMap.vue'
import type meta from '../../BaseMap.stories'
import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { CITIES, MOSCOW, liveOrDemo } from '../../shared'
import { literal, storySource, useStorySetup, withYandexMapsKey } from '@/stories/helpers'

const state = { center: MOSCOW, zoom: 10 }

const template = `
	<div class="story-stack">
		<div class="story-row">
			<BaseButton v-for="city in CITIES" :key="city.name" variant="outline" @click="(center = city.center), (zoom = city.zoom)">
				{{ city.name }}
			</BaseButton>
			<BaseButton variant="ghost" :is-disabled="zoom >= 21" @click="zoom++">Ближе</BaseButton>
			<BaseButton variant="ghost" :is-disabled="zoom <= 0" @click="zoom--">Дальше</BaseButton>
		</div>
		<BaseMap v-bind="args" v-model:center="center" v-model:zoom="zoom" />
		<p class="story-label">Центр: {{ center.lat.toFixed(3) }}, {{ center.lng.toFixed(3) }} · масштаб: {{ zoom }}</p>
	</div>
`

export const Navigation: StoryObj<typeof meta> = {
	decorators: [withYandexMapsKey],
	parameters: {
		docs: {
			description: {
				story: [
					'Карта управляется снаружи: `v-model:center` и `v-model:zoom` двусторонние — кнопки городов и масштаба меняют переменные,',
					'карта переезжает; перетаскивание и колесо мыши на карте возвращают новые центр и масштаб в те же переменные (подпись под картой).',
					'С ключом из `.env.local` — Яндекс Карты, без него — демо-поставщик без сети.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseButton', 'BaseMap'], state, script: `const CITIES = ${literal(CITIES)}` }),
			story: { inline: false, height: '480px' },
		},
		controls: { include: ['variant', 'sizeScale', 'height'] },
	},
	args: liveOrDemo.args,
	beforeEach: liveOrDemo.beforeEach,
	render: args => ({
		components: { BaseButton, BaseMap },
		setup: useStorySetup(args, { state, data: { CITIES } }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Санкт-Петербург' }))
		await waitFor(() => expect(canvas.getByText('Центр: 59.934, 30.335 · масштаб: 11')).toBeInTheDocument())
		await userEvent.click(canvas.getByRole('button', { name: 'Ближе' }))
		await waitFor(() => expect(canvas.getByText('Центр: 59.934, 30.335 · масштаб: 12')).toBeInTheDocument())
		await userEvent.click(canvas.getByRole('button', { name: 'Москва' }))
		await waitFor(() => expect(canvas.getByText('Центр: 55.751, 37.618 · масштаб: 10')).toBeInTheDocument())
	},
}
