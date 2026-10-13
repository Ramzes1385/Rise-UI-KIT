import { watch } from 'vue'
import { UI_MAP } from '@/locales/messages'
import { formatMessage } from '@/locales/state'
import { resolveColor } from '../providers/shapeColor'
import type { BaseMapProps, MapPolygon, MapPolyline } from '../../types/BaseMap.types'
import type { MapAdapter, MapResolvedScheme, MapShapeLine, MapShapes } from '../../types/providers.types'

const LINE_WIDTH = 4
const AREA_WIDTH = 2

function lineOf(area: HTMLElement | null, shape: MapPolyline | MapPolygon, width: number): MapShapeLine {
	return { id: shape.id, coordinates: shape.coordinates, color: resolveColor(area, shape.color), width: shape.width ?? width }
}

function buildShapes(area: HTMLElement | null, props: BaseMapProps): MapShapes {
	return {
		polylines: (props.polylines ?? []).map(shape => lineOf(area, shape, LINE_WIDTH)),
		polygons: (props.polygons ?? []).map(shape => lineOf(area, shape, AREA_WIDTH)),
	}
}

export function shapeLabels(props: BaseMapProps): string[] {
	const lines = (props.polylines ?? []).map(shape => shape.title ?? formatMessage(UI_MAP.POLYLINE, { id: String(shape.id) }))
	const areas = (props.polygons ?? []).map(shape => shape.title ?? formatMessage(UI_MAP.POLYGON, { id: String(shape.id) }))
	return [...lines, ...areas]
}

export function useMapShapes(
	props: BaseMapProps,
	adapter: { value: MapAdapter | null },
	deps: { area: { value: HTMLElement | null }; scheme: { value: MapResolvedScheme } },
): void {
	const apply = (): void => adapter.value?.setShapes(buildShapes(deps.area.value, props))
	watch(() => adapter.value, apply, { flush: 'sync' })
	watch(() => [props.polylines, props.polygons, deps.scheme.value], apply, { deep: true })
}
