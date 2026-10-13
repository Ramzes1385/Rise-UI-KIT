import { vi } from 'vitest'

type Handler = (event: { latLng?: { lat: () => number; lng: () => number } | null }) => void

export function fakeGoogle() {
	const listeners = new Map<string, Handler>()
	const markers: { map: unknown; content: HTMLElement; position: unknown; title?: string }[] = []
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
	class AdvancedMarkerElement {
		map: unknown
		content: HTMLElement
		position: unknown
		title?: string
		constructor(options: { map: unknown; content: HTMLElement; position: unknown; title?: string }) {
			Object.assign(this, options)
			this.map = options.map
			this.content = options.content
			options.content.remove()
			document.body.querySelector('.base-map__canvas')?.append(options.content)
			markers.push(this)
		}
	}
	const clearInstanceListeners = vi.fn()
	const api = { Map: GoogleMap, marker: { AdvancedMarkerElement }, event: { clearInstanceListeners } }
	return {
		api,
		map,
		state,
		markers,
		clearInstanceListeners,
		emit: (name: string, event: Parameters<Handler>[0] = {}) => listeners.get(name)?.(event),
		install: () => ((window as unknown as { google?: unknown }).google = { maps: api }),
	}
}
