import { vi } from 'vitest'

type Point = [number, number]

interface FakeYandexMap {
	element: HTMLElement
	location: { center: Point; zoom: number }
	children: object[]
	setLocation: ReturnType<typeof vi.fn>
	destroy: ReturnType<typeof vi.fn>
	listener: () => {
		onActionEnd: (event: { location: { center: Point; zoom: number } }) => void
		onClick: (object: unknown, event: { coordinates: Point }) => void
	}
	schemeLayer: () => { props: { theme?: string }; update: ReturnType<typeof vi.fn> }
	markers: () => { props: { coordinates: Point }; element: HTMLElement }[]
}

export function fakeYandex(ready: Promise<void> = Promise.resolve()) {
	const maps: FakeYandexMap[] = []
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
	class YMapListener extends Child {}
	class YMapMarker extends Child {}
	class YMap {
		constructor(element: HTMLElement, props: { location: { center: Point; zoom: number } }) {
			const map: FakeYandexMap = {
				element,
				location: props.location,
				children: [],
				setLocation: vi.fn(),
				destroy: vi.fn(),
				listener: () => (map.children.find(child => child instanceof YMapListener) as Child).props as never,
				schemeLayer: () => map.children.find(child => child instanceof YMapDefaultSchemeLayer) as never,
				markers: () => map.children.filter(child => child instanceof YMapMarker) as never,
			}
			maps.push(map)
			return {
				addChild: (child: Child) => {
					map.children.push(child)
					if (child.element) element.append(child.element)
				},
				removeChild: (child: Child) => {
					map.children = map.children.filter(item => item !== child)
					child.element?.remove()
				},
				setLocation: map.setLocation,
				destroy: map.destroy,
			}
		}
	}
	const api = { ready, YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer: Child, YMapListener, YMapMarker }
	;(window as unknown as { ymaps3?: unknown }).ymaps3 = api
	return { maps, remove: () => delete (window as unknown as { ymaps3?: unknown }).ymaps3 }
}
