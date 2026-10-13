import BaseMap from '../../../ui/BaseMap.vue'
import type meta from '../../BaseMap.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'
import { MOSCOW, OFFICES, REGION_MARKERS, liveOrDemo } from '../../shared'
import { literal, storySource, useStorySetup, withYandexMapsKey } from '@/stories/helpers'

const SETS = { Москва: OFFICES, Область: REGION_MARKERS, 'Одна метка': OFFICES.slice(0, 1) }

const state = { center: MOSCOW, zoom: 12, name: 'Москва' }

const template = `
	<div class="story-stack">
		<div class="story-row">
			<BaseButton v-for="(_, title) in SETS" :key="title" variant="outline" @click="name = title">{{ title }}</BaseButton>
		</div>
		<BaseMap v-bind="args" v-model:center="center" v-model:zoom="zoom" fit-markers :markers="SETS[name]" />
		<p class="story-label">Метки: {{ name }} · масштаб: {{ zoom }}</p>
	</div>
`

const zoomOf = (text: string | null): number => Number(/масштаб: (\d+)/.exec(text ?? '')?.[1])

export const FitMarkers: StoryObj<typeof meta> = {
	decorators: [withYandexMapsKey],
	parameters: {
		docs: {
			description: {
				story: [
					'`fitMarkers` вписывает все метки в карту при показе и при каждой смене `markers`: центр и масштаб считаются сами и приходят в `v-model:center` и `v-model:zoom`.',
					'`boundsPadding` — отступ от края карты до крайних меток в px (по умолчанию 40; попробуйте 120 в Controls). Одна метка — центрирование на ней с текущим масштабом (до первого показа — `zoom`).',
					'Кнопки подменяют массив `markers`: «Москва» — четыре близкие метки, «Область» — добавляет города за пределами Москвы, масштаб отдаляется.',
					'С ключом из `.env.local` — Яндекс Карты, без него — демо-поставщик без сети.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseButton', 'BaseMap'],
				state,
				script: `const SETS = ${literal(SETS)}`,
			}),
			story: { inline: false, height: '520px' },
		},
		controls: { include: ['variant', 'sizeScale', 'height', 'zoom', 'boundsPadding'] },
	},
	args: { ...liveOrDemo.args, boundsPadding: 40, zoom: 12 },
	beforeEach: liveOrDemo.beforeEach,
	render: args => ({
		components: { BaseButton, BaseMap },
		setup: useStorySetup(args, { state, data: { SETS } }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const map = canvas.getByRole('region', { name: 'Карта' })
		await waitFor(() => expect(within(map).getByRole('button', { name: 'Арбат' })).toBeInTheDocument())
		const readout = (): HTMLElement => canvas.getByText(/^Метки: /)
		await waitFor(() => expect(zoomOf(readout().textContent)).toBeGreaterThan(0))
		const city = zoomOf(readout().textContent)

		await userEvent.click(canvas.getByRole('button', { name: 'Область' }))
		await waitFor(() => expect(readout()).toHaveTextContent('Метки: Область'))
		await waitFor(() => expect(zoomOf(readout().textContent)).toBeLessThan(city))
		const region = zoomOf(readout().textContent)
		await expect(within(map).getByRole('button', { name: 'Тула' })).toBeInTheDocument()

		await userEvent.click(canvas.getByRole('button', { name: 'Одна метка' }))
		await waitFor(() => expect(readout()).toHaveTextContent('Метки: Одна метка'))
		await expect(zoomOf(readout().textContent)).toBe(region)
		await expect(within(map).queryByRole('button', { name: 'Тула' })).toBeNull()
	},
}
