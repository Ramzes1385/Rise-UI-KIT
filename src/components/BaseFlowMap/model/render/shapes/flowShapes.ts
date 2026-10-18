import type { FlowSize } from '../../types/data/flowData.types'
import type { FlowShapeDef } from '../../types/api/flowNotation.types'
import type { FlowShapeBuilder, FlowShapeView } from '../../types/internal/core/flowRenderInternal.types'

const RADIUS = 8
const NOTE_FOLD = 10

function round(width: number, height: number, radius: number): string {
	const r = Math.min(radius, width / 2, height / 2)
	return `M${r} 0H${width - r}A${r} ${r} 0 0 1 ${width} ${r}V${height - r}A${r} ${r} 0 0 1 ${width - r} ${height}H${r}A${r} ${r} 0 0 1 0 ${height - r}V${r}A${r} ${r} 0 0 1 ${r} 0Z`
}

function ellipse({ width, height }: FlowSize): string {
	const rx = width / 2
	const ry = height / 2
	return `M0 ${ry}A${rx} ${ry} 0 1 0 ${width} ${ry}A${rx} ${ry} 0 1 0 0 ${ry}Z`
}

function cylinder({ width, height }: FlowSize): FlowShapeView {
	const ry = Math.min(10, height / 4)
	const rx = width / 2
	return {
		path: `M0 ${ry}A${rx} ${ry} 0 0 1 ${width} ${ry}V${height - ry}A${rx} ${ry} 0 0 1 0 ${height - ry}Z`,
		inner: `M0 ${ry}A${rx} ${ry} 0 0 0 ${width} ${ry}`,
	}
}

function document({ width, height }: FlowSize): FlowShapeView {
	const base = height - 8
	return {
		path: `M0 0H${width}V${base}Q${width * 0.75} ${height + 4} ${width / 2} ${base}T0 ${base}Z`,
		inner: null,
	}
}

function person({ width, height }: FlowSize): FlowShapeView {
	const head = Math.min(width, height) * 0.18
	const cx = width / 2
	return {
		path: round(width, height, RADIUS),
		inner: `M${cx - head} ${head + 6}A${head} ${head} 0 1 0 ${cx + head} ${head + 6}A${head} ${head} 0 1 0 ${cx - head} ${head + 6}Z`,
	}
}

function note({ width, height }: FlowSize): FlowShapeView {
	return {
		path: `M0 0H${width - NOTE_FOLD}L${width} ${NOTE_FOLD}V${height}H0Z`,
		inner: `M${width - NOTE_FOLD} 0V${NOTE_FOLD}H${width}`,
	}
}

function open({ width, height }: FlowSize): FlowShapeView {
	return { path: `M${width} 0H0V${height}H${width}`, inner: `M14 0V${height}` }
}

const PLAIN: Record<string, (size: FlowSize) => string> = {
	rect: ({ width, height }) => `M0 0H${width}V${height}H0Z`,
	'round-rect': ({ width, height }) => round(width, height, RADIUS),
	pill: ({ width, height }) => round(width, height, height / 2),
	ellipse,
	circle: ellipse,
	diamond: ({ width, height }) => `M${width / 2} 0L${width} ${height / 2}L${width / 2} ${height}L0 ${height / 2}Z`,
	hexagon: ({ width, height }) => {
		const inset = Math.min(height / 2, width / 4)
		return `M${inset} 0H${width - inset}L${width} ${height / 2}L${width - inset} ${height}H${inset}L0 ${height / 2}Z`
	},
	parallelogram: ({ width, height }) => `M${width * 0.2} 0H${width}L${width * 0.8} ${height}H0Z`,
	'parallel-lines': ({ width, height }) => `M0 0H${width}M0 ${height}H${width}`,
}

const COMPOUND: Record<string, FlowShapeBuilder> = { cylinder, document, person, note, 'open-rect': open }

export function shapeView(def: FlowShapeDef, size: FlowSize): FlowShapeView {
	if (def.shape === 'path' && def.path) return { path: def.path(size), inner: null }
	const compound = COMPOUND[def.shape]
	if (compound) return compound(size)
	return { path: (PLAIN[def.shape] ?? PLAIN.rect)(size), inner: null }
}
