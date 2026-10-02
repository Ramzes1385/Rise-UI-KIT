import type { Ref } from 'vue'
import type { useMapCore } from '../model/useBaseImageMap'
import type { useImageMapPan } from '../model/zoom/useImageMapPan'
import type { useImageMapView } from '../model/zoom/useImageMapView'
import type { ImageMapDirectoryEntry } from './ImageMapDirectory.types'
import type { useImageMapFocus } from '../model/interaction/useImageMapFocus'
import type { useImageMapFilters } from '../model/directory/useImageMapFilters'
import type { useImageMapActions } from '../model/interaction/useImageMapActions'
import type { useImageMapOverlay } from '../model/interaction/useImageMapOverlay'
import type { ImageMapDirectoryGrouping, ImageMapWheelMode } from './BaseImageMap.types'
import type { ImageMapLayerView, ImageMapView, ResolvedImageMapObject } from './imageMapModel.types'
import type { ImageMapArea, ImageMapGroup, ImageMapLayer, ImageMapPoint } from './imageMapData.types'

/** Внутренние типы модели BaseImageMap: параметры composable и представления объектов для шаблона */

export interface ObjectsOptions {
	getView: () => ImageMapLayerView | undefined
	getState: (item: ResolvedImageMapObject) => ObjectState
}

export interface PointView {
	item: ResolvedImageMapObject
	point: ImageMapPoint
	tag: 'a' | 'button'
	attributes: Record<string, string | undefined>
	classes: Record<string, boolean>
	style: Record<string, string>
	isActive: boolean
}

export interface ShapeView {
	item: ResolvedImageMapObject
	geometry: ShapeGeometry
	attributes: Record<string, string | undefined>
	classes: Record<string, boolean>
}

export interface EventContext {
	overlay: ReturnType<typeof useImageMapOverlay>
	focus: ReturnType<typeof useImageMapFocus>
	actions: ReturnType<typeof useImageMapActions>
	zoom: ReturnType<typeof useImageMapView>
	pan: ReturnType<typeof useImageMapPan>
	consumeDrag: () => boolean
}

export interface ActionContext {
	stageRef: Ref<HTMLElement | null>
	localLayer: Ref<string | undefined>
	findObject: (id: string | null) => ResolvedImageMapObject | undefined
	layerOf: (id: string) => string | undefined
	openPopup: (id: string) => void
	zoomToArea: (area: ImageMapArea, scale?: number) => void
}

export interface Center {
	id: string
	x: number
	y: number
}

export interface OverlayOptions {
	rootRef: Ref<HTMLElement | null>
	stageRef: Ref<HTMLElement | null>
	findObject: (id: string | null) => ResolvedImageMapObject | undefined
	hasTooltip: () => boolean
	getSheetBreakpoint: () => number
}

export interface MapFocusOptions {
	stageRef: Ref<HTMLElement | null>
	getView: () => ImageMapLayerView | undefined
	getActive: () => string | null
	getRenderedSvgIds: () => ReadonlySet<string>
}

export interface SvgBinding {
	item: ResolvedImageMapObject
	elementId: string
	attributes: Record<string, string | undefined>
	classes: Record<string, boolean>
}

export interface SvgOptions {
	getLayer: () => ImageMapLayer | undefined
	containerRef: Ref<HTMLElement | null>
	getBindings: () => SvgBinding[]
	renderedIds: Ref<ReadonlySet<string>>
}

export interface ShapeGeometry {
	tag: 'rect' | 'ellipse' | 'polygon'
	attributes: Record<string, number | string>
}

export interface ObjectState {
	isTabbable: boolean
	describedBy?: string
	isActive: boolean
	isHovered: boolean
	isPulsing: boolean
}

export interface Frame {
	viewportWidth: number
	viewportHeight: number
	stageWidth: number
	stageHeight: number
}

export interface ScreenPoint {
	x: number
	y: number
}

export interface GestureView {
	view: Ref<ImageMapView>
	setView: (next: ImageMapView, animated: boolean) => void
	zoomBy: (factor: number, point?: ScreenPoint, animated?: boolean) => void
}

export interface GestureOptions {
	viewportRef: Ref<HTMLElement | null>
	getWheelMode: () => ImageMapWheelMode
	onInteract: () => void
}

export interface PointerStart {
	pointers: Map<number, ScreenPoint>
	view: ImageMapView
	distance: number
	center: ScreenPoint
}

export interface ViewOptions {
	viewportRef: Ref<HTMLElement | null>
	getLayer: () => ImageMapLayer | undefined
	getMaxZoom: () => number
	getInitArea: () => ImageMapArea | undefined
}

export interface ScreenBox {
	left: number
	top: number
	right: number
	bottom: number
}

export interface SectionsInput {
	entries: ImageMapDirectoryEntry[]
	groupBy: ImageMapDirectoryGrouping
	groups: ImageMapGroup[]
	locale: string
	otherTitle: string
}

export interface DirectoryContext {
	resolved: () => ResolvedImageMapObject[]
	layerOf: (id: string) => string | undefined
	getLayer: () => ImageMapLayer | undefined
	getActive: () => string | null
	getHover: () => string | null
	filters: ReturnType<typeof useImageMapFilters>
}

export type MapCore = ReturnType<typeof useMapCore>

export interface DeepLinkContext {
	findObject: (id: string | null) => ResolvedImageMapObject | undefined
	getActive: () => string | null
	activateFromLink: (id: string) => void
}
