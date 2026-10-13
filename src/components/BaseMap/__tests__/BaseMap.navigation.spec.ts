import '@testing-library/jest-dom/vitest'
import BaseMap from '../ui/BaseMap.vue'
import { fitView } from '../model/fitView'
import { fakeGoogle } from './providers/fakeGoogle'
import { fakeYandex } from './providers/fakeYandex'
import { loadScript } from '@utils/dom/scriptUtils'
import type { MapCoordinates } from '../types/BaseMap.types'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'

vi.mock('@utils/dom/scriptUtils', () => ({ loadScript: vi.fn() }))

const ROUTE: MapCoordinates[] = [
	{ lat: 55.75, lng: 37.61 },
	{ lat: 55.7, lng: 37.5 },
	{ lat: 55.72, lng: 37.7 },
]

const ready = (emitted: (name: string) => unknown[] | undefined) => waitFor(() => expect(emitted('ready')).toHaveLength(1))

function mockGeolocation(getCurrentPosition: unknown) {
	Object.defineProperty(navigator, 'geolocation', { value: getCurrentPosition ? { getCurrentPosition } : undefined, configurable: true })
}

function cleanWindow(): void {
	const target = window as unknown as { ymaps3?: unknown; google?: unknown }
	delete target.ymaps3
	delete target.google
	mockGeolocation(undefined)
	vi.useRealTimers()
	vi.mocked(loadScript).mockReset()
}

describe('fitView', () => {
	const box = { width: 600, height: 400, padding: 40 }

	it('без точек — null; одна точка и совпадающие — центр на них и заданный масштаб', () => {
		expect(fitView([], box, 10)).toBeNull()
		expect(fitView([ROUTE[0]!], box, 12)).toEqual({ center: ROUTE[0], zoom: 12 })
		expect(fitView([ROUTE[0]!, ROUTE[0]!], box, 9)?.zoom).toBe(9)
	})

	it('несколько точек: центр между ними, целый масштаб, всё помещается с отступом', () => {
		const view = fitView(ROUTE, box, 10)!
		expect(view.center.lat).toBeCloseTo(55.725, 2)
		expect(view.center.lng).toBeCloseTo(37.6, 2)
		expect(Number.isInteger(view.zoom)).toBe(true)
		const scale = 256 * 2 ** view.zoom
		const widthPx = ((37.7 - 37.5) / 360) * scale
		expect(widthPx).toBeLessThanOrEqual(600 - 80)
		const bigger = fitView(ROUTE, { ...box, padding: 150 }, 10)!
		expect(bigger.zoom).toBeLessThan(view.zoom)
	})

	it('очень близкие точки не уходят за предел 17; очень далёкие — не ниже 0', () => {
		const close = fitView(
			[
				{ lat: 55, lng: 37 },
				{ lat: 55.000001, lng: 37.000001 },
			],
			box,
			10,
		)!
		expect(close.zoom).toBe(17)
		const far = fitView(
			[
				{ lat: -80, lng: -170 },
				{ lat: 80, lng: 170 },
			],
			{ width: 100, height: 100, padding: 60 },
			10,
		)!
		expect(far.zoom).toBe(0)
	})
})

describe('BaseMap: линии и многоугольники', () => {
	afterEach(cleanWindow)

	it('Яндекс: фигуры с цветом, толщиной по умолчанию и замкнутым контуром; список для диктора', async () => {
		const { maps } = fakeYandex()
		const { emitted, rerender, container } = render(BaseMap, {
			props: {
				apiKey: 'KEY',
				polylines: [
					{ id: 'route', coordinates: ROUTE, color: '#f00', width: 6, title: 'Маршрут' },
					{ id: 2, coordinates: ROUTE },
				],
				polygons: [{ id: 'zone', coordinates: ROUTE, color: 'blue' }],
			},
		})
		await ready(emitted)
		const features = maps[0].features().map(feature => feature.props)
		expect(features[0]).toEqual({
			geometry: {
				type: 'LineString',
				coordinates: [
					[37.61, 55.75],
					[37.5, 55.7],
					[37.7, 55.72],
				],
			},
			style: { stroke: [{ color: '#f00', width: 6 }] },
		})
		expect(features[1]).toMatchObject({ style: { stroke: [{ color: 'var(--rise-primary)', width: 4 }] } })
		expect(features[2]).toEqual({
			geometry: {
				type: 'Polygon',
				coordinates: [
					[
						[37.61, 55.75],
						[37.5, 55.7],
						[37.7, 55.72],
						[37.61, 55.75],
					],
				],
			},
			style: { stroke: [{ color: 'blue', width: 2 }], fill: 'blue', fillOpacity: 0.2 },
		})
		const list = screen.getByRole('list', { name: 'Линии и области на карте' })
		expect(list).toHaveTextContent('Маршрут')
		expect(list).toHaveTextContent('Линия 2')
		expect(list).toHaveTextContent('Область zone')

		await rerender({ polylines: [], polygons: [] })
		expect(maps[0].features()).toHaveLength(0)
		expect(container.querySelector('.base-map__shapes')).toBeNull()
	})

	it('токен цвета считает браузер', async () => {
		const original = window.getComputedStyle
		vi.spyOn(window, 'getComputedStyle').mockImplementation(element => {
			const style = original(element)
			return {
				...style,
				color: (element as HTMLElement).style.color.includes('var(') ? 'rgb(1, 2, 3)' : style.color,
			} as CSSStyleDeclaration
		})
		const { maps } = fakeYandex()
		const { emitted } = render(BaseMap, {
			props: { apiKey: 'KEY', polylines: [{ id: 1, coordinates: ROUTE, color: 'var(--rise-success)' }] },
		})
		await ready(emitted)
		expect(maps[0].features()[0]!.props).toMatchObject({ style: { stroke: [{ color: 'rgb(1, 2, 3)' }] } })
		vi.restoreAllMocks()
	})

	it('Google: Polyline и Polygon на карте, пересоздание и удаление', async () => {
		const google = fakeGoogle()
		google.install()
		const { emitted, rerender, unmount } = render(BaseMap, {
			props: {
				provider: 'google',
				apiKey: 'KEY',
				mapId: 'id',
				polylines: [{ id: 1, coordinates: ROUTE, color: 'red' }],
				polygons: [{ id: 2, coordinates: ROUTE, width: 5 }],
			},
		})
		await ready(emitted)
		expect(google.shapes.map(shape => shape.kind)).toEqual(['polyline', 'polygon'])
		expect(google.shapes[0]!.options).toMatchObject({ strokeColor: 'red', strokeWeight: 4, path: ROUTE })
		expect(google.shapes[1]!.options).toMatchObject({ strokeWeight: 5, paths: ROUTE, fillOpacity: 0.2 })

		await rerender({ polylines: [] })
		expect(google.shapes[0]!.setMap).toHaveBeenCalledWith(null)
		unmount()
		expect(google.shapes[1]!.setMap).toHaveBeenCalledWith(null)
	})
})

describe('BaseMap: кнопки управления', () => {
	afterEach(cleanWindow)

	it('без hasControls кнопок нет; с ним — масштаб, пределы без потери фокуса', async () => {
		const { maps } = fakeYandex()
		const { emitted, rerender } = render(BaseMap, { props: { apiKey: 'KEY', zoom: 20 } })
		await ready(emitted)
		expect(screen.queryByRole('group', { name: 'Управление картой' })).toBeNull()

		await rerender({ hasControls: true })
		const zoomIn = screen.getByRole('button', { name: 'Приблизить' })
		await fireEvent.click(zoomIn)
		expect(maps[0].setLocation).toHaveBeenLastCalledWith({ center: [37.618423, 55.751244], zoom: 21 })
		expect(emitted('update:zoom')).toEqual([[21]])
		zoomIn.focus()
		await waitFor(() => expect(zoomIn).toHaveAttribute('aria-disabled', 'true'))
		expect(zoomIn).toHaveFocus()
		await fireEvent.click(zoomIn)
		expect(emitted('update:zoom')).toHaveLength(1)

		await rerender({ zoom: 0 })
		const zoomOut = screen.getByRole('button', { name: 'Отдалить' })
		await waitFor(() => expect(zoomOut).toHaveAttribute('aria-disabled', 'true'))
		await rerender({ zoom: 5 })
		await fireEvent.click(screen.getByRole('button', { name: 'Отдалить' }))
		expect(emitted('update:zoom')).toContainEqual([4])
	})

	it('местоположение: карта переезжает на точку, событие locate; масштаб не меньше 14', async () => {
		mockGeolocation(vi.fn((success: (position: unknown) => void) => success({ coords: { latitude: 59.9, longitude: 30.3 } })))
		const { maps } = fakeYandex()
		const { emitted } = render(BaseMap, { props: { apiKey: 'KEY', hasControls: true, zoom: 8 } })
		await ready(emitted)
		await fireEvent.click(screen.getByRole('button', { name: 'Моё местоположение' }))
		expect(maps[0].setLocation).toHaveBeenLastCalledWith({ center: [30.3, 59.9], zoom: 14 })
		expect(emitted('locate')).toEqual([[{ lat: 59.9, lng: 30.3 }]])
		expect(emitted('update:center')).toEqual([[{ lat: 59.9, lng: 30.3 }]])
		expect(screen.getByRole('button', { name: 'Моё местоположение' })).not.toHaveAttribute('aria-busy', 'true')
	})

	it.each([
		[1, 'denied', 'Доступ к местоположению запрещён'],
		[2, 'unavailable', 'Не удалось определить местоположение'],
		[3, 'timeout', 'Не удалось определить местоположение'],
	])('отказ геолокации (код %i) — locate-error %s и сообщение', async (code, reason, text) => {
		mockGeolocation(vi.fn((_success: unknown, fail: (error: { code: number }) => void) => fail({ code })))
		fakeYandex()
		const { emitted } = render(BaseMap, { props: { apiKey: 'KEY', hasControls: true } })
		await ready(emitted)
		await fireEvent.click(screen.getByRole('button', { name: 'Моё местоположение' }))
		expect(emitted('locate-error')).toEqual([[reason]])
		expect(screen.getByRole('status')).toHaveTextContent(text)
		expect(emitted('locate')).toBeUndefined()
	})

	it('браузер без геолокации — unsupported; сообщение гаснет через несколько секунд', async () => {
		fakeYandex()
		const { emitted } = render(BaseMap, { props: { apiKey: 'KEY', hasControls: true } })
		await ready(emitted)
		vi.useFakeTimers()
		await fireEvent.click(screen.getByRole('button', { name: 'Моё местоположение' }))
		expect(emitted('locate-error')).toEqual([['unsupported']])
		expect(screen.getByRole('status')).toHaveTextContent('Браузер не определяет местоположение')
		await fireEvent.click(screen.getByRole('button', { name: 'Моё местоположение' }))
		vi.advanceTimersByTime(4000)
		await waitFor(() => expect(screen.getByRole('status')).toBeEmptyDOMElement())
	})
})

describe('BaseMap: вписать метки', () => {
	afterEach(cleanWindow)

	it('при показе и смене markers; одна метка — центрирование с масштабом zoom; без fitMarkers — нет', async () => {
		const { maps } = fakeYandex()
		const markers = ROUTE.map((coordinates, id) => ({ id, coordinates }))
		const { emitted, rerender } = render(BaseMap, { props: { apiKey: 'KEY', markers, fitMarkers: true, boundsPadding: 20, zoom: 13 } })
		await ready(emitted)
		const [first] = maps[0].setLocation.mock.calls[0] as [{ center: [number, number]; zoom: number }]
		expect(first.zoom).toBeGreaterThan(9)
		expect(first.zoom).not.toBe(13)
		expect(emitted('update:zoom')).toBeDefined()

		await rerender({ markers: [markers[1]] })
		expect(maps[0].setLocation).toHaveBeenLastCalledWith({ center: [37.5, 55.7], zoom: 13 })
		const calls = maps[0].setLocation.mock.calls.length
		await rerender({ fitMarkers: false, markers })
		expect(maps[0].setLocation.mock.calls.length).toBe(calls)
		await rerender({ fitMarkers: true, markers: [] })
		expect(maps[0].setLocation.mock.calls.length).toBe(calls)
	})
})
