import type { FlowSize } from '../../../types/data/flowData.types'
import type { FlowShapeMarker } from '../../../types/api/flowNotation.types'
import type { FlowPlacedMarker } from '../../../types/internal/flowShapeMarkers.types'

const PAD = 6
const SIGN = 16
const CENTER_SIGN = 20

function horizontal(placement: FlowShapeMarker['placement'], width: number): Pick<FlowPlacedMarker, 'x' | 'anchor'> {
	if (placement.endsWith('start')) return { x: PAD, anchor: 'start' }
	if (placement.endsWith('end')) return { x: width - PAD, anchor: 'end' }
	return { x: width / 2, anchor: 'middle' }
}

function vertical(placement: FlowShapeMarker['placement'], height: number): number {
	if (placement === 'center') return height / 2
	return placement.startsWith('top') ? PAD + 5 : height - PAD - 5
}

function placeOne(marker: FlowShapeMarker, size: FlowSize, index: number): FlowPlacedMarker {
	const { x, anchor } = horizontal(marker.placement, size.width)
	const y = vertical(marker.placement, size.height)
	const sign = marker.placement === 'center' ? CENTER_SIGN : SIGN
	const left = x + { start: 0, middle: -sign / 2, end: -sign }[anchor]
	return {
		key: `${index}:${marker.placement}`,
		text: marker.text,
		path: marker.path,
		x: marker.path ? left : x,
		y: marker.path ? y - sign / 2 : y,
		anchor,
		scale: sign / 24,
		isFilled: marker.isFilled === true,
	}
}

export function placeMarkers(markers: readonly FlowShapeMarker[], size: FlowSize): FlowPlacedMarker[] {
	return markers.filter(marker => marker.text || marker.path).map((marker, index) => placeOne(marker, size, index))
}
