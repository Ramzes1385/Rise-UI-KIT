import { vi } from 'vitest'

type Handler = (event: { latLng?: { lat: () => number; lng: () => number } | null }) => void

interface FakeShape {
	kind: string
	options: Record<string, unknown>
	setMap: ReturnType<typeof vi.fn>
}

interface MarkerRecord {
	map: unknown
	content: HTMLElement
	position: unknown
	title?: string
}

const shapeClass = (kind: string, shapes: FakeShape[]) =>
	class {
		kind = kind
		setMap = vi.fn()
		options: Record<string, unknown>
		constructor(options: Record<string, unknown>) {
			this.options = options
			shapes.push(this)
		}
	}

const markerClass = (markers: MarkerRecord[]) =>
	class AdvancedMarkerElement {
		map: unknown
		content: HTMLElement
		position: unknown
		title?: string
		constructor(options: MarkerRecord) {
			Object.assign(this, options)
			this.map = options.map
			this.content = options.content
			options.content.remove()
			document.body.querySelector('.base-map__canvas')?.append(options.content)
			markers.push(this)
		}
	}

export function fakeGoogle() {
	const listeners = new Map<string, Handler>()
	const markers: MarkerRecord[] = []
	const shapes: FakeShape[] = []
	const state = { center: { lat: 0, lng: 0 } as { lat: number; lng: number } | undefined, zoom: 0 as number | undefined }
	const map = {
		addListener: (name: string, handler: Handler) => {
			listeners.set(name, handler)
			return { remove: vi.fn() }
		},
		getCenter: () => (state.center ? { lat: () => state.center!.lat, lng: () => state.center!.lng } : undefined),
		getZoom: () => state.zoom,
		setCenter: vi.fn(),
		setZoom: vi.fn(),
		setMapTypeId: vi.fn(),
		setOptions: vi.fn(),
	}
	const GoogleMap = vi.fn(function (
		this: unknown,
		element: HTMLElement,
		options: { center: { lat: number; lng: number }; zoom: number },
	) {
		state.center = options.center
		state.zoom = options.zoom
		element.append(document.createElement('canvas'))
		return map
	})
	const clearInstanceListeners = vi.fn()
	const api = {
		Map: GoogleMap,
		Polyline: shapeClass('polyline', shapes),
		Polygon: shapeClass('polygon', shapes),
		marker: { AdvancedMarkerElement: markerClass(markers) },
		event: { clearInstanceListeners },
	}
	return {
		api,
		map,
		state,
		markers,
		shapes,
		clearInstanceListeners,
		emit: (name: string, event: Parameters<Handler>[0] = {}) => listeners.get(name)?.(event),
		install: () => ((window as unknown as { google?: unknown }).google = { maps: api }),
	}
}
