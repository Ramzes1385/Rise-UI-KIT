import '@testing-library/jest-dom/vitest'
import BaseMap from '../ui/BaseMap.vue'
import { fakeGoogle } from './providers/fakeGoogle'
import { fakeYandex } from './providers/fakeYandex'
import { loadScript } from '@utils/dom/scriptUtils'
import type { MapMarker } from '../types/BaseMap.types'
import { clusterMarkers } from '../model/clusterMarkers'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'

vi.mock('@utils/dom/scriptUtils', () => ({ loadScript: vi.fn() }))

const ready = (emitted: (name: string) => unknown[] | undefined) => waitFor(() => expect(emitted('ready')).toHaveLength(1))

const NEAR: MapMarker[] = [
	{ id: 'a', coordinates: { lat: 55.75, lng: 37.61 }, title: 'А' },
	{ id: 'b', coordinates: { lat: 55.7501, lng: 37.6101 }, title: 'Б' },
	{ id: 'c', coordinates: { lat: 55.7502, lng: 37.6102 }, title: 'В' },
	{ id: 'far', coordinates: { lat: 59.93, lng: 30.33 }, title: 'Питер' },
]

function cleanWindow(): void {
	const target = window as unknown as { ymaps3?: unknown; google?: unknown }
	delete target.ymaps3
	delete target.google
	vi.useRealTimers()
	vi.mocked(loadScript).mockReset()
}

describe('clusterMarkers', () => {
	it('близкие метки собираются в группу с центром посередине, дальние остаются', () => {
		const items = clusterMarkers(NEAR, 10)
		expect(items).toHaveLength(2)
		const group = items.find(item => item.count)!
		expect(group.count).toBe(3)
		expect(group.members).toHaveLength(3)
		expect(group.title).toBe('Группа меток, всего 3')
		expect(group.coordinates.lat).toBeCloseTo(55.7501, 4)
		expect(items.find(item => item.id === 'far')).toBe(NEAR[3])
	})

	it('на большом масштабе метки не группируются', () => {
		expect(clusterMarkers(NEAR, 18)).toHaveLength(4)
		expect(clusterMarkers(NEAR, 17).length).toBeLessThanOrEqual(4)
	})
})

describe('BaseMap: кластеры', () => {
	afterEach(cleanWindow)

	it('группа-кнопка с числом приближает карту к своим меткам, marker-click не вызывается', async () => {
		const { maps } = fakeYandex()
		const { emitted, rerender } = render(BaseMap, { props: { apiKey: 'KEY', markers: NEAR, isClustered: true, zoom: 10 } })
		await ready(emitted)
		expect(maps[0].markers()).toHaveLength(2)
		const group = screen.getByRole('button', { name: 'Группа меток, всего 3' })
		expect(group).toHaveClass('base-map__marker--cluster')
		expect(group).toHaveTextContent('3')

		await fireEvent.click(group)
		expect(emitted('marker-click')).toBeUndefined()
		const [location] = maps[0].setLocation.mock.calls.at(-1) as [{ zoom: number }]
		expect(location.zoom).toBeGreaterThan(10)
		expect(emitted('update:zoom')).toBeDefined()

		await rerender({ isClustered: false })
		expect(maps[0].markers()).toHaveLength(4)
		expect(screen.queryByRole('button', { name: /Группа/ })).toBeNull()
	})

	it('с приближением группа распадается; слот marker не рисуется в группе', async () => {
		const { maps } = fakeYandex()
		const { emitted } = render(BaseMap, {
			props: { apiKey: 'KEY', markers: NEAR, isClustered: true, zoom: 10 },
			slots: { marker: () => 'м' },
		})
		await ready(emitted)
		expect(screen.getByRole('button', { name: 'Группа меток, всего 3' })).not.toHaveTextContent('м')
		expect(screen.getByRole('button', { name: 'Питер' })).toHaveTextContent('м')
		maps[0].listener().onActionEnd({ location: { center: [37.61, 55.75], zoom: 18 } })
		await waitFor(() => expect(maps[0].markers()).toHaveLength(4))
		expect(screen.queryByRole('button', { name: /Группа/ })).toBeNull()
	})

	it('Google: те же группы', async () => {
		const google = fakeGoogle()
		google.install()
		const { emitted } = render(BaseMap, {
			props: { provider: 'google', apiKey: 'KEY', mapId: 'id', markers: NEAR, isClustered: true, zoom: 10 },
		})
		await ready(emitted)
		expect(google.markers).toHaveLength(2)
		await fireEvent.click(screen.getByRole('button', { name: 'Группа меток, всего 3' }))
		expect(google.map.setZoom).toHaveBeenCalled()
	})
})

describe('BaseMap: подложка и жесты', () => {
	afterEach(cleanWindow)

	it('Яндекс: спутник заменяет схему, гибрид оставляет оба слоя с подписями, обратно — схема', async () => {
		const { maps } = fakeYandex()
		const { emitted, rerender } = render(BaseMap, { props: { apiKey: 'KEY' } })
		await ready(emitted)
		const kinds = () => maps[0].layers().map(layer => layer.kind)
		expect(kinds()).toEqual(['scheme'])
		const layer = maps[0].schemeLayer()

		await rerender({ layer: 'satellite' })
		expect(kinds()).toEqual(['satellite'])
		await rerender({ layer: 'hybrid' })
		expect(kinds().sort()).toEqual(['satellite', 'scheme'])
		expect(layer.update).toHaveBeenLastCalledWith({ theme: 'light', customization: expect.any(Array) })
		expect((layer.update.mock.lastCall![0] as { customization: unknown[] }).customization).toHaveLength(1)
		await rerender({ layer: 'scheme' })
		expect(kinds()).toEqual(['scheme'])
		expect(layer.update).toHaveBeenLastCalledWith({ theme: 'light', customization: [] })
	})

	it('Яндекс без слоя спутника в API остаётся на схеме', async () => {
		const { maps } = fakeYandex(Promise.resolve(), false)
		const { emitted, rerender } = render(BaseMap, { props: { apiKey: 'KEY', layer: 'satellite' } })
		await ready(emitted)
		await rerender({ layer: 'hybrid' })
		expect(maps[0].layers().map(layer => layer.kind)).toEqual(['scheme'])
	})

	it('Google: mapTypeId при создании и на лету', async () => {
		const google = fakeGoogle()
		google.install()
		const { emitted, rerender } = render(BaseMap, {
			props: { provider: 'google', apiKey: 'KEY', mapId: 'id', layer: 'hybrid' },
		})
		await ready(emitted)
		expect(google.api.Map.mock.calls[0][1]).toMatchObject({
			mapTypeId: 'hybrid',
			gestureHandling: 'greedy',
			draggable: true,
			scrollwheel: true,
		})
		await rerender({ layer: 'scheme' })
		expect(google.map.setMapTypeId).toHaveBeenLastCalledWith('roadmap')
		await rerender({ layer: 'satellite' })
		expect(google.map.setMapTypeId).toHaveBeenLastCalledWith('satellite')
	})

	it('жесты: поведение Яндекса и опции Google', async () => {
		const { maps } = fakeYandex()
		const { emitted, rerender } = render(BaseMap, { props: { apiKey: 'KEY' } })
		await ready(emitted)
		expect(maps[0].setBehaviors.mock.lastCall![0]).toEqual(expect.arrayContaining(['drag', 'scrollZoom']))
		await rerender({ isDraggable: false, isScrollZoom: false })
		const behaviors = maps[0].setBehaviors.mock.lastCall![0] as string[]
		expect(behaviors).not.toContain('drag')
		expect(behaviors).not.toContain('scrollZoom')
		expect(behaviors).toContain('pinchZoom')

		const google = fakeGoogle()
		google.install()
		const second = render(BaseMap, { props: { provider: 'google', apiKey: 'G', mapId: 'id', isDraggable: false, isScrollZoom: false } })
		await ready(second.emitted)
		expect(google.api.Map.mock.calls[0][1]).toMatchObject({ draggable: false, scrollwheel: false })
		await second.rerender({ isDraggable: true })
		expect(google.map.setOptions).toHaveBeenLastCalledWith({ draggable: true, scrollwheel: false })
	})

	it('колесо выключено: без Ctrl — подсказка, с Ctrl — масштаб и без прокрутки страницы; включено — ничего', async () => {
		const { maps } = fakeYandex()
		const { emitted, rerender, container } = render(BaseMap, { props: { apiKey: 'KEY', zoom: 10, isScrollZoom: false } })
		await ready(emitted)
		const root = container.querySelector('.base-map') as HTMLElement
		await fireEvent.wheel(root, { deltaY: 100 })
		expect(screen.getByRole('status')).toHaveTextContent('Чтобы изменить масштаб, прокручивайте колесо мыши с зажатым Ctrl')
		expect(emitted('update:zoom')).toBeUndefined()

		const wheel = new WheelEvent('wheel', { deltaY: -100, ctrlKey: true, cancelable: true, bubbles: true })
		root.dispatchEvent(wheel)
		expect(wheel.defaultPrevented).toBe(true)
		await waitFor(() => expect(emitted('update:zoom')).toEqual([[11]]))
		expect(maps[0].setLocation).toHaveBeenCalled()

		await rerender({ isScrollZoom: true, hasControls: false })
		await fireEvent.wheel(root, { deltaY: 100 })
		expect(screen.queryByRole('status')).toBeNull()
	})
})

describe('BaseMap: статичная картинка', () => {
	afterEach(cleanWindow)

	it('видна, пока карта грузится, и убирается, когда карта готова; заглушки нет', async () => {
		let resolve!: () => void
		fakeYandex(new Promise<void>(done => (resolve = done)))
		const { container, emitted } = render(BaseMap, {
			props: { apiKey: 'KEY', staticPreview: '/preview.png', ui: { preview: 'u-preview' } },
		})
		await waitFor(() => expect(container.querySelector('img')).toBeInTheDocument())
		const image = container.querySelector('img')!
		expect(image).toHaveAttribute('src', '/preview.png')
		expect(image).toHaveAttribute('alt', '')
		expect(image).toHaveClass('base-map__preview', 'u-preview')
		expect(container.querySelector('.base-map__placeholder')).toBeNull()

		resolve()
		await ready(emitted)
		await waitFor(() => expect(container.querySelector('img')).toBeNull())
	})

	it('без ключа — обычная заглушка, не картинка; ошибка — заглушка ошибки', async () => {
		const first = render(BaseMap, { props: { staticPreview: '/preview.png' } })
		expect(first.container.querySelector('img')).toBeNull()
		expect(first.container).toHaveTextContent('Нужен ключ API')
		first.unmount()

		vi.mocked(loadScript).mockRejectedValue(new Error('сеть'))
		const second = render(BaseMap, { props: { apiKey: 'KEY', staticPreview: '/preview.png' } })
		await waitFor(() => expect(second.emitted('error')).toHaveLength(1))
		expect(second.container.querySelector('img')).toBeNull()
		expect(second.container).toHaveTextContent('Карта не загрузилась')
	})
})
