type Point = [number, number]

interface DemoLocation {
	center: Point
	zoom: number
}

interface DemoListenerProps {
	onActionEnd: (event: { location: DemoLocation }) => void
	onClick: (object: unknown, event: { coordinates: Point }) => void
}

const TILE = 256

const LAT_STRETCH = 1.7

class DemoMarker {
	readonly props: { coordinates: Point }
	readonly element: HTMLElement

	constructor(props: { coordinates: Point }, element: HTMLElement) {
		this.props = props
		this.element = element
	}
}

class DemoListener {
	readonly props: DemoListenerProps

	constructor(props: DemoListenerProps) {
		this.props = props
	}
}

class DemoLayer {
	readonly props: object

	constructor(props: object) {
		this.props = props
	}
}

class DemoMap {
	private markers: DemoMarker[] = []
	private listener: DemoListener | null = null
	private readonly layer = document.createElement('div')

	private readonly element: HTMLElement
	private props: { location: DemoLocation }

	constructor(element: HTMLElement, props: { location: DemoLocation }) {
		this.element = element
		this.props = props
		this.layer.className = 'story-demo-map'
		Object.assign(this.layer.style, {
			position: 'absolute',
			inset: '0',
			backgroundColor: 'var(--rise-bg-muted)',
			backgroundImage:
				'linear-gradient(var(--rise-border-muted) 1px, transparent 1px), linear-gradient(90deg, var(--rise-border-muted) 1px, transparent 1px)',
			backgroundSize: '48px 48px',
		})
		this.layer.addEventListener('click', event => this.handleClick(event))
		element.append(this.layer)
	}

	private scale(): number {
		return (TILE * 2 ** this.props.location.zoom) / 360
	}

	private place(marker: DemoMarker): void {
		const [lng, lat] = marker.props.coordinates
		const [centerLng, centerLat] = this.props.location.center
		const box = this.layer.getBoundingClientRect()
		marker.element.style.position = 'absolute'
		marker.element.style.left = `${box.width / 2 + (lng - centerLng) * this.scale()}px`
		marker.element.style.top = `${box.height / 2 + (centerLat - lat) * this.scale() * LAT_STRETCH}px`
	}

	private handleClick(event: MouseEvent): void {
		const box = this.layer.getBoundingClientRect()
		const [centerLng, centerLat] = this.props.location.center
		const lng = centerLng + (event.clientX - box.left - box.width / 2) / this.scale()
		const lat = centerLat - (event.clientY - box.top - box.height / 2) / (this.scale() * LAT_STRETCH)
		this.listener?.props.onClick(null, { coordinates: [Number(lng.toFixed(4)), Number(lat.toFixed(4))] })
	}

	addChild(child: object): void {
		if (child instanceof DemoListener) this.listener = child
		if (!(child instanceof DemoMarker)) return
		this.markers.push(child)
		this.layer.append(child.element)
		this.place(child)
	}

	removeChild(child: object): void {
		this.markers = this.markers.filter(marker => marker !== child)
		if (child instanceof DemoMarker) child.element.remove()
	}

	setLocation(location: DemoLocation): void {
		this.props = { location }
		for (const marker of this.markers) this.place(marker)
	}

	destroy(): void {
		this.layer.remove()
	}
}

const target = window as unknown as { ymaps3?: unknown }

let outerApi: unknown

let installed = 0

function restoreOuterApi(): void {
	if (outerApi === undefined) delete target.ymaps3
	else target.ymaps3 = outerApi
}

function demoReady(options: { isPending?: boolean; isFailing?: boolean }): Promise<void> {
	if (options.isFailing) return Promise.reject(new Error('demo: сервис недоступен'))
	return options.isPending ? new Promise(() => undefined) : Promise.resolve()
}

export function installDemoYandex(options: { isPending?: boolean; isFailing?: boolean } = {}): () => void {
	if (installed === 0) outerApi = target.ymaps3
	installed++
	target.ymaps3 = {
		get ready() {
			return demoReady(options)
		},
		YMap: DemoMap,
		YMapDefaultSchemeLayer: DemoLayer,
		YMapDefaultFeaturesLayer: DemoLayer,
		YMapListener: DemoListener,
		YMapMarker: DemoMarker,
	}
	let isActive = true
	return () => {
		if (!isActive) return
		isActive = false
		installed--
		if (installed === 0) restoreOuterApi()
	}
}
