import { clamp, round } from '../geometry/editorGeometry'
import type { EditorFieldValue as FieldValue } from '../../types/imageMapEditorInternal.types'
import type { ImageMapObject, ImageMapStateStyle, ImageMapStyle } from '@components/BaseImageMap/types/imageMapData.types'

const GEOMETRY_KEYS: Record<string, string> = {
	'geo.x': 'x',
	'geo.y': 'y',
	'geo.width': 'width',
	'geo.height': 'height',
	'geo.rx': 'rx',
	'geo.ry': 'ry',
}

function isEmpty(value: FieldValue): boolean {
	return value === null || value === '' || value === false || (Array.isArray(value) && value.length === 0)
}

function setProperty(target: Record<string, unknown>, key: string, value: unknown): void {
	if (isEmpty(value as FieldValue) || value === undefined) delete target[key]
	else target[key] = value
}

export function parsePoints(value: string): [number, number][] | undefined {
	const points = value
		.split('\n')
		.map(line => line.trim())
		.filter(Boolean)
		.map(line => line.split(/[;,\s]+/).map(Number))
	if (points.length < 3 || points.some(point => point.length !== 2 || point.some(Number.isNaN))) return undefined
	return points.map(([x, y]) => [round(clamp((x as number) / 100)), round(clamp((y as number) / 100))])
}

function setStyle(object: ImageMapObject, key: keyof ImageMapStateStyle, value: FieldValue): void {
	const style = typeof object.style === 'object' ? object.style : {}
	const base: Record<string, unknown> = { ...style.base }
	setProperty(base, key, value)
	const next: ImageMapStyle = { ...style }
	if (Object.keys(base).length) next.base = base
	else delete next.base
	setProperty(object as unknown as Record<string, unknown>, 'style', Object.keys(next).length ? next : undefined)
}

export function applyField(object: ImageMapObject, key: string, value: FieldValue): void {
	const target = object as unknown as Record<string, unknown>
	const geometryKey = GEOMETRY_KEYS[key]
	if (geometryKey) {
		target[geometryKey] = round(clamp(Number(value ?? 0) / 100))
		return
	}
	if (key.startsWith('style.')) {
		setStyle(object, key.slice('style.'.length) as keyof ImageMapStateStyle, value)
		return
	}
	setProperty(target, key === 'styleName' ? 'style' : key, value)
}
