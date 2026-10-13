import BaseMap from '../../../../ui/BaseMap.vue'
import type meta from '../../../BaseMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, fireEvent, waitFor, within } from 'storybook/test'
import { MOSCOW, OFFICES, isLiveMap, liveOrDemo } from '../../../shared'
import { literal, storySource, useStorySetup, withYandexMapsKey } from '@/stories/helpers'

const state = { freeCenter: MOSCOW, freeZoom: 12, lockedCenter: MOSCOW, lockedZoom: 12 }

const markers = OFFICES.slice(0, 2)

const template = `
	<div class="story-grid" style="--story-grid-min: 300px">
		<div class="story-stack">
			<BaseMap v-bind="args" v-model:center="freeCenter" v-model:zoom="freeZoom" :markers="markers" aria-label="Свободная карта" />
			<p class="story-label">Свободная: масштаб {{ freeZoom }}, центр {{ freeCenter.lng.toFixed(3) }}</p>
		</div>
		<div class="story-stack">
			<BaseMap
				v-bind="args"
				v-model:center="lockedCenter"
				v-model:zoom="lockedZoom"
				:is-draggable="false"
				:is-scroll-zoom="false"
				:markers="markers"
				aria-label="Закреплённая карта" />
			<p class="story-label">Закреплённая: масштаб {{ lockedZoom }}, центр {{ lockedCenter.lng.toFixed(3) }}</p>
		</div>
	</div>
`

const HINT = 'Чтобы изменить масштаб, прокручивайте колесо мыши с зажатым Ctrl'

const layerOf = (region: HTMLElement): HTMLElement => region.querySelector('.story-demo-map') as HTMLElement

export const Gestures: StoryObj<typeof meta> = {
	decorators: [withYandexMapsKey],
	parameters: {
		docs: {
			description: {
				story: [
					'`isDraggable="false"` оставляет карту на месте: перетаскивание и жесты не двигают её, масштаб кнопками и колесом сохраняется.',
					'`isScrollZoom="false"` отдаёт колесо странице: прокрутка лендинга не «залипает» на карте, а масштаб меняется колесом с зажатым Ctrl (⌘ на Mac).',
					'Колесо без Ctrl показывает подсказку в области `role="status"`. Слева — свободная карта, справа — закреплённая. Метки при этом остаются доступными с клавиатуры.',
					'С ключом из `.env.local` — Яндекс Карты, без него — демо-поставщик без сети.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseMap'], state, script: `const markers = ${literal(markers)}` }),
			story: { inline: false, height: '420px' },
		},
		controls: { include: ['variant', 'sizeScale', 'height'] },
	},
	args: { ...liveOrDemo.args, height: '260px' },
	beforeEach: liveOrDemo.beforeEach,
	render: args => ({
		components: { BaseMap },
		setup: useStorySetup(args, { state, data: { markers } }),
		template,
	}),
	play: async ({ canvas }) => {
		const free = canvas.getByRole('region', { name: 'Свободная карта' })
		const locked = canvas.getByRole('region', { name: 'Закреплённая карта' })
		await waitFor(() => expect(within(locked).getByRole('button', { name: 'Арбат' })).toBeInTheDocument())
		await waitFor(() => expect(within(free).getByRole('button', { name: 'Арбат' })).toBeInTheDocument())
		await waitFor(() => expect(free).not.toHaveAttribute('aria-busy'))
		await waitFor(() => expect(locked).not.toHaveAttribute('aria-busy'))
		await waitFor(() => expect(within(free).queryByRole('status')).toBeNull())
		await waitFor(() => expect(within(locked).getByRole('status')).toBeEmptyDOMElement())
		if (isLiveMap) return

		const lockedLayer = layerOf(locked)
		await fireEvent.wheel(lockedLayer, { deltaY: -100 })
		await expect(within(locked).getByRole('status')).toHaveTextContent(HINT)
		await expect(canvas.getByText(/^Закреплённая: масштаб 12/)).toBeInTheDocument()
		await fireEvent.wheel(lockedLayer, { deltaY: -100, ctrlKey: true })
		await waitFor(() => expect(canvas.getByText(/^Закреплённая: масштаб 13/)).toBeInTheDocument())

		const box = lockedLayer.getBoundingClientRect()
		const start = { clientX: box.left + 60, clientY: box.top + 60 }
		await fireEvent.pointerDown(lockedLayer, start)
		await fireEvent.pointerMove(lockedLayer, { clientX: start.clientX + 80, clientY: start.clientY })
		await fireEvent.pointerUp(lockedLayer)
		await expect(canvas.getByText(/^Закреплённая: .* центр 37\.618$/)).toBeInTheDocument()

		const freeLayer = layerOf(free)
		const freeBox = freeLayer.getBoundingClientRect()
		await fireEvent.pointerDown(freeLayer, { clientX: freeBox.left + 60, clientY: freeBox.top + 60 })
		await fireEvent.pointerMove(freeLayer, { clientX: freeBox.left + 140, clientY: freeBox.top + 60 })
		await fireEvent.pointerUp(freeLayer)
		await waitFor(() => expect(canvas.queryByText(/^Свободная: .* центр 37\.618$/)).toBeNull())
		await fireEvent.wheel(freeLayer, { deltaY: -100 })
		await waitFor(() => expect(canvas.getByText(/^Свободная: масштаб 13/)).toBeInTheDocument())
	},
}
