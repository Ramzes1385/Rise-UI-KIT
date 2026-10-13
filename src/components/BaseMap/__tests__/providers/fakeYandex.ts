import { vi } from 'vitest'

type Point = [number, number]

interface FakeYandexMap {
	element: HTMLElement
	location: { center: Point; zoom: number }
	children: object[]
	setLocation: ReturnType<typeof vi.fn>
	setBehaviors: ReturnType<typeof vi.fn>
	destroy: ReturnType<typeof vi.fn>
	listener: () => {
		onActionEnd: (event: { location: { center: Point; zoom: number } }) => void
		onClick: (object: unknown, event: { coordinates: Point }) => void
	}
	layers: () => { kind: string }[]
	features: () => { props: Record<string, unknown> }[]
	schemeLayer: () => { props: { theme?: string }; update: ReturnType<typeof vi.fn> }
	markers: () => { props: { coordinates: Point }; element: HTMLElement }[]
}

class Child {
	props: Record<string, unknown>
	element?: HTMLElement
	constructor(props: Record<string, unknown>, element?: HTMLElement) {
		this.props = props
		this.element = element
	}
}

class YMapDefaultSchemeLayer extends Child {
	update = vi.fn()
}

class YMapDefaultSatelliteLayer extends Child {}

class YMapListener extends Child {}

class YMapMarker extends Child {}

class YMapFeature extends Child {}

function createMap(element: HTMLElement, location: { center: Point; zoom: number }): FakeYandexMap {
	const map: FakeYandexMap = {
		element,
		location,
		children: [],
		setLocation: vi.fn(),
		setBehaviors: vi.fn(),
		destroy: vi.fn(),
		listener: () => (map.children.find(child => child instanceof YMapListener) as Child).props as never,
		layers: () =>
			map.children
				.filter(child => child instanceof YMapDefaultSchemeLayer || child instanceof YMapDefaultSatelliteLayer)
				.map(child => ({ kind: child instanceof YMapDefaultSatelliteLayer ? 'satellite' : 'scheme' })),
		features: () => map.children.filter(child => child instanceof YMapFeature) as never,
		schemeLayer: () => map.children.find(child => child instanceof YMapDefaultSchemeLayer) as never,
		markers: () => map.children.filter(child => child instanceof YMapMarker) as never,
	}
	return map
}

function mapApi(map: FakeYandexMap) {
	return {
		addChild: (child: Child) => {
			map.children.push(child)
			if (child.element) map.element.append(child.element)
		},
		removeChild: (child: Child) => {
			map.children = map.children.filter(item => item !== child)
			child.element?.remove()
		},
		setLocation: map.setLocation,
		setBehaviors: map.setBehaviors,
		destroy: map.destroy,
	}
}

export function fakeYandex(ready: Promise<void> = Promise.resolve(), hasSatellite = true) {
	const maps: FakeYandexMap[] = []
	class YMap {
		constructor(element: HTMLElement, props: { location: { center: Point; zoom: number } }) {
			const map = createMap(element, props.location)
			maps.push(map)
			return mapApi(map)
		}
	}
	const api = {
		ready,
		YMapDefaultSatelliteLayer: hasSatellite ? YMapDefaultSatelliteLayer : undefined,
		YMap,
		YMapDefaultSchemeLayer,
		YMapDefaultFeaturesLayer: Child,
		YMapListener,
		YMapMarker,
		YMapFeature,
	}
	;(window as unknown as { ymaps3?: unknown }).ymaps3 = api
	return { maps, remove: () => delete (window as unknown as { ymaps3?: unknown }).ymaps3 }
}
