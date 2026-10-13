import { installDemoYandex } from '../../stories/demoProvider'

const target = window as unknown as { ymaps3?: { ready: Promise<void>; YMap: unknown } }

const REAL_API = { ready: Promise.resolve(), YMap: class RealMap {} }

describe('installDemoYandex', () => {
	afterEach(() => {
		delete target.ymaps3
	})

	it('без настоящего API: ставит демо, очистка убирает его', () => {
		const cleanup = installDemoYandex()

		expect(target.ymaps3?.YMap).not.toBe(REAL_API.YMap)
		cleanup()
		expect('ymaps3' in target).toBe(false)
	})

	it('поверх настоящего API: очистка возвращает его, а не удаляет', () => {
		target.ymaps3 = REAL_API
		const cleanup = installDemoYandex({ isPending: true })

		expect(target.ymaps3).not.toBe(REAL_API)
		cleanup()
		expect(target.ymaps3).toBe(REAL_API)
	})

	it('несколько демо на одной странице: настоящий API возвращается после последней очистки в любом порядке', () => {
		target.ymaps3 = REAL_API
		const first = installDemoYandex()
		const second = installDemoYandex({ isPending: true })
		const demo = target.ymaps3

		first()
		expect(target.ymaps3).toBe(demo)
		second()
		expect(target.ymaps3).toBe(REAL_API)
	})

	it('повторный вызов одной очистки ничего не ломает', () => {
		target.ymaps3 = REAL_API
		const first = installDemoYandex()
		const second = installDemoYandex()

		first()
		first()
		expect(target.ymaps3).not.toBe(REAL_API)
		second()
		expect(target.ymaps3).toBe(REAL_API)
	})
})

interface DemoApi {
	YMap: new (element: HTMLElement, props: { location: { center: [number, number]; zoom: number } }) => DemoMapApi
	YMapDefaultSchemeLayer: new (props: { theme: string }) => DemoBaseApi
	YMapDefaultSatelliteLayer: new (props: object) => DemoBaseApi
	YMapDefaultFeaturesLayer: new (props: object) => object
	YMapFeature: new (props: object) => object
	YMapListener: new (props: object) => object
	YMapMarker: new (props: { coordinates: [number, number] }, element: HTMLElement) => object
}

interface DemoBaseApi {
	update: (props: { theme?: string; customization?: object[] }) => void
}

interface DemoMapApi {
	addChild: (child: object) => void
	removeChild: (child: object) => void
	setBehaviors: (behaviors: string[]) => void
	setLocation: (location: { center: [number, number]; zoom: number }) => void
	destroy: () => void
}

describe('демо-карта', () => {
	let cleanup: () => void
	let api: DemoApi
	let host: HTMLElement
	let map: DemoMapApi
	const onClick = vi.fn()
	const onActionEnd = vi.fn()

	const layer = (): HTMLElement => host.querySelector('.story-demo-map') as HTMLElement

	const feature = (type: 'LineString' | 'Polygon', fill?: string) =>
		new api.YMapFeature({
			geometry: {
				type,
				coordinates:
					type === 'Polygon'
						? [
								[
									[37.5, 55.7],
									[37.7, 55.7],
									[37.6, 55.8],
									[37.5, 55.7],
								],
							]
						: [
								[37.5, 55.7],
								[37.7, 55.8],
							],
			},
			style: { stroke: [{ color: 'rgb(1, 2, 3)', width: 5 }], fill, fillOpacity: fill ? 0.2 : undefined },
		})

	beforeEach(() => {
		onClick.mockClear()
		onActionEnd.mockClear()
		cleanup = installDemoYandex()
		api = target.ymaps3 as unknown as DemoApi
		host = document.createElement('div')
		document.body.append(host)
		map = new api.YMap(host, { location: { center: [37.6, 55.75], zoom: 10 } })
		map.addChild(new api.YMapListener({ onClick, onActionEnd }))
	})

	afterEach(() => {
		map.destroy()
		host.remove()
		cleanup()
	})

	it('схема: тема слоя меняет data-theme и остаётся при смене подложки', () => {
		const scheme = new api.YMapDefaultSchemeLayer({ theme: 'dark' })
		map.addChild(scheme)
		expect(layer().dataset).toMatchObject({ scheme: 'dark', layer: 'scheme' })
		expect(layer().getAttribute('data-theme')).toBe('dark')
		scheme.update({ theme: 'light' })
		expect(layer().dataset.scheme).toBe('light')
		map.removeChild(scheme)
		expect(layer().dataset.scheme).toBe('light')
		expect(layer().style.backgroundImage).toBe('')
	})

	it('подложки: спутник, гибрид и возврат к схеме', () => {
		const scheme = new api.YMapDefaultSchemeLayer({ theme: 'light' })
		const satellite = new api.YMapDefaultSatelliteLayer({})
		map.addChild(scheme)
		map.addChild(satellite)
		expect(layer().dataset.layer).toBe('hybrid')
		map.removeChild(scheme)
		expect(layer().dataset.layer).toBe('satellite')
		expect(layer().style.backgroundColor).toBe('transparent')
		map.removeChild(satellite)
		map.addChild(scheme)
		expect(layer().dataset.layer).toBe('scheme')
	})

	it('линия и полигон рисуются SVG и пересчитываются при setLocation', () => {
		const line = feature('LineString')
		const area = feature('Polygon', 'rgb(1, 2, 3)')
		map.addChild(line)
		map.addChild(area)
		const polyline = host.querySelector('polyline') as SVGElement
		const polygon = host.querySelector('polygon') as SVGElement
		expect(polyline.getAttribute('stroke')).toBe('rgb(1, 2, 3)')
		expect(polyline.getAttribute('stroke-width')).toBe('5')
		expect(polyline.getAttribute('fill')).toBe('none')
		expect(polygon.getAttribute('fill-opacity')).toBe('0.2')
		const before = polyline.getAttribute('points')
		map.setLocation({ center: [37.5, 55.7], zoom: 11 })
		expect((host.querySelector('polyline') as SVGElement).getAttribute('points')).not.toBe(before)
		map.removeChild(line)
		map.removeChild(area)
		expect(host.querySelector('polyline')).toBeNull()
	})

	it('метка пересчитывается и удаляется', () => {
		const element = document.createElement('div')
		const marker = new api.YMapMarker({ coordinates: [37.6, 55.75] }, element)
		map.addChild(marker)
		map.setLocation({ center: [37.6, 55.75], zoom: 12 })
		expect(element.style.position).toBe('absolute')
		map.removeChild(marker)
		expect(element.isConnected).toBe(false)
	})

	it('клик отдаёт координаты, добавление нейтральных слоёв ничего не ломает', () => {
		map.addChild(new api.YMapDefaultFeaturesLayer({}))
		const box = layer().getBoundingClientRect()
		layer().dispatchEvent(new MouseEvent('click', { clientX: box.left + box.width / 2, clientY: box.top + box.height / 2 }))
		expect(onClick).toHaveBeenCalledWith(null, { coordinates: [37.6, 55.75] })
	})

	it('колесо: масштаб меняется только с поведением scrollZoom', () => {
		layer().dispatchEvent(new WheelEvent('wheel', { deltaY: -100, cancelable: true }))
		expect(onActionEnd).not.toHaveBeenCalled()
		map.setBehaviors(['scrollZoom'])
		const up = new WheelEvent('wheel', { deltaY: -100, cancelable: true })
		layer().dispatchEvent(up)
		expect(up.defaultPrevented).toBe(true)
		expect(onActionEnd).toHaveBeenLastCalledWith({ location: { center: [37.6, 55.75], zoom: 11 } })
		layer().dispatchEvent(new WheelEvent('wheel', { deltaY: 100, cancelable: true }))
		expect(onActionEnd).toHaveBeenLastCalledWith({ location: { center: [37.6, 55.75], zoom: 10 } })
	})

	it('перетаскивание: двигает центр только с поведением drag, после него клик гасится', () => {
		const pointer = (type: string, init: MouseEventInit = {}) => layer().dispatchEvent(new MouseEvent(type, { button: 0, ...init }))
		pointer('pointerdown', { clientX: 0, clientY: 0 })
		pointer('pointermove', { clientX: 50, clientY: 0 })
		pointer('pointerup')
		expect(onActionEnd).not.toHaveBeenCalled()

		map.setBehaviors(['drag'])
		pointer('pointermove', { clientX: 10, clientY: 0 })
		pointer('pointerdown', { clientX: 0, clientY: 0, button: 2 })
		pointer('pointermove', { clientX: 50, clientY: 0 })
		pointer('pointerup')
		expect(onActionEnd).not.toHaveBeenCalled()

		pointer('pointerdown', { clientX: 0, clientY: 0 })
		pointer('pointermove', { clientX: 1, clientY: 1 })
		pointer('pointerup')
		expect(onActionEnd).not.toHaveBeenCalled()
		layer().dispatchEvent(new MouseEvent('click'))
		expect(onClick).toHaveBeenCalledTimes(1)

		pointer('pointerdown', { clientX: 0, clientY: 0 })
		pointer('pointermove', { clientX: 50, clientY: 20 })
		pointer('pointermove', { clientX: 60, clientY: 20 })
		pointer('pointerleave')
		expect(onActionEnd).toHaveBeenCalledTimes(1)
		expect(onActionEnd.mock.calls[0]?.[0].location.center[0]).toBeLessThan(37.6)
		layer().dispatchEvent(new MouseEvent('click'))
		expect(onClick).toHaveBeenCalledTimes(1)
		layer().dispatchEvent(new MouseEvent('click'))
		expect(onClick).toHaveBeenCalledTimes(2)
	})
})
