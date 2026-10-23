type Point = [number, number]

interface DemoLocation {
	center: Point
	zoom: number
}

interface DemoListenerProps {
	onActionEnd: (event: { location: DemoLocation }) => void
	onClick: (object: unknown, event: { coordinates: Point }) => void
}

interface DemoFeatureProps {
	geometry: { type: string; coordinates: Point[] | Point[][] }
	style: { stroke: { color: string; width: number }[]; fill?: string; fillOpacity?: number }
}

interface DemoBaseProps {
	theme?: string
	customization?: object[]
}

const TILE = 256

const LAT_STRETCH = 1.7

const DRAG_THRESHOLD = 3

const MAX_ZOOM = 21

const SVG_NS = 'http://www.w3.org/2000/svg'

const GRID =
	'linear-gradient(var(--rise-border-muted) 1px, transparent 1px), linear-gradient(90deg, var(--rise-border-muted) 1px, transparent 1px)'

const SATELLITE = 'linear-gradient(135deg, var(--rise-success), var(--rise-info) 55%, var(--rise-primary))'

class DemoMarker {
	readonly props: { coordinates: Point }
	readonly element: HTMLElement

	constructor(props: { coordinates: Point }, element: HTMLElement) {
		this.props = props
		this.element = element
	}
}

class DemoFeature {
	readonly props: DemoFeatureProps

	constructor(props: DemoFeatureProps) {
		this.props = props
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

class DemoBaseLayer {
	readonly kind: 'scheme' | 'satellite'
	props: DemoBaseProps
	changed: (() => void) | null = null

	constructor(kind: 'scheme' | 'satellite', props: DemoBaseProps) {
		this.kind = kind
		this.props = props
	}

	update(props: DemoBaseProps): void {
		this.props = { ...this.props, ...props }
		this.changed?.()
	}
}

class DemoSchemeLayer extends DemoBaseLayer {
	constructor(props: DemoBaseProps) {
		super('scheme', props)
	}
}

class DemoSatelliteLayer extends DemoBaseLayer {
	constructor(props: DemoBaseProps) {
		super('satellite', props)
	}
}

class DemoMap {
	private markers: DemoMarker[] = []
	private features: DemoFeature[] = []
	private bases: DemoBaseLayer[] = []
	private behaviors = new Set<string>()
	private listener: DemoListener | null = null
	private drag: { x: number; y: number; isMoved: boolean } | null = null
	private isDragged = false
	private theme = 'light'
	private readonly layer = document.createElement('div')
	private readonly shapes = document.createElementNS(SVG_NS, 'svg')

	private props: { location: DemoLocation }

	constructor(element: HTMLElement, props: { location: DemoLocation }) {
		this.props = props
		this.layer.className = 'story-demo-map'
		Object.assign(this.layer.style, { position: 'absolute', inset: '0', touchAction: 'none' })
		Object.assign(this.shapes.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', pointerEvents: 'none' })
		this.shapes.setAttribute('class', 'story-demo-shapes')
		this.shapes.setAttribute('aria-hidden', 'true')
		this.layer.addEventListener('click', event => this.handleClick(event))
		this.layer.addEventListener('wheel', event => this.handleWheel(event), { passive: false })
		this.layer.addEventListener('pointerdown', event => this.startDrag(event))
		this.layer.addEventListener('pointermove', event => this.moveDrag(event))
		this.layer.addEventListener('pointerup', () => this.endDrag())
		this.layer.addEventListener('pointerleave', () => this.endDrag())
		this.layer.append(this.shapes)
		this.paint()
		element.append(this.layer)
	}

	private scale(): number {
		return (TILE * 2 ** this.props.location.zoom) / 360
	}

	private project([lng, lat]: Point, box: DOMRect): Point {
		const [centerLng, centerLat] = this.props.location.center
		return [box.width / 2 + (lng - centerLng) * this.scale(), box.height / 2 + (centerLat - lat) * this.scale() * LAT_STRETCH]
	}

	private place(marker: DemoMarker): void {
		const [left, top] = this.project(marker.props.coordinates, this.layer.getBoundingClientRect())
		marker.element.style.position = 'absolute'
		marker.element.style.left = `${left}px`
		marker.element.style.top = `${top}px`
	}

	private shapeOf(feature: DemoFeature, box: DOMRect): SVGElement {
		const { geometry, style } = feature.props
		const isPolygon = geometry.type === 'Polygon'
		const vertices = isPolygon ? (geometry.coordinates as Point[][])[0]! : (geometry.coordinates as Point[])
		const [stroke] = style.stroke
		const shape = document.createElementNS(SVG_NS, isPolygon ? 'polygon' : 'polyline')
		shape.setAttribute('points', vertices.map(point => this.project(point, box).join(',')).join(' '))
		shape.setAttribute('stroke', stroke!.color)
		shape.setAttribute('stroke-width', String(stroke!.width))
		shape.setAttribute('stroke-linecap', 'round')
		shape.setAttribute('stroke-linejoin', 'round')
		shape.setAttribute('fill', style.fill ?? 'none')
		shape.setAttribute('fill-opacity', String(style.fillOpacity ?? 1))
		return shape
	}

	private draw(): void {
		const box = this.layer.getBoundingClientRect()
		this.shapes.replaceChildren(...this.features.map(feature => this.shapeOf(feature, box)))
	}

	private refresh(): void {
		for (const marker of this.markers) this.place(marker)
		this.draw()
	}

	private paint(): void {
		const scheme = this.bases.find(base => base.kind === 'scheme')
		const isSatellite = this.bases.some(base => base.kind === 'satellite')
		this.theme = scheme?.props.theme ?? this.theme
		const kind = ['scheme', 'hybrid', 'satellite'][Number(isSatellite) * (scheme ? 1 : 2)]
		const images = [scheme ? GRID : '', isSatellite ? SATELLITE : ''].filter(Boolean)
		const sizes = [scheme ? '48px 48px, 48px 48px' : '', isSatellite ? '100% 100%' : ''].filter(Boolean)
		Object.assign(this.layer.dataset, { scheme: this.theme, layer: kind })
		this.layer.setAttribute('data-theme', this.theme)
		this.layer.style.backgroundColor = isSatellite ? 'transparent' : 'var(--rise-bg-muted)'
		this.layer.style.backgroundImage = images.join(', ')
		this.layer.style.backgroundSize = sizes.join(', ')
	}

	private notify(): void {
		this.listener?.props.onActionEnd({ location: this.props.location })
	}

	private handleClick(event: MouseEvent): void {
		if (this.isDragged) {
			this.isDragged = false
			return
		}
		const box = this.layer.getBoundingClientRect()
		const [centerLng, centerLat] = this.props.location.center
		const lng = centerLng + (event.clientX - box.left - box.width / 2) / this.scale()
		const lat = centerLat - (event.clientY - box.top - box.height / 2) / (this.scale() * LAT_STRETCH)
		this.listener?.props.onClick(null, { coordinates: [Number(lng.toFixed(4)), Number(lat.toFixed(4))] })
	}

	private handleWheel(event: WheelEvent): void {
		if (!this.behaviors.has('scrollZoom')) return
		event.preventDefault()
		const zoom = Math.max(0, Math.min(MAX_ZOOM, this.props.location.zoom + (event.deltaY < 0 ? 1 : -1)))
		this.setLocation({ center: this.props.location.center, zoom })
		this.notify()
	}

	private startDrag(event: PointerEvent): void {
		if (!this.behaviors.has('drag') || event.button !== 0) return
		this.drag = { x: event.clientX, y: event.clientY, isMoved: false }
	}

	private moveDrag(event: PointerEvent): void {
		if (!this.drag) return
		const dx = event.clientX - this.drag.x
		const dy = event.clientY - this.drag.y
		if (!this.drag.isMoved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return
		const [lng, lat] = this.props.location.center
		this.drag = { x: event.clientX, y: event.clientY, isMoved: true }
		this.setLocation({ center: [lng - dx / this.scale(), lat + dy / (this.scale() * LAT_STRETCH)], zoom: this.props.location.zoom })
	}

	private endDrag(): void {
		if (!this.drag) return
		this.isDragged = this.drag.isMoved
		this.drag = null
		if (this.isDragged) this.notify()
	}

	addChild(child: object): void {
		if (child instanceof DemoListener) this.listener = child
		if (child instanceof DemoBaseLayer) {
			this.bases.push(child)
			child.changed = () => this.paint()
			this.paint()
		}
		if (child instanceof DemoFeature) {
			this.features.push(child)
			this.draw()
		}
		if (!(child instanceof DemoMarker)) return
		this.markers.push(child)
		this.layer.append(child.element)
		this.place(child)
	}

	removeChild(child: object): void {
		this.markers = this.markers.filter(marker => marker !== child)
		this.features = this.features.filter(feature => feature !== child)
		if (child instanceof DemoBaseLayer) {
			this.bases = this.bases.filter(base => base !== child)
			child.changed = null
			this.paint()
		}
		if (child instanceof DemoMarker) child.element.remove()
		this.draw()
	}

	setBehaviors(behaviors: string[]): void {
		this.behaviors = new Set(behaviors)
	}

	setLocation(location: DemoLocation): void {
		this.props = { location }
		this.refresh()
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

interface DemoOptions {
	isPending?: boolean
	isFailing?: boolean
	delay?: number
}

function demoReady(options: DemoOptions): Promise<void> {
	if (options.isFailing) return Promise.reject(new Error('demo: сервис недоступен'))
	if (options.isPending) return new Promise(() => undefined)
	return options.delay ? new Promise(resolve => setTimeout(resolve, options.delay)) : Promise.resolve()
}

export function installDemoYandex(options: DemoOptions = {}): () => void {
	if (installed === 0) outerApi = target.ymaps3
	installed++
	target.ymaps3 = {
		get ready() {
			return demoReady(options)
		},
		YMap: DemoMap,
		YMapDefaultSchemeLayer: DemoSchemeLayer,
		YMapDefaultSatelliteLayer: DemoSatelliteLayer,
		YMapDefaultFeaturesLayer: DemoLayer,
		YMapFeature: DemoFeature,
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
