import { ref } from 'vue'
import BaseMap from '../../../ui/BaseMap.vue'
import type meta from '../../BaseMap.stories'
import { BaseButton } from '@components/BaseButton'
import { isLiveMap, liveOrDemo } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, fireEvent, waitFor } from 'storybook/test'
import type { MapCoordinates, MapMarker } from '../../../types/BaseMap.types'
import { storySource, useStorySetup, withYandexMapsKey } from '@/stories/helpers'

const template = `
	<div class="story-stack">
		<BaseMap v-bind="args" :markers="points" @click="addPoint" @marker-click="removePoint" />
		<div class="story-row">
			<span class="story-label">{{ points.length ? \`Точек: \${points.length}\` : 'Клик по карте ставит метку, клик по метке убирает её' }}</span>
			<BaseButton variant="outline" :is-disabled="!points.length" @click="points = []">Очистить</BaseButton>
		</div>
	</div>
`

const script = `
const points = ref<MapMarker[]>([])

function addPoint({ lat, lng }: MapCoordinates): void {
	const id = points.value.length + 1
	points.value = [...points.value, { id, coordinates: { lat, lng }, title: \`Точка \${id}: \${lat.toFixed(4)}, \${lng.toFixed(4)}\` }]
}

function removePoint(marker: MapMarker): void {
	points.value = points.value.filter(point => point.id !== marker.id)
}
`

export const ClickToAdd: StoryObj<typeof meta> = {
	decorators: [withYandexMapsKey],
	parameters: {
		docs: {
			description: {
				story: [
					'События карты: `click` отдаёт координаты точки — пример ставит там метку с подписью, `marker-click` отдаёт метку — пример убирает её.',
					'Метки — обычный массив `markers`: карта следит за ним и перерисовывает значки.',
					'С ключом из `.env.local` — Яндекс Карты, без него — демо-поставщик без сети.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseButton', 'BaseMap', 'type MapCoordinates', 'type MapMarker'],
				vue: ['ref'],
				script,
			}),
			story: { inline: false, height: '440px' },
		},
		controls: { include: ['variant', 'sizeScale', 'height', 'zoom'] },
	},
	args: { ...liveOrDemo.args, zoom: 12 },
	beforeEach: liveOrDemo.beforeEach,
	render: args => ({
		components: { BaseButton, BaseMap },
		setup: useStorySetup(args, {
			setup: () => {
				const points = ref<MapMarker[]>([])
				const addPoint = ({ lat, lng }: MapCoordinates): void => {
					const id = points.value.length + 1
					points.value = [
						...points.value,
						{ id, coordinates: { lat, lng }, title: `Точка ${id}: ${lat.toFixed(4)}, ${lng.toFixed(4)}` },
					]
				}
				const removePoint = (marker: MapMarker): void => {
					points.value = points.value.filter(point => point.id !== marker.id)
				}
				return { points, addPoint, removePoint }
			},
		}),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		const map = canvas.getByRole('region', { name: 'Карта' })
		await waitFor(() => expect(map).not.toHaveAttribute('aria-busy'))
		await expect(canvas.getByRole('button', { name: 'Очистить' })).toBeDisabled()
		if (isLiveMap) return
		const layer = canvasElement.querySelector('.story-demo-map') as HTMLElement
		const box = layer.getBoundingClientRect()
		await fireEvent.click(layer, { clientX: box.left + box.width / 2 + 40, clientY: box.top + box.height / 2 })
		const point = await waitFor(() => canvas.getByRole('button', { name: /^Точка 1: 55\.\d{4}, 37\.\d{4}$/ }))
		await expect(canvas.getByText('Точек: 1')).toBeInTheDocument()
		await userEvent.click(point)
		await expect(canvas.queryByRole('button', { name: /^Точка 1/ })).toBeNull()
		await fireEvent.click(layer, { clientX: box.left + box.width / 2 - 40, clientY: box.top + box.height / 2 })
		await waitFor(() => expect(canvas.getByText('Точек: 1')).toBeInTheDocument())
		await userEvent.click(canvas.getByRole('button', { name: 'Очистить' }))
		await expect(canvas.queryByRole('button', { name: /^Точка/ })).toBeNull()
	},
}
