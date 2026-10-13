import BaseMap from '../../../../ui/BaseMap.vue'
import type meta from '../../../BaseMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { MOSCOW, OFFICES, liveOrDemo } from '../../../shared'
import { expect, spyOn, waitFor, within } from 'storybook/test'
import type { MapCoordinates } from '../../../../types/BaseMap.types'
import { literal, storySource, tabTo, useStorySetup, withYandexMapsKey } from '@/stories/helpers'

const state = { center: MOSCOW, zoom: 11, located: 'нет', failure: 'нет' }

const markers = OFFICES.slice(0, 2)

const template = `
	<div class="story-stack">
		<BaseMap
			v-bind="args"
			v-model:center="center"
			v-model:zoom="zoom"
			has-controls
			:markers="markers"
			@locate="point => (located = \`\${point.lat.toFixed(2)}, \${point.lng.toFixed(2)}\`)"
			@locate-error="reason => (failure = reason)" />
		<p class="story-label">Масштаб: {{ zoom }} · найдено: {{ located }} · ошибка: {{ failure }}</p>
	</div>
`

const PETERSBURG: MapCoordinates = { lat: 59.9343, lng: 30.3351 }

const label = (zoom: number, located: string, failure: string): string => `Масштаб: ${zoom} · найдено: ${located} · ошибка: ${failure}`

export const Controls: StoryObj<typeof meta> = {
	decorators: [withYandexMapsKey],
	parameters: {
		docs: {
			description: {
				story: [
					'`hasControls` добавляет поверх карты кнопки «Приблизить», «Отдалить» и «Моё местоположение» — группа с именем «Управление картой».',
					'Крайние масштабы не отключают кнопку нативно, а ставят `aria-disabled`: фокус остаётся на ней. «Моё местоположение» спрашивает `navigator.geolocation`:',
					'успех перемещает карту (масштаб не меньше 14) и вызывает `locate` с координатами, отказ вызывает `locate-error` (`denied`, `unavailable`, `timeout`, `unsupported`)',
					'и пишет причину в область `role="status"` под кнопками. В примере геолокация подменена шпионом, ответ браузера не требуется.',
					'С ключом из `.env.local` — Яндекс Карты, без него — демо-поставщик без сети.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseMap'], state, script: `const markers = ${literal(markers)}` }),
			story: { inline: false, height: '480px' },
		},
		controls: { include: ['variant', 'sizeScale', 'height'] },
	},
	args: liveOrDemo.args,
	beforeEach: liveOrDemo.beforeEach,
	render: args => ({
		components: { BaseMap },
		setup: useStorySetup(args, { state, data: { markers } }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const map = canvas.getByRole('region', { name: 'Карта' })
		const group = await waitFor(() => within(map).getByRole('group', { name: 'Управление картой' }))
		const zoomIn = within(group).getByRole('button', { name: 'Приблизить' })
		const locate = within(group).getByRole('button', { name: 'Моё местоположение' })
		await expect(within(group).getByRole('button', { name: 'Отдалить' })).toBeInTheDocument()

		await tabTo(zoomIn, userEvent)
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(canvas.getByText(label(12, 'нет', 'нет'))).toBeInTheDocument())
		await userEvent.click(within(group).getByRole('button', { name: 'Отдалить' }))
		await waitFor(() => expect(canvas.getByText(label(11, 'нет', 'нет'))).toBeInTheDocument())

		const geolocation = spyOn(navigator.geolocation, 'getCurrentPosition')
		geolocation.mockImplementationOnce(success =>
			success({ coords: { latitude: PETERSBURG.lat, longitude: PETERSBURG.lng } } as GeolocationPosition),
		)
		await userEvent.click(locate)
		await waitFor(() => expect(canvas.getByText(label(14, '59.93, 30.34', 'нет'))).toBeInTheDocument())

		geolocation.mockImplementationOnce((_success, fail) => fail?.({ code: 1 } as GeolocationPositionError))
		await userEvent.click(locate)
		await waitFor(() => expect(canvas.getByText(label(14, '59.93, 30.34', 'denied'))).toBeInTheDocument())
		await expect(within(map).getByRole('status')).toHaveTextContent('Доступ к местоположению запрещён')
		geolocation.mockRestore()
	},
}
